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

interface PlaceholderIceGiantProps {
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
 * Ice-giant placeholder: keeps intentional axial tilt presentation.
 * Surface features wrap around the tilted spin axis (not flat Z-spin).
 */
export function PlaceholderIceGiant({
  config,
  centerX,
  centerY,
  radius,
  surfaceOffset,
  spinRatio,
}: PlaceholderIceGiantProps) {
  const clip = makeCircleClip(centerX, centerY, radius);
  const rotation = surfaceOffsetToRotation(surfaceOffset);
  const axialTilt = config.axialTiltRadians ?? 0;
  const reduceEffects = useReduceEffects();
  const boostIntensity =
    getSpinBoostIntensity(spinRatio) * (reduceEffects ? 0.45 : 1);
  const atmosphere =
    config.placeholderAtmosphereColor ?? 'rgba(34, 211, 238, 0.2)';
  const bands = config.gasGiantBands ?? [];
  const spot = config.gasGiantSpot;
  const outerGlowOpacity = scaleGlowOpacity(
    0.14 + boostIntensity * 0.1,
    reduceEffects,
  );
  const innerGlowOpacity = scaleGlowOpacity(
    0.2 + boostIntensity * 0.12,
    reduceEffects,
  );
  const rimGlowOpacity = scaleGlowOpacity(
    0.28 + boostIntensity * 0.1,
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
        r={radius * (1.32 + boostIntensity * 0.04)}
        color={withAlpha(atmosphere, outerGlowOpacity * 0.5)}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * (1.22 + boostIntensity * 0.04)}
        color={withAlpha(atmosphere, outerGlowOpacity)}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius * 1.12}
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
            key={`ice-streak-${index}`}
            path={makeSpeedStreakPath(centerX, centerY, radius, angle, boostIntensity)}
            color={withAlpha(atmosphere, 0.1 + boostIntensity * 0.3)}
            style="stroke"
            strokeWidth={1.4 + boostIntensity}
          />
        ))}

      <Group clip={clip}>
        <Circle cx={centerX} cy={centerY} r={radius} color={config.placeholderColor} />

        <Group
          transform={[{ rotate: axialTilt }]}
          origin={vec(centerX, centerY)}
        >
          {bands.map((band, index) => (
            <Rect
              key={`ice-band-${index}`}
              x={centerX - radius}
              y={centerY + band.yOffset * radius - (band.height * radius) / 2}
              width={radius * 2}
              height={band.height * radius}
              color={band.color}
              opacity={spot ? 0.72 : 0.55}
            />
          ))}

          {spot && spotEllipse ? (
            <Oval
              x={spotEllipse.cx - spotEllipse.rx}
              y={spotEllipse.cy - spotEllipse.ry}
              width={spotEllipse.rx * 2}
              height={spotEllipse.ry * 2}
              color={spot.color}
              opacity={0.92}
            />
          ) : null}
        </Group>

        <Circle cx={centerX} cy={centerY} r={radius}>
          <LinearGradient
            start={vec(centerX - radius * 0.4, centerY - radius * 0.45)}
            end={vec(centerX + radius * 0.45, centerY + radius * 0.4)}
            colors={[
              'rgba(255, 255, 255, 0.16)',
              'rgba(165, 243, 252, 0.04)',
              'rgba(15, 23, 42, 0.14)',
            ]}
            positions={[0, 0.5, 1]}
          />
        </Circle>

        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX - radius * 0.22, centerY - radius * 0.2)}
            r={radius * 1.35}
            colors={[
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0)',
              'rgba(0, 0, 0, 0.08)',
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
              'rgba(0, 0, 0, 0.18)',
            ]}
            positions={[0, 0.74, 1]}
          />
        </Circle>
      </Group>
    </Group>
  );
}
