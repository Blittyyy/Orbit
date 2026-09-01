import {
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import type { PlanetVisualConfig } from '../../config/celestial';
import { getSpinBoostIntensity, SPEED_STREAK_ANGLES } from '../spinBoost';
import { useReduceEffects } from '../../visual/EffectsSettingsContext';
import {
  getVisibleStreakAngles,
  scaleGlowOpacity,
} from '../../visual/effects';
import { surfaceOffsetToRotation } from '../../visual/sphericalProjection';
import {
  projectedBlobPath,
  TERRESTRIAL_SURFACE_BLOBS,
} from './sphereSurface';

interface PlaceholderSphereProps {
  config: PlanetVisualConfig;
  centerX: number;
  centerY: number;
  radius: number;
  surfaceOffset: number;
  spinRatio: number;
}

function makeCircleClip(centerX: number, centerY: number, radius: number) {
  const clip = Skia.Path.Make();
  clip.addCircle(centerX, centerY, radius);
  return clip;
}

function makeSpeedStreakPath(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  intensity: number,
) {
  const path = Skia.Path.Make();
  const streakLength = radius * (0.07 + intensity * 0.05);
  const innerRadius = radius * 1.04;
  const outerRadius = innerRadius + streakLength;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  path.moveTo(centerX + cos * innerRadius, centerY + sin * innerRadius);
  path.lineTo(centerX + cos * outerRadius, centerY + sin * outerRadius);

  return path;
}

function withAlpha(color: string, alpha: number): string {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

  if (!match) {
    return color;
  }

  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Math.max(0, Math.min(1, alpha))})`;
}

function readAlpha(color: string, fallback: number): number {
  const match = color.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/i);

  if (!match) {
    return fallback;
  }

  const alpha = Number(match[1]);
  return Number.isFinite(alpha) ? alpha : fallback;
}

/**
 * Terrestrial placeholder globe: fixed circular limb + atmosphere,
 * surface features project around the Y-axis (left/right wrap).
 */
export function PlaceholderSphere({
  config,
  centerX,
  centerY,
  radius,
  surfaceOffset,
  spinRatio,
}: PlaceholderSphereProps) {
  const clip = makeCircleClip(centerX, centerY, radius);
  const rotation = surfaceOffsetToRotation(surfaceOffset);
  const reduceEffects = useReduceEffects();
  const boostIntensity =
    getSpinBoostIntensity(spinRatio) * (reduceEffects ? 0.45 : 1);
  const accentColor = config.placeholderAccentColor ?? '#66bb6a';
  const atmosphere =
    config.placeholderAtmosphereColor ?? 'rgba(59, 130, 246, 0.2)';
  const atmosphereStrength = Math.min(1, readAlpha(atmosphere, 0.2) / 0.2);
  const outerGlowOpacity = scaleGlowOpacity(
    (0.1 + boostIntensity * 0.1) * atmosphereStrength,
    reduceEffects,
  );
  const innerGlowOpacity = scaleGlowOpacity(
    (0.16 + boostIntensity * 0.12) * atmosphereStrength,
    reduceEffects,
  );
  const rimGlowOpacity = scaleGlowOpacity(
    (0.24 + boostIntensity * 0.1) * Math.max(0.35, atmosphereStrength),
    reduceEffects,
  );
  const lightX = centerX - radius * 0.4;
  const lightY = centerY - radius * 0.35;
  const shadowX = centerX + radius * 0.45;
  const shadowY = centerY + radius * 0.4;

  return (
    <Group>
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * (1.28 + boostIntensity * 0.04)}
        color={withAlpha(atmosphere, outerGlowOpacity * 0.5)}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * (1.2 + boostIntensity * 0.04)}
        color={withAlpha(atmosphere, outerGlowOpacity)}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * 1.1}
        color={withAlpha(atmosphere, innerGlowOpacity)}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * 1.02}
        color={withAlpha(atmosphere, rimGlowOpacity)}
        style="stroke"
        strokeWidth={1.5}
      />

      {boostIntensity > 0 &&
        getVisibleStreakAngles(SPEED_STREAK_ANGLES, reduceEffects).map((angle, index) => (
          <Path
            key={`streak-${index}`}
            path={makeSpeedStreakPath(centerX, centerY, radius, angle, boostIntensity)}
            color={withAlpha(atmosphere, 0.12 + boostIntensity * 0.35)}
            style="stroke"
            strokeWidth={1.5 + boostIntensity}
          />
        ))}

      <Group clip={clip}>
        <Circle cx={centerX} cy={centerY} r={radius} color={config.placeholderColor} />

        {TERRESTRIAL_SURFACE_BLOBS.map((blob, index) => {
          const path = projectedBlobPath(centerX, centerY, radius, {
            ...blob,
            color: accentColor,
          }, rotation);

          if (!path) {
            return null;
          }

          return (
            <Path
              key={`land-${index}`}
              path={path}
              color={accentColor}
              opacity={blob.opacity}
            />
          );
        })}

        <Circle cx={centerX} cy={centerY} r={radius}>
          <LinearGradient
            start={vec(lightX, lightY)}
            end={vec(shadowX, shadowY)}
            colors={[
              'rgba(255, 255, 255, 0.12)',
              'rgba(255, 255, 255, 0.02)',
              'rgba(0, 0, 0, 0.14)',
            ]}
            positions={[0, 0.52, 1]}
          />
        </Circle>

        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX - radius * 0.28, centerY - radius * 0.26)}
            r={radius * 1.4}
            colors={[
              'rgba(255, 255, 255, 0.07)',
              'rgba(255, 255, 255, 0)',
              'rgba(0, 0, 0, 0.08)',
            ]}
            positions={[0, 0.55, 1]}
          />
        </Circle>

        {/* Fixed limb darkening — reinforces globe silhouette while surface wraps. */}
        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX, centerY)}
            r={radius}
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.22)',
            ]}
            positions={[0, 0.72, 1]}
          />
        </Circle>
      </Group>
    </Group>
  );
}
