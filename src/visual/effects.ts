import { STARS, type Star } from '../rendering/stars';

export const REDUCED_GLOW_SCALE = 0.42;
export const REDUCED_PARTICLE_SCALE = 0.35;

export function scaleGlowOpacity(opacity: number, reduceEffects: boolean): number {
  if (!reduceEffects) {
    return opacity;
  }

  return opacity * REDUCED_GLOW_SCALE;
}

export function particleCount(fullCount: number, reduceEffects: boolean): number {
  if (!reduceEffects) {
    return fullCount;
  }

  return Math.max(1, Math.round(fullCount * REDUCED_PARTICLE_SCALE));
}

export function getVisibleStars(reduceEffects: boolean): readonly Star[] {
  if (!reduceEffects) {
    return STARS;
  }

  return STARS.filter((star, index) => star.layer !== 'far' && index % 2 === 0);
}

export function getVisibleStreakAngles(
  angles: readonly number[],
  reduceEffects: boolean,
): readonly number[] {
  if (!reduceEffects) {
    return angles;
  }

  return angles.filter((_, index) => index % 3 === 0);
}

export function scaleRgbaAlpha(color: string, reduceEffects: boolean): string {
  if (!reduceEffects) {
    return color;
  }

  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i,
  );

  if (!match) {
    return color;
  }

  const currentAlpha = match[4] !== undefined ? Number(match[4]) : 1;
  const alpha = Number.isFinite(currentAlpha)
    ? currentAlpha * REDUCED_GLOW_SCALE
    : REDUCED_GLOW_SCALE;

  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Math.max(0, Math.min(1, alpha))})`;
}
