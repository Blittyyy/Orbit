import { Group, Oval, Skia, vec } from '@shopify/react-native-skia';

import type { PlanetRingBandConfig, PlanetRingSystemConfig } from '../../config/celestial';

export type RingEnhancementTier = 0 | 1 | 2 | 3 | 4;

interface PlaceholderPlanetRingsProps {
  centerX: number;
  centerY: number;
  planetRadius: number;
  ringSystem: PlanetRingSystemConfig;
  /** 0 = base planetary rings only; 1–4 from Ring Harvesters cosmetic tiers. */
  enhancementTier?: RingEnhancementTier;
  /** Draw the half that sits behind or in front of the planet body. */
  layer: 'back' | 'front';
  /** Visual axial tilt so rings share the planet's equator orientation. */
  axialTiltRadians?: number;
}

/** Map Ring Harvesters level → cosmetic tier (visual only). */
export function getRingEnhancementTier(ringUpgradeLevel: number): RingEnhancementTier {
  if (ringUpgradeLevel <= 0) {
    return 0;
  }
  if (ringUpgradeLevel <= 4) {
    return 1;
  }
  if (ringUpgradeLevel <= 9) {
    return 2;
  }
  if (ringUpgradeLevel <= 19) {
    return 3;
  }
  return 4;
}

function buildBands(
  base: PlanetRingBandConfig[],
  tier: RingEnhancementTier,
): PlanetRingBandConfig[] {
  const brightness = tier === 0 ? 1 : tier === 1 ? 1.08 : tier === 2 ? 1.2 : 1.28;
  const thickness = tier <= 1 ? 1 : tier === 2 ? 1.35 : tier === 3 ? 1.2 : 1.15;

  const enhanced = base.map((band) => ({
    ...band,
    opacity: Math.min(0.85, band.opacity * brightness),
    strokeWidthScale: band.strokeWidthScale * thickness,
  }));

  if (tier >= 3) {
    enhanced.push({
      color: '#fff7ed',
      radiusScale: 1.64,
      strokeWidthScale: 0.045,
      opacity: 0.35 + (tier - 3) * 0.08,
    });
  }

  if (tier >= 4) {
    enhanced.push(
      {
        color: '#fde68a',
        radiusScale: 1.48,
        strokeWidthScale: 0.035,
        opacity: 0.42,
      },
      {
        color: '#fbbf24',
        radiusScale: 2.05,
        strokeWidthScale: 0.05,
        opacity: 0.32,
      },
    );
  }

  return enhanced;
}

function makeHalfPlaneClip(
  centerX: number,
  centerY: number,
  planetRadius: number,
  layer: 'back' | 'front',
) {
  const path = Skia.Path.Make();
  const width = planetRadius * 4.8;
  const height = planetRadius * 2.6;
  const x = centerX - width / 2;

  if (layer === 'back') {
    path.addRect(Skia.XYWHRect(x, centerY - height, width, height));
  } else {
    path.addRect(Skia.XYWHRect(x, centerY, width, height));
  }

  return path;
}

/**
 * Reusable planetary ring placeholder.
 * Split into back/front layers so the ring can pass behind and in front of the planet.
 * Optional axial tilt keeps rings aligned with tilted planets (e.g. Uranus).
 */
export function PlaceholderPlanetRings({
  centerX,
  centerY,
  planetRadius,
  ringSystem,
  enhancementTier = 0,
  layer,
  axialTiltRadians = 0,
}: PlaceholderPlanetRingsProps) {
  const bands = buildBands(ringSystem.bands, enhancementTier);
  const aspect = ringSystem.aspect;
  const clip = makeHalfPlaneClip(centerX, centerY, planetRadius, layer);

  const rings = (
    <Group clip={clip}>
      {enhancementTier >= 2 ? (
        <Oval
          x={centerX - planetRadius * 2.0}
          y={centerY - planetRadius * 2.0 * aspect}
          width={planetRadius * 4.0}
          height={planetRadius * 4.0 * aspect}
          color={`rgba(251, 191, 36, ${0.06 + enhancementTier * 0.02})`}
        />
      ) : null}

      {bands.map((band, index) => {
        const rx = planetRadius * band.radiusScale;
        const ry = rx * aspect;
        const stroke = Math.max(1.2, planetRadius * band.strokeWidthScale);

        return (
          <Oval
            key={`ring-${layer}-${index}`}
            x={centerX - rx}
            y={centerY - ry}
            width={rx * 2}
            height={ry * 2}
            color={band.color}
            style="stroke"
            strokeWidth={stroke}
            opacity={band.opacity}
          />
        );
      })}
    </Group>
  );

  if (!axialTiltRadians) {
    return rings;
  }

  return (
    <Group transform={[{ rotate: axialTiltRadians }]} origin={vec(centerX, centerY)}>
      {rings}
    </Group>
  );
}
