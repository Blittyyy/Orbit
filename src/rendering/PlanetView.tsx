import { EARTH_PLANET } from '../config/celestial';
import type { PlanetVisualConfig } from '../config/celestial';
import { getPlanetVisualConfig } from '../config/celestial';
import { PlanetBodyView } from './celestial/PlanetBodyView';
import type { PlanetId } from '../config/planets';

interface PlanetViewProps {
  planetId: PlanetId;
  centerX: number;
  centerY: number;
  radius: number;
  surfaceOffset: number;
  spinRatio: number;
  config?: PlanetVisualConfig;
}

export function PlanetView({
  planetId,
  centerX,
  centerY,
  radius,
  surfaceOffset,
  spinRatio,
  config = getPlanetVisualConfig(planetId),
}: PlanetViewProps) {
  return (
    <PlanetBodyView
      config={config}
      centerX={centerX}
      centerY={centerY}
      radius={radius}
      surfaceOffset={surfaceOffset}
      spinRatio={spinRatio}
    />
  );
}

/** @deprecated Prefer PlanetView — kept for any remaining Earth-only imports. */
export function EarthView(props: Omit<PlanetViewProps, 'planetId' | 'config'>) {
  return <PlanetView {...props} planetId="earth" config={EARTH_PLANET} />;
}
