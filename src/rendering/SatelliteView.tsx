import { EARTH_SATELLITE } from '../config/celestial';
import type { OrbitingObjectVisualConfig } from '../config/celestial';
import { SatelliteBodyView } from './celestial/SatelliteBodyView';

interface SatelliteViewProps {
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
  satelliteConfig?: OrbitingObjectVisualConfig;
}

export function SatelliteView({
  x,
  y,
  earthRadius,
  unlockFlash = 0,
  satelliteConfig = EARTH_SATELLITE,
}: SatelliteViewProps) {
  return (
    <SatelliteBodyView
      config={satelliteConfig}
      x={x}
      y={y}
      earthRadius={earthRadius}
      unlockFlash={unlockFlash}
    />
  );
}
