export interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  tint: 'white' | 'blue' | 'violet';
  layer: 'far' | 'mid' | 'near';
}

function starColor(star: Star): string {
  if (star.tint === 'blue') {
    return `rgba(191, 219, 254, ${star.opacity})`;
  }

  if (star.tint === 'violet') {
    return `rgba(196, 181, 253, ${star.opacity})`;
  }

  return `rgba(255, 255, 255, ${star.opacity})`;
}

export function getStarColor(star: Star): string {
  return starColor(star);
}

/** Deterministic star field so the background stays stable across renders. */
export const STARS: Star[] = Array.from({ length: 110 }, (_, index) => {
  const seed = (index + 1) * 9301 + 49297;
  const normalized = (seed % 233280) / 233280;
  const layerRoll = (seed * 3) % 100;

  const layer: Star['layer'] =
    layerRoll < 55 ? 'far' : layerRoll < 85 ? 'mid' : 'near';

  const radius =
    layer === 'far'
      ? 0.45 + normalized * 0.55
      : layer === 'mid'
        ? 0.75 + normalized * 0.9
        : 1.1 + normalized * 1.2;

  const opacity =
    layer === 'far'
      ? 0.12 + normalized * 0.22
      : layer === 'mid'
        ? 0.22 + normalized * 0.38
        : 0.35 + normalized * 0.5;

  const tintRoll = (seed * 11) % 100;
  const tint: Star['tint'] =
    tintRoll < 70 ? 'white' : tintRoll < 88 ? 'blue' : 'violet';

  return {
    x: ((seed * 7) % 1000) / 1000,
    y: ((seed * 13) % 1000) / 1000,
    radius,
    opacity,
    tint,
    layer,
  };
});
