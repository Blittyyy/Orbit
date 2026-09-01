import type { MoonVisualConfig } from '../../config/celestial';
import { useCelestialAsset } from './useCelestialAsset';
import {
  PlaceholderMoon,
  type MoonCosmeticTier,
} from '../placeholders/PlaceholderMoon';

interface MoonBodyViewProps {
  config: MoonVisualConfig;
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
  cosmeticTier?: MoonCosmeticTier;
}

/**
 * Renders a moon using final assets when available, otherwise a placeholder sphere.
 */
export function MoonBodyView({
  config,
  x,
  y,
  earthRadius,
  unlockFlash = 0,
  cosmeticTier,
}: MoonBodyViewProps) {
  const moonRadius = earthRadius * 0.18 * (config.placeholderRadiusScale ?? 1);
  const texture = useCelestialAsset(config.assets.texture);

  if (texture !== null) {
    // Future: textured moon renderer.
  }

  return (
    <PlaceholderMoon
      config={config}
      x={x}
      y={y}
      radius={moonRadius}
      unlockFlash={unlockFlash}
      cosmeticTier={cosmeticTier}
    />
  );
}
