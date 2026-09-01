import { Group, Path, Rect, Skia } from '@shopify/react-native-skia';

import type { OrbitingObjectVisualConfig } from '../../config/celestial';
import { useReduceEffects } from '../../visual/EffectsSettingsContext';
import { scaleGlowOpacity } from '../../visual/effects';

interface PlaceholderSatelliteProps {
  config: OrbitingObjectVisualConfig;
  x: number;
  y: number;
  radius: number;
  unlockFlash?: number;
}

export function PlaceholderSatellite({
  config,
  x,
  y,
  radius,
  unlockFlash = 0,
}: PlaceholderSatelliteProps) {
  const reduceEffects = useReduceEffects();
  const bodyWidth = radius * 1.15;
  const bodyHeight = radius * 0.72;
  const panelWidth = radius * 1.15;
  const panelHeight = radius * 0.42;
  const accent = config.placeholderAccentColor ?? '#38bdf8';
  const glowOpacity =
    scaleGlowOpacity(0.1, reduceEffects) + unlockFlash * 0.4;

  const dish = Skia.Path.Make();
  dish.moveTo(x, y - bodyHeight * 0.85);
  dish.lineTo(x + radius * 0.28, y - bodyHeight * 0.18);
  dish.lineTo(x - radius * 0.28, y - bodyHeight * 0.18);
  dish.close();

  return (
    <Group>
      <Rect
        x={x - radius * 1.55}
        y={y - radius * 0.7}
        width={radius * 3.1}
        height={radius * 1.4}
        color={`rgba(125, 211, 252, ${glowOpacity})`}
      />

      <Rect
        x={x - bodyWidth / 2 - panelWidth}
        y={y - panelHeight / 2}
        width={panelWidth}
        height={panelHeight}
        color={accent}
      />
      <Rect
        x={x + bodyWidth / 2}
        y={y - panelHeight / 2}
        width={panelWidth}
        height={panelHeight}
        color={accent}
      />

      <Rect
        x={x - bodyWidth / 2}
        y={y - bodyHeight / 2}
        width={bodyWidth}
        height={bodyHeight}
        color={config.placeholderColor}
      />

      <Path path={dish} color="#e2e8f0" />
    </Group>
  );
}
