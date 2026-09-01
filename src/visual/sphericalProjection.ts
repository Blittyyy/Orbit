import { SURFACE_PERIOD } from './constants';

const TWO_PI = Math.PI * 2;
const HORIZON_EPSILON = 0.03;

export type SpherePoint = readonly [longitude: number, latitude: number];

export interface ProjectedPoint {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Maps flat disk coordinates to longitude/latitude on a unit sphere. */
export function flatToSphere(nx: number, ny: number): SpherePoint {
  let x = nx;
  let y = ny;
  const radiusSquared = x * x + y * y;

  if (radiusSquared > 1) {
    const scale = 1 / Math.sqrt(radiusSquared);
    x *= scale;
    y *= scale;
  }

  const depth = Math.sqrt(Math.max(0, 1 - x * x - y * y));
  const longitude = Math.atan2(x, depth);
  const latitude = Math.asin(clamp(y, -0.999, 0.999));

  return [longitude, latitude];
}

export function surfaceOffsetToRotation(surfaceOffset: number): number {
  return (surfaceOffset / SURFACE_PERIOD) * TWO_PI;
}

function getRotatedLongitude(
  longitude: number,
  rotation: number,
  longitudeWrap: number,
): number {
  return longitude + longitudeWrap * TWO_PI - rotation;
}

export function projectSpherePoint(
  longitude: number,
  latitude: number,
  rotation: number,
  longitudeWrap = 0,
): ProjectedPoint | null {
  const rotatedLongitude = getRotatedLongitude(longitude, rotation, longitudeWrap);

  if (Math.cos(rotatedLongitude) <= HORIZON_EPSILON) {
    return null;
  }

  const cosLatitude = Math.cos(latitude);

  return {
    x: cosLatitude * Math.sin(rotatedLongitude),
    y: Math.sin(latitude),
  };
}

function intersectAtRotatedLongitude(
  start: SpherePoint,
  end: SpherePoint,
  targetRotatedLongitude: number,
  rotation: number,
  longitudeWrap: number,
): SpherePoint {
  const startRotated = getRotatedLongitude(start[0], rotation, longitudeWrap);
  const endRotated = getRotatedLongitude(end[0], rotation, longitudeWrap);
  const blend =
    (targetRotatedLongitude - startRotated) / (endRotated - startRotated);
  const latitude = start[1] + blend * (end[1] - start[1]);
  const longitude = targetRotatedLongitude + rotation - longitudeWrap * TWO_PI;

  return [longitude, latitude];
}

function clipPolygonToHemisphere(
  points: readonly SpherePoint[],
  rotation: number,
  longitudeWrap: number,
): SpherePoint[] {
  const rightHorizon = Math.PI / 2 - HORIZON_EPSILON;
  const leftHorizon = -Math.PI / 2 + HORIZON_EPSILON;

  const clip = (
    input: SpherePoint[],
    isInside: (rotatedLongitude: number) => boolean,
    intersect: (
      start: SpherePoint,
      end: SpherePoint,
      targetRotatedLongitude: number,
    ) => SpherePoint,
    targetRotatedLongitude: number,
  ): SpherePoint[] => {
    if (input.length === 0) {
      return [];
    }

    const output: SpherePoint[] = [];

    for (let index = 0; index < input.length; index += 1) {
      const current = input[index];
      const previous = input[(index + input.length - 1) % input.length];
      const currentRotated = getRotatedLongitude(current[0], rotation, longitudeWrap);
      const previousRotated = getRotatedLongitude(previous[0], rotation, longitudeWrap);
      const currentInside = isInside(currentRotated);
      const previousInside = isInside(previousRotated);

      if (currentInside) {
        if (!previousInside) {
          output.push(intersect(previous, current, targetRotatedLongitude));
        }
        output.push(current);
      } else if (previousInside) {
        output.push(intersect(previous, current, targetRotatedLongitude));
      }
    }

    return output;
  };

  let clipped = [...points];

  clipped = clip(
    clipped,
    (rotatedLongitude) => rotatedLongitude <= rightHorizon,
    (start, end, targetRotatedLongitude) =>
      intersectAtRotatedLongitude(start, end, targetRotatedLongitude, rotation, longitudeWrap),
    rightHorizon,
  );

  clipped = clip(
    clipped,
    (rotatedLongitude) => rotatedLongitude >= leftHorizon,
    (start, end, targetRotatedLongitude) =>
      intersectAtRotatedLongitude(start, end, targetRotatedLongitude, rotation, longitudeWrap),
    leftHorizon,
  );

  return clipped;
}

export function projectSphericalPolygon(
  points: readonly SpherePoint[],
  rotation: number,
  longitudeWrap: number,
): ProjectedPoint[] {
  const clipped = clipPolygonToHemisphere(points, rotation, longitudeWrap);
  const projected: ProjectedPoint[] = [];

  for (const [longitude, latitude] of clipped) {
    const point = projectSpherePoint(longitude, latitude, rotation, longitudeWrap);

    if (point) {
      projected.push(point);
    }
  }

  return projected;
}

export const LONGITUDE_WRAP_OFFSETS = [-1, 0, 1] as const;
