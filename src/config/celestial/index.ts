export { EARTH_MOON, EARTH_PLANET, EARTH_SATELLITE } from './earth';
export { MARS_ORBITER, MARS_PHOBOS, MARS_PLANET } from './mars';
export {
  MERCURY_PLANET,
  MERCURY_PROBE,
  MERCURY_SOLAR_COLLECTOR,
} from './mercury';
export {
  JUPITER_CALLISTO,
  JUPITER_EUROPA,
  JUPITER_GANYMEDE,
  JUPITER_IO,
  JUPITER_PLANET,
  JUPITER_STORM_RESEARCH,
} from './jupiter';
export {
  SATURN_PLANET,
  SATURN_RING_HARVESTER,
  SATURN_TITAN,
} from './saturn';
export {
  URANUS_ARIEL,
  URANUS_AXIAL_TILT_RADIANS,
  URANUS_MIRANDA,
  URANUS_OBERON,
  URANUS_PLANET,
  URANUS_TILT_GENERATOR,
  URANUS_TITANIA,
  URANUS_UMBRIEL,
} from './uranus';
export {
  NEPTUNE_PLANET,
  NEPTUNE_STORM_HARVESTER,
  NEPTUNE_TRITON,
} from './neptune';
export {
  VENUS_ATMOSPHERIC_HARVESTER,
  VENUS_CLOUD_STATION,
  VENUS_PLANET,
} from './venus';
export { SUN_VISUAL } from './sun';

import { EARTH_PLANET } from './earth';
import { MARS_PLANET } from './mars';
import { MERCURY_PLANET } from './mercury';
import { JUPITER_PLANET } from './jupiter';
import { NEPTUNE_PLANET } from './neptune';
import { SATURN_PLANET } from './saturn';
import { URANUS_PLANET } from './uranus';
import { VENUS_PLANET } from './venus';
import type { MoonVisualConfig, OrbitingObjectVisualConfig, PlanetVisualConfig } from './types';
import type { PlanetId } from '../planets';

export type {
  CelestialAssetPath,
  CelestialBodyAssets,
  GasGiantBandConfig,
  GasGiantSpotConfig,
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetPlaceholderStyle,
  PlanetRingBandConfig,
  PlanetRingSystemConfig,
  PlanetVisualConfig,
} from './types';

export const PLANET_VISUALS: Partial<Record<PlanetId, PlanetVisualConfig>> = {
  earth: EARTH_PLANET,
  mars: MARS_PLANET,
  venus: VENUS_PLANET,
  mercury: MERCURY_PLANET,
  jupiter: JUPITER_PLANET,
  saturn: SATURN_PLANET,
  uranus: URANUS_PLANET,
  neptune: NEPTUNE_PLANET,
};

export function getPlanetVisualConfig(planetId: PlanetId): PlanetVisualConfig {
  return PLANET_VISUALS[planetId] ?? EARTH_PLANET;
}

export function getPrimaryMoonConfig(planetId: PlanetId): MoonVisualConfig | undefined {
  return getPlanetVisualConfig(planetId).moons[0];
}

export function getPrimarySatelliteConfig(
  planetId: PlanetId,
): OrbitingObjectVisualConfig | undefined {
  return getPlanetVisualConfig(planetId).satellites[0];
}

export function getMoonConfig(
  planetId: PlanetId,
  moonId: string,
): MoonVisualConfig | undefined {
  return getPlanetVisualConfig(planetId).moons.find((moon) => moon.id === moonId);
}

export function getSatelliteConfig(
  planetId: PlanetId,
  satelliteId: string,
): OrbitingObjectVisualConfig | undefined {
  return getPlanetVisualConfig(planetId).satellites.find(
    (satellite) => satellite.id === satelliteId,
  );
}

export function getStationConfig(
  planetId: PlanetId,
  stationId: string,
): OrbitingObjectVisualConfig | undefined {
  return getPlanetVisualConfig(planetId).stations.find(
    (station) => station.id === stationId,
  );
}

export { EARTH_MOON as DEFAULT_MOON, EARTH_SATELLITE as DEFAULT_SATELLITE } from './earth';
