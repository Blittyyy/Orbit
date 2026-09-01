import type { OrbitingObjectVisualConfig } from '../../config/celestial';
import { useCelestialAsset } from './useCelestialAsset';
import { PlaceholderSatellite } from '../placeholders/PlaceholderSatellite';

interface SatelliteBodyViewProps {
  config: OrbitingObjectVisualConfig;
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
}

export function SatelliteBodyView({
  config,
  x,
  y,
  earthRadius,
  unlockFlash = 0,
}: SatelliteBodyViewProps) {
  const satelliteRadius = earthRadius * 0.07;
  const texture = useCelestialAsset(config.asset);

  if (texture !== null) {
    // Future: textured satellite renderer.
  }

  return (
    <PlaceholderSatellite
      config={config}
      x={x}
      y={y}
      radius={satelliteRadius}
      unlockFlash={unlockFlash}
    />
  );
}
