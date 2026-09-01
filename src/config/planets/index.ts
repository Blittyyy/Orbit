import {
  JUPITER_UNLOCK_PROBE_NETWORK_LEVEL,
  MARS_UNLOCK_SATELLITE_LEVEL,
  MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL,
  NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL,
  SATURN_UNLOCK_STORM_RESEARCH_LEVEL,
  URANUS_UNLOCK_RING_HARVESTERS_LEVEL,
  VENUS_UNLOCK_MARS_ORBITER_LEVEL,
} from '../../game/constants';
import { DEFAULT_PLANET_ID, PLANET_IDS, type PlanetId } from './planetIds';
import {
  EARTH_ECONOMY,
  findPlanetUpgradeByVisualType,
  getPlanetEconomy,
  getPlanetUpgradeConfig,
  getPlanetUpgradeTracks,
  getUpgradeUnlockRequirementLabel,
  getVisibleObjectCount,
  JUPITER_ECONOMY,
  MARS_ECONOMY,
  MERCURY_ECONOMY,
  NEPTUNE_ECONOMY,
  SATURN_ECONOMY,
  URANUS_ECONOMY,
  VENUS_ECONOMY,
  type PlanetEconomyConfig,
  type PlanetUpgradeConfig,
  type RotationSpeedEconomyConfig,
  type UpgradeCardAccent,
  type UpgradeUnlockRequirement,
  type UpgradeVisualType,
  type VisibleCountThreshold,
} from './economy';

export { DEFAULT_PLANET_ID, isPlanetId, PLANET_IDS, type PlanetId } from './planetIds';
export {
  DEFAULT_SATELLITE_VISIBLE_COUNTS,
  EARTH_ECONOMY,
  findPlanetUpgradeByVisualType,
  GALILEAN_MOON_VISIBLE_COUNTS,
  getPlanetEconomy,
  getPlanetUpgradeConfig,
  getPlanetUpgradeTracks,
  getUpgradeUnlockRequirementLabel,
  getVisibleObjectCount,
  JUPITER_ECONOMY,
  MARS_ECONOMY,
  MERCURY_ECONOMY,
  NEPTUNE_ECONOMY,
  SATURN_ECONOMY,
  URANUS_ECONOMY,
  URANUS_MOON_NETWORK_VISIBLE_COUNTS,
  VENUS_ECONOMY,
  type PlanetEconomyConfig,
  type PlanetUpgradeConfig,
  type RotationSpeedEconomyConfig,
  type UpgradeCardAccent,
  type UpgradeUnlockRequirement,
  type UpgradeVisualType,
  type VisibleCountThreshold,
} from './economy';

export interface PlanetGameConfig {
  id: PlanetId;
  name: string;
  /** Shown when the planet is locked in the solar system. */
  unlockRequirementLabel: string | null;
  /** Whether this planet has a full gameplay screen. */
  playable: boolean;
  economy: PlanetEconomyConfig | null;
}

export const PLANET_GAME_CONFIG: Record<PlanetId, PlanetGameConfig> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    unlockRequirementLabel: null,
    playable: true,
    economy: EARTH_ECONOMY,
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    unlockRequirementLabel: `Reach Earth Satellite Lv. ${MARS_UNLOCK_SATELLITE_LEVEL}`,
    playable: true,
    economy: MARS_ECONOMY,
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    unlockRequirementLabel: `Reach Mars Orbiter Lv. ${VENUS_UNLOCK_MARS_ORBITER_LEVEL}`,
    playable: true,
    economy: VENUS_ECONOMY,
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    unlockRequirementLabel: `Reach Venus Cloud Stations Lv. ${MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL}`,
    playable: true,
    economy: MERCURY_ECONOMY,
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    unlockRequirementLabel: `Reach Mercury Probe Network Lv. ${JUPITER_UNLOCK_PROBE_NETWORK_LEVEL}`,
    playable: true,
    economy: JUPITER_ECONOMY,
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    unlockRequirementLabel: `Reach Jupiter Storm Research Lv. ${SATURN_UNLOCK_STORM_RESEARCH_LEVEL}`,
    playable: true,
    economy: SATURN_ECONOMY,
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    unlockRequirementLabel: `Reach Saturn Ring Harvesters Lv. ${URANUS_UNLOCK_RING_HARVESTERS_LEVEL}`,
    playable: true,
    economy: URANUS_ECONOMY,
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    unlockRequirementLabel: `Reach Uranus Tilt Generators Lv. ${NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL}`,
    playable: true,
    economy: NEPTUNE_ECONOMY,
  },
};

export function getPlanetGameConfig(planetId: PlanetId): PlanetGameConfig {
  return PLANET_GAME_CONFIG[planetId];
}

export function getPlayablePlanetIds(): PlanetId[] {
  return PLANET_IDS.filter((id) => PLANET_GAME_CONFIG[id].playable);
}
