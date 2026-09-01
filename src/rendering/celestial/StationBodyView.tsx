import type { OrbitingObjectVisualConfig } from '../../config/celestial';
import { useCelestialAsset } from './useCelestialAsset';
import { PlaceholderSolarCollector } from '../placeholders/PlaceholderSolarCollector';
import { PlaceholderStation } from '../placeholders/PlaceholderStation';

interface StationBodyViewProps {
  config: OrbitingObjectVisualConfig;
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
}

export function StationBodyView({
  config,
  x,
  y,
  earthRadius,
  unlockFlash = 0,
}: StationBodyViewProps) {
  const stationRadius = earthRadius * 0.075;
  const texture = useCelestialAsset(config.asset);

  if (texture !== null) {
    // Future: textured station renderer.
  }

  if (config.id === 'solar-collector') {
    return (
      <PlaceholderSolarCollector
        config={config}
        x={x}
        y={y}
        radius={stationRadius}
        unlockFlash={unlockFlash}
      />
    );
  }

  return (
    <PlaceholderStation
      config={config}
      x={x}
      y={y}
      radius={stationRadius}
      unlockFlash={unlockFlash}
    />
  );
}
