import type { OrbitingObjectVisualConfig } from '../config/celestial';
import { StationBodyView } from './celestial/StationBodyView';

interface StationViewProps {
  x: number;
  y: number;
  earthRadius: number;
  unlockFlash?: number;
  stationConfig: OrbitingObjectVisualConfig;
}

export function StationView({
  x,
  y,
  earthRadius,
  unlockFlash = 0,
  stationConfig,
}: StationViewProps) {
  return (
    <StationBodyView
      config={stationConfig}
      x={x}
      y={y}
      earthRadius={earthRadius}
      unlockFlash={unlockFlash}
    />
  );
}
