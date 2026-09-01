import type { PlanetVisualConfig } from '../../config/celestial';
import { useCelestialAsset } from './useCelestialAsset';
import { PlaceholderGasGiant } from '../placeholders/PlaceholderGasGiant';
import { PlaceholderIceGiant } from '../placeholders/PlaceholderIceGiant';
import { PlaceholderSphere } from '../placeholders/PlaceholderSphere';

interface PlanetBodyViewProps {
  config: PlanetVisualConfig;
  centerX: number;
  centerY: number;
  radius: number;
  surfaceOffset: number;
  spinRatio: number;
}

/**
 * Renders a planet using final assets when available, otherwise a placeholder.
 * Gas giants and ice giants use reusable banded placeholder styles.
 */
export function PlanetBodyView({
  config,
  centerX,
  centerY,
  radius,
  surfaceOffset,
  spinRatio,
}: PlanetBodyViewProps) {
  const planetTexture = useCelestialAsset(config.assets.planet);

  if (planetTexture !== null) {
    // Future: textured planet renderer (planet, atmosphere, ring layers).
  }

  if (config.placeholderStyle === 'iceGiant') {
    return (
      <PlaceholderIceGiant
        config={config}
        centerX={centerX}
        centerY={centerY}
        radius={radius}
        surfaceOffset={surfaceOffset}
        spinRatio={spinRatio}
      />
    );
  }

  if (config.placeholderStyle === 'gasGiant') {
    return (
      <PlaceholderGasGiant
        config={config}
        centerX={centerX}
        centerY={centerY}
        radius={radius}
        surfaceOffset={surfaceOffset}
        spinRatio={spinRatio}
      />
    );
  }

  return (
    <PlaceholderSphere
      config={config}
      centerX={centerX}
      centerY={centerY}
      radius={radius}
      surfaceOffset={surfaceOffset}
      spinRatio={spinRatio}
    />
  );
}
