import { DEFAULT_PLANET_ID, isPlanetId, type PlanetId } from '../config/planets';
import {
  EARTH_SATELLITES_UPGRADE_ID,
  JUPITER_STORM_RESEARCH_UPGRADE_ID,
  JUPITER_UNLOCK_PROBE_NETWORK_LEVEL,
  MARS_ORBITER_UPGRADE_ID,
  MARS_UNLOCK_SATELLITE_LEVEL,
  MERCURY_PROBE_NETWORK_UPGRADE_ID,
  MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL,
  NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL,
  SATURN_RING_HARVESTERS_UPGRADE_ID,
  SATURN_UNLOCK_STORM_RESEARCH_LEVEL,
  URANUS_TILT_GENERATORS_UPGRADE_ID,
  URANUS_UNLOCK_RING_HARVESTERS_LEVEL,
  VENUS_CLOUD_STATIONS_UPGRADE_ID,
  VENUS_UNLOCK_MARS_ORBITER_LEVEL,
} from './constants';
import {
  getUpgradeLevel,
  isUpgradeUnlocked,
} from './planetUpgrades';
import { getPlanetProgress, type GameState } from './types';

export {
  EARTH_SATELLITES_UPGRADE_ID,
  JUPITER_STORM_RESEARCH_UPGRADE_ID,
  MARS_ORBITER_UPGRADE_ID,
  MERCURY_PROBE_NETWORK_UPGRADE_ID,
  SATURN_RING_HARVESTERS_UPGRADE_ID,
  URANUS_TILT_GENERATORS_UPGRADE_ID,
  VENUS_CLOUD_STATIONS_UPGRADE_ID,
};

export function isPlanetUnlocked(state: GameState, planetId: PlanetId): boolean {
  return state.unlockedPlanets.includes(planetId);
}

/** True once Neptune (final planet of the first Solar System) is unlocked. */
export function isSolarSystemComplete(state: GameState): boolean {
  return isPlanetUnlocked(state, 'neptune');
}

export function shouldUnlockMars(state: GameState): boolean {
  const earth = getPlanetProgress(state, 'earth');
  return (
    isUpgradeUnlocked(earth, EARTH_SATELLITES_UPGRADE_ID) &&
    getUpgradeLevel(earth, EARTH_SATELLITES_UPGRADE_ID) >= MARS_UNLOCK_SATELLITE_LEVEL
  );
}

export function shouldUnlockVenus(state: GameState): boolean {
  const mars = getPlanetProgress(state, 'mars');
  return (
    isUpgradeUnlocked(mars, MARS_ORBITER_UPGRADE_ID) &&
    getUpgradeLevel(mars, MARS_ORBITER_UPGRADE_ID) >= VENUS_UNLOCK_MARS_ORBITER_LEVEL
  );
}

export function shouldUnlockMercury(state: GameState): boolean {
  const venus = getPlanetProgress(state, 'venus');
  return (
    isUpgradeUnlocked(venus, VENUS_CLOUD_STATIONS_UPGRADE_ID) &&
    getUpgradeLevel(venus, VENUS_CLOUD_STATIONS_UPGRADE_ID) >=
      MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL
  );
}

export function shouldUnlockJupiter(state: GameState): boolean {
  const mercury = getPlanetProgress(state, 'mercury');
  return (
    isUpgradeUnlocked(mercury, MERCURY_PROBE_NETWORK_UPGRADE_ID) &&
    getUpgradeLevel(mercury, MERCURY_PROBE_NETWORK_UPGRADE_ID) >=
      JUPITER_UNLOCK_PROBE_NETWORK_LEVEL
  );
}

export function shouldUnlockSaturn(state: GameState): boolean {
  const jupiter = getPlanetProgress(state, 'jupiter');
  return (
    isUpgradeUnlocked(jupiter, JUPITER_STORM_RESEARCH_UPGRADE_ID) &&
    getUpgradeLevel(jupiter, JUPITER_STORM_RESEARCH_UPGRADE_ID) >=
      SATURN_UNLOCK_STORM_RESEARCH_LEVEL
  );
}

