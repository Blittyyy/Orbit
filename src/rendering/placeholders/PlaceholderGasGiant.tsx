import {
  Circle,
  Group,
  LinearGradient,
  Oval,
  Path,
  RadialGradient,
  Rect,
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
import { projectedSpotEllipse } from './sphereSurface';

interface PlaceholderGasGiantProps {
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

/**
 * Gas-giant placeholder: latitude bands stay fixed under Y-axis spin;
 * storm spots wrap around the globe with foreshortening.
 */
export function PlaceholderGasGiant({
  config,
  centerX,
  centerY,
  radius,
  surfaceOffset,
  spinRatio,
}: PlaceholderGasGiantProps) {
  const clip = makeCircleClip(centerX, centerY, radius);
  const rotation = surfaceOffsetToRotation(surfaceOffset);
  const reduceEffects = useReduceEffects();
  const boostIntensity =
    getSpinBoostIntensity(spinRatio) * (reduceEffects ? 0.45 : 1);
  const atmosphere =
    config.placeholderAtmosphereColor ?? 'rgba(251, 146, 60, 0.2)';
  const bands = config.gasGiantBands ?? [];
  const spot = config.gasGiantSpot;
  const outerGlowOpacity = scaleGlowOpacity(
    0.12 + boostIntensity * 0.1,
    reduceEffects,
  );
  const innerGlowOpacity = scaleGlowOpacity(
    0.18 + boostIntensity * 0.12,
    reduceEffects,
  );
  const rimGlowOpacity = scaleGlowOpacity(
    0.26 + boostIntensity * 0.1,
    reduceEffects,
  );

  const spotEllipse = spot
    ? projectedSpotEllipse(
        centerX,
        centerY,
        radius,
        spot.xOffset * 1.2,
        spot.yOffset * 1.1,
        spot.radiusScale,
        rotation,
      )
    : null;

  return (
    <Group>
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * (1.3 + boostIntensity * 0.04)}
        color={withAlpha(atmosphere, outerGlowOpacity * 0.55)}
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
        strokeWidth={1.6}
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

        {bands.map((band, index) => (
          <Rect
            key={`band-${index}`}
            x={centerX - radius}
            y={centerY + band.yOffset * radius - (band.height * radius) / 2}
            width={radius * 2}
            height={band.height * radius}
            color={band.color}
            opacity={0.92}
          />
        ))}

        {spot && spotEllipse ? (
          <Oval
            x={spotEllipse.cx - spotEllipse.rx}
            y={spotEllipse.cy - spotEllipse.ry}
            width={spotEllipse.rx * 2}
            height={spotEllipse.ry * 2}
            color={spot.color}
            opacity={0.95}
          />
        ) : null}

        <Circle cx={centerX} cy={centerY} r={radius}>
          <LinearGradient
            start={vec(centerX - radius * 0.45, centerY - radius * 0.4)}
            end={vec(centerX + radius * 0.5, centerY + radius * 0.45)}
            colors={[
              'rgba(255, 255, 255, 0.14)',
              'rgba(255, 255, 255, 0.02)',
              'rgba(0, 0, 0, 0.16)',
            ]}
            positions={[0, 0.5, 1]}
          />
        </Circle>

        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX - radius * 0.25, centerY - radius * 0.22)}
            r={radius * 1.35}
            colors={[
              'rgba(255, 255, 255, 0.08)',
              'rgba(255, 255, 255, 0)',
              'rgba(0, 0, 0, 0.1)',
            ]}
            positions={[0, 0.55, 1]}
          />
        </Circle>

        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX, centerY)}
            r={radius}
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.2)',
            ]}
            positions={[0, 0.74, 1]}
          />
        </Circle>
      </Group>
    </Group>
  );
}
