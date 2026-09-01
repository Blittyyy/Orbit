/** Visual-only satellite/station orbit — not tied to gameplay production. */
import {
  DEFAULT_SATELLITE_VISIBLE_COUNTS,
  getVisibleObjectCount,
  type VisibleCountThreshold,
} from '../config/planets';

export const SATELLITE_ORBIT_ANGULAR_SPEED = 0.95;
export const STATION_ORBIT_ANGULAR_SPEED = 0.72;

export const SATELLITE_ORBIT_RADIUS_X_FACTOR = 1.22;
export const SATELLITE_ORBIT_RADIUS_Y_FACTOR = 0.34;

/** Slightly tighter orbit for floating station / harvester placeholders. */
export const STATION_ORBIT_RADIUS_X_FACTOR = 1.08;
export const STATION_ORBIT_RADIUS_Y_FACTOR = 0.3;

export interface SatelliteOrbitPosition {
  x: number;
  y: number;
  isBehindEarth: boolean;
}

export function getVisibleSatelliteCount(
  satelliteLevel: number,
  thresholds: VisibleCountThreshold[] = DEFAULT_SATELLITE_VISIBLE_COUNTS,
): number {
  return getVisibleObjectCount(satelliteLevel, thresholds);
}

export function getSatelliteOrbitPosition(
  centerX: number,
  centerY: number,
  earthRadius: number,
  angle: number,
  radiusXFactor = SATELLITE_ORBIT_RADIUS_X_FACTOR,
  radiusYFactor = SATELLITE_ORBIT_RADIUS_Y_FACTOR,
): SatelliteOrbitPosition {
  const orbitRadiusX = earthRadius * radiusXFactor;
  const orbitRadiusY = earthRadius * radiusYFactor;

  return {
    x: centerX + Math.cos(angle) * orbitRadiusX,
    y: centerY + Math.sin(angle) * orbitRadiusY,
    isBehindEarth: Math.sin(angle) < 0,
  };
}

export function getSatelliteOrbitPositions(
  centerX: number,
  centerY: number,
  earthRadius: number,
  baseAngle: number,
  count: number,
  radiusXFactor = SATELLITE_ORBIT_RADIUS_X_FACTOR,
  radiusYFactor = SATELLITE_ORBIT_RADIUS_Y_FACTOR,
): SatelliteOrbitPosition[] {
  if (count <= 0) {
    return [];
  }

  const spacing = (Math.PI * 2) / count;

  return Array.from({ length: count }, (_, index) =>
    getSatelliteOrbitPosition(
      centerX,
      centerY,
      earthRadius,
      baseAngle + index * spacing,
      radiusXFactor,
      radiusYFactor,
    ),
  );
}

export function makeSatelliteOrbitEllipsePath(
  centerX: number,
  centerY: number,
  earthRadius: number,
  radiusXFactor = SATELLITE_ORBIT_RADIUS_X_FACTOR,
  radiusYFactor = SATELLITE_ORBIT_RADIUS_Y_FACTOR,
) {
  return {
    cx: centerX,
    cy: centerY,
    rx: earthRadius * radiusXFactor,
    ry: earthRadius * radiusYFactor,
  };
}