export function shouldUnlockUranus(state: GameState): boolean {
  const saturn = getPlanetProgress(state, 'saturn');
  return (
    isUpgradeUnlocked(saturn, SATURN_RING_HARVESTERS_UPGRADE_ID) &&
    getUpgradeLevel(saturn, SATURN_RING_HARVESTERS_UPGRADE_ID) >=
      URANUS_UNLOCK_RING_HARVESTERS_LEVEL
  );
}

export function shouldUnlockNeptune(state: GameState): boolean {
  const uranus = getPlanetProgress(state, 'uranus');
  return (
    isUpgradeUnlocked(uranus, URANUS_TILT_GENERATORS_UPGRADE_ID) &&
    getUpgradeLevel(uranus, URANUS_TILT_GENERATORS_UPGRADE_ID) >=
      NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL
  );
}

export function applyMarsUnlock(state: GameState): GameState {
  if (!shouldUnlockMars(state) || isPlanetUnlocked(state, 'mars')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'mars'],
  };
}

export function applyVenusUnlock(state: GameState): GameState {
  if (!shouldUnlockVenus(state) || isPlanetUnlocked(state, 'venus')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'venus'],
  };
}

export function applyMercuryUnlock(state: GameState): GameState {
  if (!shouldUnlockMercury(state) || isPlanetUnlocked(state, 'mercury')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'mercury'],
  };
}

export function applyJupiterUnlock(state: GameState): GameState {
  if (!shouldUnlockJupiter(state) || isPlanetUnlocked(state, 'jupiter')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'jupiter'],
  };
}

export function applySaturnUnlock(state: GameState): GameState {
  if (!shouldUnlockSaturn(state) || isPlanetUnlocked(state, 'saturn')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'saturn'],
  };
}

export function applyUranusUnlock(state: GameState): GameState {
  if (!shouldUnlockUranus(state) || isPlanetUnlocked(state, 'uranus')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'uranus'],
  };
}

export function applyNeptuneUnlock(state: GameState): GameState {
  if (!shouldUnlockNeptune(state) || isPlanetUnlocked(state, 'neptune')) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, 'neptune'],
  };
}

export function applyPlanetUnlocks(state: GameState): GameState {
  return applyNeptuneUnlock(
    applyUranusUnlock(
      applySaturnUnlock(
        applyJupiterUnlock(
          applyMercuryUnlock(applyVenusUnlock(applyMarsUnlock(state))),
        ),
      ),
    ),
  );
}

export function setSelectedPlanet(state: GameState, planetId: PlanetId): GameState {
  if (!isPlanetUnlocked(state, planetId)) {
    return state;
  }

  return {
    ...state,
    selectedPlanetId: planetId,
  };
}

function ensureUnlocked(state: GameState, planetId: PlanetId): GameState {
  if (isPlanetUnlocked(state, planetId)) {
    return state;
  }

  return {
    ...state,
    unlockedPlanets: [...state.unlockedPlanets, planetId],
  };
}

export function devUnlockMars(state: GameState): GameState {
  return ensureUnlocked(state, 'mars');
}

export function devUnlockVenus(state: GameState): GameState {
  return ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus');
}

export function devUnlockMercury(state: GameState): GameState {
  return ensureUnlocked(
    ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus'),
    'mercury',
  );
}

export function devUnlockJupiter(state: GameState): GameState {
  return ensureUnlocked(
    ensureUnlocked(
      ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus'),
      'mercury',
    ),
    'jupiter',
  );
}

export function devUnlockSaturn(state: GameState): GameState {
  return ensureUnlocked(
    ensureUnlocked(
      ensureUnlocked(
        ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus'),
        'mercury',
      ),
      'jupiter',
    ),
    'saturn',
  );
}

export function devUnlockUranus(state: GameState): GameState {
  return ensureUnlocked(
    ensureUnlocked(
      ensureUnlocked(
        ensureUnlocked(
          ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus'),
          'mercury',
        ),
        'jupiter',
      ),
      'saturn',
    ),
    'uranus',
  );
}

export function devUnlockNeptune(state: GameState): GameState {
  return ensureUnlocked(
    ensureUnlocked(
      ensureUnlocked(
        ensureUnlocked(
          ensureUnlocked(
            ensureUnlocked(ensureUnlocked(state, 'mars'), 'venus'),
            'mercury',
          ),
          'jupiter',
        ),
        'saturn',
      ),
      'uranus',
    ),
    'neptune',
  );
}

