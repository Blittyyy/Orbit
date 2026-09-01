import { Group, Rect } from '@shopify/react-native-skia';

import type { OrbitingObjectVisualConfig } from '../../config/celestial';

interface PlaceholderSolarCollectorProps {
  config: OrbitingObjectVisualConfig;
  x: number;
  y: number;
  radius: number;
  unlockFlash?: number;
}

/** Large panel-like solar collector placeholder (faces roughly sunward). */
export function PlaceholderSolarCollector({
  config,
  x,
  y,
  radius,
  unlockFlash = 0,
}: PlaceholderSolarCollectorProps) {
  const panelWidth = radius * 2.8;
  const panelHeight = radius * 0.7;
  const mastWidth = radius * 0.28;
  const mastHeight = radius * 0.95;
  const accent = config.placeholderAccentColor ?? '#fbbf24';
  const glowOpacity = 0.1 + unlockFlash * 0.35;

  return (
    <Group>
      <Rect
        x={x - radius * 1.7}
        y={y - radius * 1.0}
        width={radius * 3.4}
        height={radius * 2.0}
        color={config.placeholderGlowColor ?? `rgba(251, 191, 36, ${glowOpacity})`}
      />

      <Rect
        x={x - mastWidth / 2}
        y={y - mastHeight * 0.15}
        width={mastWidth}
        height={mastHeight}
        color="#64748b"
      />

      <Rect
        x={x - panelWidth / 2}
        y={y - panelHeight * 1.35}
        width={panelWidth}
        height={panelHeight}
        color={config.placeholderColor}
      />
      <Rect
        x={x - panelWidth / 2 + radius * 0.12}
        y={y - panelHeight * 1.35 + radius * 0.1}
        width={panelWidth * 0.42}
        height={panelHeight * 0.7}
        color={accent}
        opacity={0.85}
      />
      <Rect
        x={x + radius * 0.08}
        y={y - panelHeight * 1.35 + radius * 0.1}
        width={panelWidth * 0.42}
        height={panelHeight * 0.7}
        color={accent}
        opacity={0.7}
      />
    </Group>
  );
}
