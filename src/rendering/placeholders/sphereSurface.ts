import { Skia, type SkPath } from '@shopify/react-native-skia';

import {
  LONGITUDE_WRAP_OFFSETS,
  projectSpherePoint,
  projectSphericalPolygon,
  type SpherePoint,
} from '../../visual/sphericalProjection';

export interface SphereBlobFeature {
  longitude: number;
  latitude: number;
  /** Angular radius in radians. */
  radius: number;
  color: string;
  opacity: number;
}

/** Build a small spherical polygon around a lon/lat center. */
export function makeSphereBlobPolygon(
  longitude: number,
  latitude: number,
  angularRadius: number,
  segments = 12,
): SpherePoint[] {
  const points: SpherePoint[] = [];
  const cosLat = Math.cos(latitude);

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const dLon = (Math.cos(angle) * angularRadius) / Math.max(0.25, cosLat);
    const dLat = Math.sin(angle) * angularRadius;
    points.push([
      longitude + dLon,
      Math.max(-1.2, Math.min(1.2, latitude + dLat)),
    ]);
  }

  return points;
}

export function projectedBlobPath(
  centerX: number,
  centerY: number,
  planetRadius: number,
  feature: SphereBlobFeature,
  rotation: number,
): SkPath | null {
  const polygon = makeSphereBlobPolygon(
    feature.longitude,
    feature.latitude,
    feature.radius,
  );
  const path = Skia.Path.Make();
  let started = false;

  for (const wrap of LONGITUDE_WRAP_OFFSETS) {
    const projected = projectSphericalPolygon(polygon, rotation, wrap);
    if (projected.length < 3) {
      continue;
    }

    for (let i = 0; i < projected.length; i += 1) {
      const x = centerX + projected[i]!.x * planetRadius;
      const y = centerY + projected[i]!.y * planetRadius;
      if (i === 0) {
        if (!started) {
          path.moveTo(x, y);
          started = true;
        } else {
          path.moveTo(x, y);
        }
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
  }

  return started ? path : null;
}

/**
 * Project a round feature as a foreshortened ellipse (spot / crater).
 * Returns null when on the far side of the globe.
 */
export function projectedSpotEllipse(
  centerX: number,
  centerY: number,
  planetRadius: number,
  longitude: number,
  latitude: number,
  radiusScale: number,
  rotation: number,
): { cx: number; cy: number; rx: number; ry: number } | null {
  for (const wrap of LONGITUDE_WRAP_OFFSETS) {
    const point = projectSpherePoint(longitude, latitude, rotation, wrap);
    if (!point) {
      continue;
    }

    const rotatedLon = longitude + wrap * Math.PI * 2 - rotation;
    const depth = Math.max(0.12, Math.cos(rotatedLon) * Math.cos(latitude));
    const base = planetRadius * radiusScale;

    return {
      cx: centerX + point.x * planetRadius,
      cy: centerY + point.y * planetRadius,
      rx: base * depth,
      ry: base * (0.55 + 0.45 * Math.abs(Math.cos(latitude))),
    };
  }

  return null;
}

/** Default land-mass blobs for terrestrial placeholder planets. */
export const TERRESTRIAL_SURFACE_BLOBS: SphereBlobFeature[] = [
  { longitude: -0.55, latitude: 0.18, radius: 0.42, color: '', opacity: 0.55 },
  { longitude: 0.85, latitude: -0.12, radius: 0.32, color: '', opacity: 0.42 },
  { longitude: 0.15, latitude: 0.48, radius: 0.24, color: '', opacity: 0.38 },
  { longitude: 2.2, latitude: -0.35, radius: 0.28, color: '', opacity: 0.36 },
  { longitude: -2.0, latitude: 0.05, radius: 0.3, color: '', opacity: 0.4 },
  { longitude: 1.5, latitude: 0.55, radius: 0.2, color: '', opacity: 0.32 },
];