export function normalizeUnlockedPlanets(
  planets: unknown,
  earthSatelliteLevel: number,
  earthSatelliteUnlocked: boolean,
  marsOrbiterLevel = 0,
  marsOrbiterUnlocked = false,
  venusCloudStationsLevel = 0,
  venusCloudStationsUnlocked = false,
  mercuryProbeNetworkLevel = 0,
  mercuryProbeNetworkUnlocked = false,
  jupiterStormResearchLevel = 0,
  jupiterStormResearchUnlocked = false,
  saturnRingHarvestersLevel = 0,
  saturnRingHarvestersUnlocked = false,
  uranusTiltGeneratorsLevel = 0,
  uranusTiltGeneratorsUnlocked = false,
): PlanetId[] {
  const unlocked = new Set<PlanetId>([DEFAULT_PLANET_ID]);

  if (Array.isArray(planets)) {
    for (const planet of planets) {
      if (isPlanetId(planet)) {
        unlocked.add(planet);
      }
    }
  }

  if (
    earthSatelliteUnlocked &&
    earthSatelliteLevel >= MARS_UNLOCK_SATELLITE_LEVEL
  ) {
    unlocked.add('mars');
  }

  if (
    marsOrbiterUnlocked &&
    marsOrbiterLevel >= VENUS_UNLOCK_MARS_ORBITER_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
  }

  if (
    venusCloudStationsUnlocked &&
    venusCloudStationsLevel >= MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
    unlocked.add('mercury');
  }

  if (
    mercuryProbeNetworkUnlocked &&
    mercuryProbeNetworkLevel >= JUPITER_UNLOCK_PROBE_NETWORK_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
    unlocked.add('mercury');
    unlocked.add('jupiter');
  }

  if (
    jupiterStormResearchUnlocked &&
    jupiterStormResearchLevel >= SATURN_UNLOCK_STORM_RESEARCH_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
    unlocked.add('mercury');
    unlocked.add('jupiter');
    unlocked.add('saturn');
  }

  if (
    saturnRingHarvestersUnlocked &&
    saturnRingHarvestersLevel >= URANUS_UNLOCK_RING_HARVESTERS_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
    unlocked.add('mercury');
    unlocked.add('jupiter');
    unlocked.add('saturn');
    unlocked.add('uranus');
  }

  if (
    uranusTiltGeneratorsUnlocked &&
    uranusTiltGeneratorsLevel >= NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL
  ) {
    unlocked.add('mars');
    unlocked.add('venus');
    unlocked.add('mercury');
    unlocked.add('jupiter');
    unlocked.add('saturn');
    unlocked.add('uranus');
    unlocked.add('neptune');
  }

  return [...unlocked];
}

export function normalizeSelectedPlanet(
  selected: unknown,
  unlockedPlanets: PlanetId[],
): PlanetId {
  if (isPlanetId(selected) && unlockedPlanets.includes(selected)) {
    return selected;
  }

  return DEFAULT_PLANET_ID;
}

export function getMarsUnlockRequirementLabel(): string {
  return `Reach Earth Satellite Lv. ${MARS_UNLOCK_SATELLITE_LEVEL}`;
}

export function getVenusUnlockRequirementLabel(): string {
  return `Reach Mars Orbiter Lv. ${VENUS_UNLOCK_MARS_ORBITER_LEVEL}`;
}

export function getMercuryUnlockRequirementLabel(): string {
  return `Reach Venus Cloud Stations Lv. ${MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL}`;
}

export function getJupiterUnlockRequirementLabel(): string {
  return `Reach Mercury Probe Network Lv. ${JUPITER_UNLOCK_PROBE_NETWORK_LEVEL}`;
}

export function getSaturnUnlockRequirementLabel(): string {
  return `Reach Jupiter Storm Research Lv. ${SATURN_UNLOCK_STORM_RESEARCH_LEVEL}`;
}

export function getUranusUnlockRequirementLabel(): string {
  return `Reach Saturn Ring Harvesters Lv. ${URANUS_UNLOCK_RING_HARVESTERS_LEVEL}`;
}

export function getNeptuneUnlockRequirementLabel(): string {
  return `Reach Uranus Tilt Generators Lv. ${NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL}`;
}
