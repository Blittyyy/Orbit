import { Group, Rect } from '@shopify/react-native-skia';

import type { OrbitingObjectVisualConfig } from '../../config/celestial';

interface PlaceholderStationProps {
  config: OrbitingObjectVisualConfig;
  x: number;
  y: number;
  radius: number;
  unlockFlash?: number;
}

/** Simple floating platform placeholder for station-type upgrades. */
export function PlaceholderStation({
  config,
  x,
  y,
  radius,
  unlockFlash = 0,
}: PlaceholderStationProps) {
  const deckWidth = radius * 2.2;
  const deckHeight = radius * 0.55;
  const towerWidth = radius * 0.55;
  const towerHeight = radius * 1.15;
  const accent = config.placeholderAccentColor ?? '#f59e0b';
  const glowOpacity = 0.12 + unlockFlash * 0.4;

  return (
    <Group>
      <Rect
        x={x - radius * 1.6}
        y={y - radius * 1.1}
        width={radius * 3.2}
        height={radius * 2.2}
        color={config.placeholderGlowColor ?? `rgba(251, 191, 36, ${glowOpacity})`}
      />

      <Rect
        x={x - deckWidth / 2}
        y={y - deckHeight / 2}
        width={deckWidth}
        height={deckHeight}
        color={config.placeholderColor}
      />
      <Rect
        x={x - towerWidth / 2}
        y={y - towerHeight}
        width={towerWidth}
        height={towerHeight}
        color={accent}
      />
      <Rect
        x={x - radius * 0.85}
        y={y + deckHeight * 0.15}
        width={radius * 0.45}
        height={radius * 0.35}
        color="#fef3c7"
      />
      <Rect
        x={x + radius * 0.4}
        y={y + deckHeight * 0.15}
        width={radius * 0.45}
        height={radius * 0.35}
        color="#fef3c7"
      />
    </Group>
  );
}
