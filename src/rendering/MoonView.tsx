import { EARTH_MOON } from '../config/celestial';
import type { MoonVisualConfig } from '../config/celestial';
import { MoonBodyView } from './celestial/MoonBodyView';
import type { MoonCosmeticTier } from './placeholders/PlaceholderMoon';

interface MoonViewProps {
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
  moonConfig?: MoonVisualConfig;
  cosmeticTier?: MoonCosmeticTier;
}

export function MoonView({
  x,
  y,
  earthRadius,
  unlockFlash = 0,
  moonConfig = EARTH_MOON,
  cosmeticTier,
}: MoonViewProps) {
  return (
    <MoonBodyView
      config={moonConfig}
      x={x}
      y={y}
      earthRadius={earthRadius}
      unlockFlash={unlockFlash}
      cosmeticTier={cosmeticTier}
    />
  );
}
