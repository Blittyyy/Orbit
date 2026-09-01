import { Circle, Group, Oval, RadialGradient, vec } from '@shopify/react-native-skia';

import type { PlanetVisualConfig } from '../../config/celestial';
import { SUN_VISUAL } from '../../config/celestial/sun';
import { useReduceEffects } from '../../visual/EffectsSettingsContext';
import { scaleRgbaAlpha } from '../../visual/effects';

interface PlaceholderPlanetDotProps {
  config: PlanetVisualConfig;
  x: number;
  y: number;
  radius: number;
  locked?: boolean;
  selected?: boolean;
  frontier?: boolean;
  dimmed?: boolean;
  enterEmphasis?: boolean;
}

export function PlaceholderPlanetDot({
  config,
  x,
  y,
  radius,
  locked = false,
  selected = false,
  frontier = false,
  dimmed = false,
  enterEmphasis = false,
}: PlaceholderPlanetDotProps) {
  const emphasisBoost = enterEmphasis ? 0.14 : 0;
  const scale = selected
    ? 1.18 + emphasisBoost
    : enterEmphasis
      ? 1.22
      : frontier
        ? 1.08
        : 1;
  const displayRadius = radius * scale;
  const opacity = locked ? 0.58 : dimmed ? 0.72 : 1;
  const rings = config.ringSystem;
  const tilt = config.axialTiltRadians ?? 0;
  const atmosphereColor =
    config.placeholderAtmosphereColor ?? 'rgba(59, 130, 246, 0.15)';
  const reduceEffects = useReduceEffects();
  const atmosphere = scaleRgbaAlpha(atmosphereColor, reduceEffects);

  const ringLayer = rings
    ? rings.bands.map((band, index) => {
        const rx = displayRadius * band.radiusScale * 0.92;
        const ry = rx * rings.aspect;
        return (
          <Oval
            key={`ss-ring-${index}`}
            x={x - rx}
            y={y - ry}
            width={rx * 2}
            height={ry * 2}
            color={band.color}
            style="stroke"
            strokeWidth={Math.max(1, displayRadius * band.strokeWidthScale * 0.85)}
            opacity={band.opacity * (locked ? 0.75 : 1)}
          />
        );
      })
    : null;

  return (
    <Group opacity={opacity}>
      {selected || enterEmphasis ? (
        <Circle
          cx={x}
          cy={y}
          r={displayRadius * (enterEmphasis ? 1.72 : 1.55)}
          color={
            enterEmphasis
              ? 'rgba(125, 211, 252, 0.22)'
              : 'rgba(125, 211, 252, 0.14)'
          }
        />
      ) : null}

      {frontier && !selected ? (
        <Circle
          cx={x}
          cy={y}
          r={displayRadius * 1.35}
          color="rgba(253, 224, 71, 0.12)"
        />
      ) : null}

      {rings ? (
        tilt ? (
          <Group transform={[{ rotate: tilt }]} origin={vec(x, y)}>
            {ringLayer}
          </Group>
        ) : (
          ringLayer
        )
      ) : null}

      {!locked && (
        <Circle
          cx={x}
          cy={y}
          r={displayRadius * (frontier ? 1.45 : 1.35)}
          color={atmosphere}
        />
      )}
      <Circle cx={x} cy={y} r={displayRadius} color={config.placeholderColor} />
      <Circle cx={x} cy={y} r={displayRadius}>
        <RadialGradient
          c={vec(x - displayRadius * 0.25, y - displayRadius * 0.25)}
          r={displayRadius * 1.3}
          colors={[
            locked ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.22)',
            'rgba(255, 255, 255, 0)',
            locked ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.18)',
          ]}
        />
      </Circle>

      {selected || enterEmphasis ? (
        <Circle
          cx={x}
          cy={y}
          r={displayRadius * (enterEmphasis ? 1.34 : 1.28)}
          color={
            enterEmphasis
              ? 'rgba(125, 211, 252, 0.72)'
              : 'rgba(125, 211, 252, 0.55)'
          }
          style="stroke"
          strokeWidth={Math.max(1.5, displayRadius * (enterEmphasis ? 0.1 : 0.08))}
        />
      ) : null}
    </Group>
  );
}

interface PlaceholderSunProps {
  x: number;
  y: number;
  radius: number;
}

export function PlaceholderSun({ x, y, radius }: PlaceholderSunProps) {
  const reduceEffects = useReduceEffects();
  const outerGlow = scaleRgbaAlpha(SUN_VISUAL.placeholderGlowColor, reduceEffects);
  const innerGlow = scaleRgbaAlpha('rgba(251, 191, 36, 0.22)', reduceEffects);

  return (
    <Group>
      <Circle
        cx={x}
        cy={y}
        r={radius * (reduceEffects ? 1.7 : 2.2)}
        color={outerGlow}
      />
      <Circle
        cx={x}
        cy={y}
        r={radius * (reduceEffects ? 1.25 : 1.5)}
        color={innerGlow}
      />
      <Circle cx={x} cy={y} r={radius} color={SUN_VISUAL.placeholderColor} />
      <Circle cx={x} cy={y} r={radius}>
        <RadialGradient
          c={vec(x - radius * 0.2, y - radius * 0.2)}
          r={radius * 1.4}
          colors={[SUN_VISUAL.placeholderCoreColor, SUN_VISUAL.placeholderColor]}
        />
      </Circle>
    </Group>
  );
}
