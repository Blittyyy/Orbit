import { Circle, Group, RadialGradient, Skia, vec } from '@shopify/react-native-skia';

import type { MoonVisualConfig } from '../../config/celestial';
import { useReduceEffects } from '../../visual/EffectsSettingsContext';
import { scaleGlowOpacity } from '../../visual/effects';

/** Cosmetic-only Titan / moon progression tiers. */
export type MoonCosmeticTier = 0 | 1 | 2 | 3 | 4;

interface PlaceholderMoonProps {
  config: MoonVisualConfig;
  x: number;
  y: number;
  radius: number;
  unlockFlash?: number;
  /** Visual-only progression (e.g. Titan levels). */
  cosmeticTier?: MoonCosmeticTier;
}

function makeCircleClip(centerX: number, centerY: number, radius: number) {
  const clip = Skia.Path.Make();
  clip.addCircle(centerX, centerY, radius);
  return clip;
}

/** Map moon upgrade level → cosmetic tier. */
export function getMoonCosmeticTier(level: number): MoonCosmeticTier {
  if (level <= 0) {
    return 0;
  }
  if (level <= 4) {
    return 1;
  }
  if (level <= 9) {
    return 2;
  }
  if (level <= 19) {
    return 3;
  }
  return 4;
}

function withGlowAlpha(color: string | undefined, alpha: number, fallback: string): string {
  if (!color) {
    return fallback;
  }

  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/,
  );
  if (!match) {
    return color;
  }

  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

export function PlaceholderMoon({
  config,
  x,
  y,
  radius,
  unlockFlash = 0,
  cosmeticTier = 1,
}: PlaceholderMoonProps) {
  const clip = makeCircleClip(x, y, radius);
  const reduceEffects = useReduceEffects();
  const glowBoost =
    cosmeticTier >= 2 ? 0.12 + (cosmeticTier - 2) * 0.06 : 0;
  const glowOpacity =
    scaleGlowOpacity(0.14 + glowBoost, reduceEffects) + unlockFlash * 0.35;
  const outerGlow = withGlowAlpha(
    config.placeholderGlowColor,
    glowOpacity * 0.55,
    `rgba(167, 139, 250, ${glowOpacity * 0.45})`,
  );
  const innerGlow = withGlowAlpha(
    config.placeholderGlowColor,
    glowOpacity,
    `rgba(191, 219, 254, ${glowOpacity})`,
  );

  return (
    <Group>
      <Circle cx={x} cy={y} r={radius * 1.28} color={outerGlow} />
      <Circle cx={x} cy={y} r={radius * 1.16} color={innerGlow} />
      {cosmeticTier >= 2 ? (
        <Circle
          cx={x}
          cy={y}
          r={radius * 1.08}
          color={withGlowAlpha(
            config.placeholderGlowColor,
            0.22 + cosmeticTier * 0.04,
            'rgba(251, 191, 36, 0.28)',
          )}
          style="stroke"
          strokeWidth={1.4}
        />
      ) : (
        <Circle
          cx={x}
          cy={y}
          r={radius * 1.02}
          color="rgba(196, 181, 253, 0.18)"
          style="stroke"
          strokeWidth={1}
        />
      )}

      <Group clip={clip}>
        <Circle cx={x} cy={y} r={radius} color={config.placeholderColor} />

        <Circle
          cx={x - radius * 0.22}
          cy={y - radius * 0.18}
          r={radius * 0.2}
          color="rgba(148, 163, 184, 0.35)"
        />
        <Circle
          cx={x + radius * 0.15}
          cy={y + radius * 0.12}
          r={radius * 0.14}
          color="rgba(100, 116, 139, 0.3)"
        />

        <Circle cx={x} cy={y} r={radius}>
          <RadialGradient
            c={vec(x - radius * 0.22, y - radius * 0.28)}
            r={radius * 1.2}
            colors={[
              'rgba(255, 255, 255, 0.18)',
              'rgba(255, 255, 255, 0)',
              'rgba(15, 23, 42, 0.2)',
            ]}
          />
        </Circle>
      </Group>

      {cosmeticTier >= 3 ? (
        <Circle
          cx={x + radius * 1.55}
          cy={y - radius * 0.35}
          r={Math.max(1.5, radius * 0.22)}
          color={config.placeholderGlowColor ?? 'rgba(251, 191, 36, 0.55)'}
        />
      ) : null}

      {cosmeticTier >= 4 ? (
        <>
          <Circle
            cx={x + radius * 1.55}
            cy={y - radius * 0.35}
            r={Math.max(2.2, radius * 0.38)}
            color="rgba(251, 191, 36, 0.2)"
            style="stroke"
            strokeWidth={1.2}
          />
          <Circle
            cx={x - radius * 1.4}
            cy={y + radius * 0.55}
            r={Math.max(1.2, radius * 0.14)}
            color="rgba(253, 230, 138, 0.55)"
          />
        </>
      ) : null}
    </Group>
  );
}
