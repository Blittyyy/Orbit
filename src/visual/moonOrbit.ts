/** Visual-only orbit configuration — not tied to gameplay. */
export const MOON_ORBIT_ANGULAR_SPEED = 0.45;

export const MOON_ORBIT_RADIUS_X_FACTOR = 1.55;
export const MOON_ORBIT_RADIUS_Y_FACTOR = 0.42;

export interface MoonOrbitPosition {
  x: number;
  y: number;
  isBehindEarth: boolean;
}

export function getMoonOrbitPosition(
  centerX: number,
  centerY: number,
  earthRadius: number,
  angle: number,
): MoonOrbitPosition {
  const orbitRadiusX = earthRadius * MOON_ORBIT_RADIUS_X_FACTOR;
  const orbitRadiusY = earthRadius * MOON_ORBIT_RADIUS_Y_FACTOR;

  return {
    x: centerX + Math.cos(angle) * orbitRadiusX,
    y: centerY + Math.sin(angle) * orbitRadiusY,
    isBehindEarth: Math.sin(angle) < 0,
  };
}

export function getMoonOrbitPositions(
  centerX: number,
  centerY: number,
  earthRadius: number,
  baseAngle: number,
  count: number,
): MoonOrbitPosition[] {
  if (count <= 0) {
    return [];
  }

  const spacing = (Math.PI * 2) / count;

  return Array.from({ length: count }, (_, index) =>
    getMoonOrbitPosition(
      centerX,
      centerY,
      earthRadius,
      baseAngle + index * spacing,
    ),
  );
}

export function makeOrbitEllipsePath(
  centerX: number,
  centerY: number,
  earthRadius: number,
) {
  const orbitRadiusX = earthRadius * MOON_ORBIT_RADIUS_X_FACTOR;
  const orbitRadiusY = earthRadius * MOON_ORBIT_RADIUS_Y_FACTOR;

  return {
    cx: centerX,
    cy: centerY,
    rx: orbitRadiusX,
    ry: orbitRadiusY,
  };
}
