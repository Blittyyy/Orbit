/** Visual-only solar system orbit layout — not tied to gameplay. */
export const SOLAR_MERCURY_ORBIT_RX_FACTOR = 0.1;
export const SOLAR_MERCURY_ORBIT_RY_FACTOR = 0.044;
export const SOLAR_VENUS_ORBIT_RX_FACTOR = 0.14;
export const SOLAR_VENUS_ORBIT_RY_FACTOR = 0.06;
export const SOLAR_EARTH_ORBIT_RX_FACTOR = 0.18;
export const SOLAR_EARTH_ORBIT_RY_FACTOR = 0.078;
export const SOLAR_MARS_ORBIT_RX_FACTOR = 0.235;
export const SOLAR_MARS_ORBIT_RY_FACTOR = 0.1;
export const SOLAR_JUPITER_ORBIT_RX_FACTOR = 0.325;
export const SOLAR_JUPITER_ORBIT_RY_FACTOR = 0.14;
export const SOLAR_SATURN_ORBIT_RX_FACTOR = 0.41;
export const SOLAR_SATURN_ORBIT_RY_FACTOR = 0.175;
export const SOLAR_URANUS_ORBIT_RX_FACTOR = 0.49;
export const SOLAR_URANUS_ORBIT_RY_FACTOR = 0.21;
export const SOLAR_NEPTUNE_ORBIT_RX_FACTOR = 0.575;
export const SOLAR_NEPTUNE_ORBIT_RY_FACTOR = 0.245;

export const SOLAR_MERCURY_ANGULAR_SPEED = 0.34;
export const SOLAR_VENUS_ANGULAR_SPEED = 0.27;
export const SOLAR_EARTH_ANGULAR_SPEED = 0.22;
export const SOLAR_MARS_ANGULAR_SPEED = 0.14;
export const SOLAR_JUPITER_ANGULAR_SPEED = 0.08;
export const SOLAR_SATURN_ANGULAR_SPEED = 0.055;
export const SOLAR_URANUS_ANGULAR_SPEED = 0.04;
export const SOLAR_NEPTUNE_ANGULAR_SPEED = 0.03;

export interface SolarOrbitPosition {
  x: number;
  y: number;
}

export function getSolarOrbitPosition(
  centerX: number,
  centerY: number,
  orbitRadiusX: number,
  orbitRadiusY: number,
  angle: number,
): SolarOrbitPosition {
  return {
    x: centerX + Math.cos(angle) * orbitRadiusX,
    y: centerY + Math.sin(angle) * orbitRadiusY,
  };
}

/** Uniform scale so the outermost orbit fits the visible map area. */
export function getSolarOrbitFitScale(
  width: number,
  height: number,
  centerY: number,
  options?: {
    horizontalPadding?: number;
    topPadding?: number;
    bottomReserve?: number;
  },
): number {
  const horizontalPadding = options?.horizontalPadding ?? 20;
  const topPadding = options?.topPadding ?? 12;
  const bottomReserve = options?.bottomReserve ?? 190;

  const maxRx = width * SOLAR_NEPTUNE_ORBIT_RX_FACTOR;
  const maxRy = width * SOLAR_NEPTUNE_ORBIT_RY_FACTOR;
  const availableX = width / 2 - horizontalPadding;
  const availableYAbove = Math.max(centerY - topPadding, 1);
  const availableYBelow = Math.max(height - centerY - bottomReserve, 1);
  const availableY = Math.min(availableYAbove, availableYBelow);

  return Math.min(1, availableX / maxRx, availableY / maxRy);
}
