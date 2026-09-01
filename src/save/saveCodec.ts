import {
  findPlanetUpgradeByVisualType,
  getPlanetUpgradeTracks,
  PLANET_IDS,
  type PlanetId,
} from '../config/planets';
import { SATELLITE_UNLOCK_MOON_LEVEL } from '../game/constants';
import {
  EARTH_SATELLITES_UPGRADE_ID,
  JUPITER_STORM_RESEARCH_UPGRADE_ID,
  MARS_ORBITER_UPGRADE_ID,
  MERCURY_PROBE_NETWORK_UPGRADE_ID,
  SATURN_RING_HARVESTERS_UPGRADE_ID,
  URANUS_TILT_GENERATORS_UPGRADE_ID,
  VENUS_CLOUD_STATIONS_UPGRADE_ID,
  normalizeSelectedPlanet,
  normalizeUnlockedPlanets,
} from '../game/planetProgression';
import {
  applyUpgradeUnlocksToProgress,
  getUpgradeLevel,
  isUpgradeUnlocked,
} from '../game/planetUpgrades';
import {
  createDefaultPlanetProgress,
  createEmptyUpgradeProgress,
  createInitialPlanetStates,
  createInitialPrestigeUpgrades,
  type GameState,
  type PlanetProgressState,
  type PlanetStatesMap,
  type PrestigeUpgradeId,
  type PrestigeUpgradesState,
  type UpgradeProgressState,
} from '../game/types';
import { normalizeAchievementProgress } from '../achievements/evaluate';
import { normalizeGameSettings } from '../game/settings';
import {
  CURRENT_SAVE_VERSION,
  type LoadedSave,
  type SavedPlanetProgressV4,
  type SavedPlanetProgressV5,
  type SavedPrestigeUpgrades,
  type SavedUpgradeProgress,
  type SaveStateV1,
  type SaveStateV2,
  type SaveStateV3,
  type SaveStateV4,
  type SaveStateV5,
  type SaveStateV6,
  type SaveStateV7,
  type SaveStateV8,
  type VersionedSaveEnvelope,
} from './saveTypes';

const PRESTIGE_UPGRADE_SAVE_IDS: PrestigeUpgradeId[] = [
  'cosmicMomentum',
  'orbitalKnowledge',
  'deepSpaceReserves',
];

function safeNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
}

function safeInteger(value: unknown, fallback: number): number {
  const number = safeNumber(value, fallback);
  return Math.max(0, Math.floor(number));
}

function safeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function parseLegacyEarthProgress(record: Record<string, unknown>): SaveStateV1 {
  const moonUnlocked = safeBoolean(record.moonUnlocked, false);
  const moonLevel = moonUnlocked
    ? Math.max(1, safeInteger(record.moonLevel, 1))
    : 0;

  return {
    energy: safeNumber(record.energy, 0),
    rotationSpeedLevel: safeInteger(record.rotationSpeedLevel, 0),
    moonUnlocked,
    moonLevel,
  };
}

function resolveSatelliteProgress(
  record: Record<string, unknown>,
  moonUnlocked: boolean,
  moonLevel: number,
): Pick<SaveStateV2, 'satelliteUnlocked' | 'satelliteLevel'> {
  const qualifies = moonUnlocked && moonLevel >= SATELLITE_UNLOCK_MOON_LEVEL;
  const satelliteUnlocked = safeBoolean(record.satelliteUnlocked, qualifies);

  if (satelliteUnlocked) {
    return {
      satelliteUnlocked: true,
      satelliteLevel: Math.max(1, safeInteger(record.satelliteLevel, 1)),
    };
  }

  if (qualifies) {
    return {
      satelliteUnlocked: true,
      satelliteLevel: 1,
    };
  }

  return {
    satelliteUnlocked: false,
    satelliteLevel: 0,
  };
}

function parseSaveStateV1(raw: unknown): SaveStateV1 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return parseLegacyEarthProgress(raw as Record<string, unknown>);
}

function parseSaveStateV2(raw: unknown): SaveStateV2 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const core = parseLegacyEarthProgress(record);
  const satellite = resolveSatelliteProgress(
    record,
    core.moonUnlocked,
    core.moonLevel,
  );

  return {
    ...core,
    ...satellite,
  };
}

function parseSaveStateV3(raw: unknown): SaveStateV3 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const v2 = parseSaveStateV2(record);

  if (!v2) {
    return null;
  }

  const unlockedPlanets = normalizeUnlockedPlanets(
    record.unlockedPlanets,
    v2.satelliteLevel,
    v2.satelliteUnlocked,
  );

  return {
    ...v2,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(
      record.selectedPlanetId,
      unlockedPlanets,
    ),
  };
}

function parsePlanetProgressV4(
  raw: unknown,
  planetId: PlanetId,
): SavedPlanetProgressV4 {
  if (!raw || typeof raw !== 'object') {
    return {
      rotationSpeedLevel: 0,
      moonUnlocked: false,
      moonLevel: 0,
      satelliteUnlocked: false,
      satelliteLevel: 0,
    };
  }

  const record = raw as Record<string, unknown>;
  const moonUnlocked = safeBoolean(record.moonUnlocked, false);
  const moonLevel = moonUnlocked
    ? Math.max(1, safeInteger(record.moonLevel, 1))
    : 0;
  const satelliteUnlocked = safeBoolean(record.satelliteUnlocked, false);
  const satelliteLevel = satelliteUnlocked
    ? Math.max(1, safeInteger(record.satelliteLevel, 1))
    : 0;

  // Re-check unlock eligibility using planet config after migration to runtime state.
  void planetId;

  return {
    rotationSpeedLevel: safeInteger(record.rotationSpeedLevel, 0),
    moonUnlocked,
    moonLevel,
    satelliteUnlocked,
    satelliteLevel,
  };
}

function parsePlanetStatesMapV4(raw: unknown): Record<string, SavedPlanetProgressV4> {
  const states: Record<string, SavedPlanetProgressV4> = {};

  for (const planetId of PLANET_IDS) {
    states[planetId] = parsePlanetProgressV4(undefined, planetId);
  }

  if (!raw || typeof raw !== 'object') {
    return states;
  }

  const record = raw as Record<string, unknown>;

  for (const planetId of PLANET_IDS) {
    if (planetId in record) {
      states[planetId] = parsePlanetProgressV4(record[planetId], planetId);
    }
  }

  return states;
}

function earthProgressFromV3(v3: SaveStateV3): SavedPlanetProgressV4 {
  return {
    rotationSpeedLevel: v3.rotationSpeedLevel,
    moonUnlocked: v3.moonUnlocked,
    moonLevel: v3.moonUnlocked ? Math.max(1, v3.moonLevel) : 0,
    satelliteUnlocked: v3.satelliteUnlocked,
    satelliteLevel: v3.satelliteUnlocked ? Math.max(1, v3.satelliteLevel) : 0,
  };
}

function migrateV3ToV4(v3: SaveStateV3): SaveStateV4 {
  const planetStates = parsePlanetStatesMapV4(undefined);
  planetStates.earth = earthProgressFromV3(v3);

  const unlockedPlanets = normalizeUnlockedPlanets(
    v3.unlockedPlanets,
    planetStates.earth.satelliteLevel,
    planetStates.earth.satelliteUnlocked,
  );

  return {
    energy: v3.energy,
    planetStates,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(v3.selectedPlanetId, unlockedPlanets),
  };
}

function parseSaveStateV4(raw: unknown): SaveStateV4 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const planetStates = parsePlanetStatesMapV4(record.planetStates);
  const earth = planetStates.earth;
  const unlockedPlanets = normalizeUnlockedPlanets(
    record.unlockedPlanets,
    earth.satelliteLevel,
    earth.satelliteUnlocked,
  );

  return {
    energy: safeNumber(record.energy, 0),
    planetStates,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(
      record.selectedPlanetId,
      unlockedPlanets,
    ),
  };
}

function migrateV1ToV2(v1: SaveStateV1): SaveStateV2 {
  return parseSaveStateV2(v1) ?? {
    ...v1,
    satelliteUnlocked: false,
    satelliteLevel: 0,
  };
}

function migrateV2ToV3(v2: SaveStateV2): SaveStateV3 {
  return parseSaveStateV3(v2) ?? {
    ...v2,
    unlockedPlanets: normalizeUnlockedPlanets(
      undefined,
      v2.satelliteLevel,
      v2.satelliteUnlocked,
    ),
    selectedPlanetId: 'earth',
  };
}

function legacyFieldsToUpgrades(
  planetId: PlanetId,
  legacy: SavedPlanetProgressV4,
): Record<string, UpgradeProgressState> {
  const upgrades: Record<string, UpgradeProgressState> = {};

  for (const track of getPlanetUpgradeTracks(planetId)) {
    upgrades[track.id] = createEmptyUpgradeProgress();
  }

  const moonTrack = findPlanetUpgradeByVisualType(planetId, 'moon');
  const satelliteTrack = findPlanetUpgradeByVisualType(planetId, 'satellite');

  if (moonTrack) {
    upgrades[moonTrack.id] = {
      unlocked: legacy.moonUnlocked,
      level: legacy.moonUnlocked ? Math.max(1, legacy.moonLevel) : 0,
    };
  }

  if (satelliteTrack) {
    upgrades[satelliteTrack.id] = {
      unlocked: legacy.satelliteUnlocked,
      level: legacy.satelliteUnlocked ? Math.max(1, legacy.satelliteLevel) : 0,
    };
  }

  return upgrades;
}

function migratePlanetProgressV4ToV5(
  planetId: PlanetId,
  legacy: SavedPlanetProgressV4,
): PlanetProgressState {
  return applyUpgradeUnlocksToProgress(
    {
      rotationSpeedLevel: legacy.rotationSpeedLevel,
      upgrades: legacyFieldsToUpgrades(planetId, legacy),
    },
    planetId,
  );
}

function resolveUnlockedPlanets(
  planets: unknown,
  planetStates: PlanetStatesMap,
): PlanetId[] {
  const earth = planetStates.earth;
  const mars = planetStates.mars;
  const venus = planetStates.venus;
  const mercury = planetStates.mercury;
  const jupiter = planetStates.jupiter;
  const saturn = planetStates.saturn;
  const uranus = planetStates.uranus;

  return normalizeUnlockedPlanets(
    planets,
    getUpgradeLevel(earth, EARTH_SATELLITES_UPGRADE_ID),
    isUpgradeUnlocked(earth, EARTH_SATELLITES_UPGRADE_ID),
    getUpgradeLevel(mars, MARS_ORBITER_UPGRADE_ID),
    isUpgradeUnlocked(mars, MARS_ORBITER_UPGRADE_ID),
    getUpgradeLevel(venus, VENUS_CLOUD_STATIONS_UPGRADE_ID),
    isUpgradeUnlocked(venus, VENUS_CLOUD_STATIONS_UPGRADE_ID),
    getUpgradeLevel(mercury, MERCURY_PROBE_NETWORK_UPGRADE_ID),
    isUpgradeUnlocked(mercury, MERCURY_PROBE_NETWORK_UPGRADE_ID),
    getUpgradeLevel(jupiter, JUPITER_STORM_RESEARCH_UPGRADE_ID),
    isUpgradeUnlocked(jupiter, JUPITER_STORM_RESEARCH_UPGRADE_ID),
    getUpgradeLevel(saturn, SATURN_RING_HARVESTERS_UPGRADE_ID),
    isUpgradeUnlocked(saturn, SATURN_RING_HARVESTERS_UPGRADE_ID),
    getUpgradeLevel(uranus, URANUS_TILT_GENERATORS_UPGRADE_ID),
    isUpgradeUnlocked(uranus, URANUS_TILT_GENERATORS_UPGRADE_ID),
  );
}

function migrateV4ToV5(v4: SaveStateV4): SaveStateV5 {
  const planetStates = createInitialPlanetStates();

  for (const planetId of PLANET_IDS) {
    const legacy = v4.planetStates[planetId] ?? {
      rotationSpeedLevel: 0,
      moonUnlocked: false,
      moonLevel: 0,
      satelliteUnlocked: false,
      satelliteLevel: 0,
    };
    planetStates[planetId] = migratePlanetProgressV4ToV5(planetId, legacy);
  }

  const unlockedPlanets = resolveUnlockedPlanets(v4.unlockedPlanets, planetStates);

  return {
    energy: v4.energy,
    planetStates,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(v4.selectedPlanetId, unlockedPlanets),
  };
}

function parseUpgradeProgress(raw: unknown): UpgradeProgressState {
  if (!raw || typeof raw !== 'object') {
    return createEmptyUpgradeProgress();
  }

  const record = raw as Record<string, unknown>;
  const unlocked = safeBoolean(record.unlocked, false);

  return {
    unlocked,
    level: unlocked ? Math.max(1, safeInteger(record.level, 1)) : 0,
  };
}

function parsePlanetProgressV5(raw: unknown, planetId: PlanetId): PlanetProgressState {
  const defaults = createDefaultPlanetProgress(planetId);

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const record = raw as Record<string, unknown>;
  const upgrades: Record<string, UpgradeProgressState> = {
    ...defaults.upgrades,
  };

  if (record.upgrades && typeof record.upgrades === 'object') {
    const savedUpgrades = record.upgrades as Record<string, unknown>;

    for (const track of getPlanetUpgradeTracks(planetId)) {
      if (track.id in savedUpgrades) {
        upgrades[track.id] = parseUpgradeProgress(savedUpgrades[track.id]);
      }
    }
  }

  return applyUpgradeUnlocksToProgress(
    {
      rotationSpeedLevel: safeInteger(
        record.rotationSpeedLevel,
        defaults.rotationSpeedLevel,
      ),
      upgrades,
    },
    planetId,
  );
}

function parsePlanetStatesMapV5(raw: unknown): PlanetStatesMap {
  const states = createInitialPlanetStates();

  if (!raw || typeof raw !== 'object') {
    return states;
  }

  const record = raw as Record<string, unknown>;

  for (const planetId of PLANET_IDS) {
    if (planetId in record) {
      states[planetId] = parsePlanetProgressV5(record[planetId], planetId);
    }
  }

  return states;
}

function parseSaveStateV5(raw: unknown): SaveStateV5 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const planetStates = parsePlanetStatesMapV5(record.planetStates);
  const unlockedPlanets = resolveUnlockedPlanets(
    record.unlockedPlanets,
    planetStates,
  );

  return {
    energy: safeNumber(record.energy, 0),
    planetStates,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(
      record.selectedPlanetId,
      unlockedPlanets,
    ),
  };
}

function parsePrestigeUpgrades(raw: unknown): SavedPrestigeUpgrades {
  const defaults = createInitialPrestigeUpgrades();
  const record =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const result = {} as SavedPrestigeUpgrades;

  for (const id of PRESTIGE_UPGRADE_SAVE_IDS) {
    const entry = record[id];
    const level =
      entry && typeof entry === 'object'
        ? safeInteger((entry as Record<string, unknown>).level, defaults[id].level)
        : defaults[id].level;
    result[id] = { level };
  }

  return result;
}

function migrateV5ToV6(v5: SaveStateV5): SaveStateV6 {
  return {
    ...v5,
    stardust: 0,
    prestigeCount: 0,
    prestigeUpgrades: createInitialPrestigeUpgrades(),
  };
}

function parseSaveStateV6(raw: unknown): SaveStateV6 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const v5 = parseSaveStateV5(record);

  if (!v5) {
    return null;
  }

  return {
    ...v5,
    stardust: safeNumber(record.stardust, 0),
    prestigeCount: safeInteger(record.prestigeCount, 0),
    prestigeUpgrades: parsePrestigeUpgrades(record.prestigeUpgrades),
  };
}

function migrateV6ToV7(v6: SaveStateV6): SaveStateV7 {
  return {
    ...v6,
    settings: {
      soundEnabled: true,
      hapticsEnabled: true,
    },
  };
}

function parseSaveStateV7(raw: unknown): SaveStateV7 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const v6 = parseSaveStateV6(record);

  if (!v6) {
    return null;
  }

  return {
    ...v6,
    settings: normalizeGameSettings(record.settings),
  };
}

function migrateV7ToV8(v7: SaveStateV7): SaveStateV8 {
  return {
    ...v7,
    achievements: {
      completedIds: [],
      claimedIds: [],
      peakSpinProductionMultiplier: 1,
    },
  };
}

function parseAchievementProgress(raw: unknown) {
  return normalizeAchievementProgress(raw);
}

function parseSaveStateV8(raw: unknown): SaveStateV8 | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const v7 = parseSaveStateV7(record);

  if (!v7) {
    return null;
  }

  return {
    ...v7,
    achievements: parseAchievementProgress(record.achievements),
  };
}

function migrateEnvelope(envelope: VersionedSaveEnvelope): SaveStateV8 | null {
  switch (envelope.version) {
    case 1: {
      const v1 = parseSaveStateV1(envelope.state);
      return v1
        ? migrateV7ToV8(
            migrateV6ToV7(
              migrateV5ToV6(
                migrateV4ToV5(migrateV3ToV4(migrateV2ToV3(migrateV1ToV2(v1)))),
              ),
            ),
          )
        : null;
    }
    case 2: {
      const v2 = parseSaveStateV2(envelope.state);
      return v2
        ? migrateV7ToV8(
            migrateV6ToV7(
              migrateV5ToV6(migrateV4ToV5(migrateV3ToV4(migrateV2ToV3(v2)))),
            ),
          )
        : null;
    }
    case 3: {
      const v3 = parseSaveStateV3(envelope.state);
      return v3
        ? migrateV7ToV8(
            migrateV6ToV7(migrateV5ToV6(migrateV4ToV5(migrateV3ToV4(v3)))),
          )
        : null;
    }
    case 4: {
      const v4 = parseSaveStateV4(envelope.state);
      return v4
        ? migrateV7ToV8(migrateV6ToV7(migrateV5ToV6(migrateV4ToV5(v4))))
        : null;
    }
    case 5: {
      const v5 = parseSaveStateV5(envelope.state);
      return v5 ? migrateV7ToV8(migrateV6ToV7(migrateV5ToV6(v5))) : null;
    }
    case 6: {
      const v6 = parseSaveStateV6(envelope.state);
      return v6 ? migrateV7ToV8(migrateV6ToV7(v6)) : null;
    }
    case 7: {
      const v7 = parseSaveStateV7(envelope.state);
      return v7 ? migrateV7ToV8(v7) : null;
    }
    case 8:
      return parseSaveStateV8(envelope.state);
    default:
      return null;
  }
}

function toSavedPrestigeUpgrades(
  upgrades: PrestigeUpgradesState,
): SavedPrestigeUpgrades {
  return {
    cosmicMomentum: { level: upgrades.cosmicMomentum.level },
    orbitalKnowledge: { level: upgrades.orbitalKnowledge.level },
    deepSpaceReserves: { level: upgrades.deepSpaceReserves.level },
  };
}

function toSavedUpgradeProgress(
  progress: UpgradeProgressState,
): SavedUpgradeProgress {
  return {
    unlocked: progress.unlocked,
    level: progress.level,
  };
}

function toSavedPlanetProgressV5(
  progress: PlanetProgressState,
): SavedPlanetProgressV5 {
  const upgrades: Record<string, SavedUpgradeProgress> = {};

  for (const [upgradeId, upgrade] of Object.entries(progress.upgrades)) {
    upgrades[upgradeId] = toSavedUpgradeProgress(upgrade);
  }

  return {
    rotationSpeedLevel: progress.rotationSpeedLevel,
    upgrades,
  };
}

export function serializeGameState(
  state: GameState,
  savedAt = Date.now(),
): VersionedSaveEnvelope {
  const planetStates: Record<string, SavedPlanetProgressV5> = {};

  for (const planetId of PLANET_IDS) {
    planetStates[planetId] = toSavedPlanetProgressV5(state.planetStates[planetId]);
  }

  const saveState: SaveStateV8 = {
    energy: state.energy,
    planetStates,
    unlockedPlanets: state.unlockedPlanets,
    selectedPlanetId: state.selectedPlanetId,
    stardust: state.stardust,
    prestigeCount: state.prestigeCount,
    prestigeUpgrades: toSavedPrestigeUpgrades(state.prestigeUpgrades),
    settings: {
      soundEnabled: state.settings.soundEnabled,
      hapticsEnabled: state.settings.hapticsEnabled,
    },
    achievements: {
      completedIds: [...state.achievements.completedIds],
      claimedIds: [...state.achievements.claimedIds],
      peakSpinProductionMultiplier:
        state.achievements.peakSpinProductionMultiplier,
    },
  };

  return {
    version: CURRENT_SAVE_VERSION,
    savedAt,
    state: saveState,
  };
}

export function parseSaveEnvelope(raw: string): LoadedSave | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const envelope = parsed as Partial<VersionedSaveEnvelope>;

    if (
      typeof envelope.version !== 'number' ||
      typeof envelope.savedAt !== 'number' ||
      !Number.isFinite(envelope.savedAt)
    ) {
      return null;
    }

    const state = migrateEnvelope({
      version: envelope.version,
      savedAt: envelope.savedAt,
      state: envelope.state,
    });

    if (!state) {
      return null;
    }

    return {
      savedAt: envelope.savedAt,
      state,
    };
  } catch {
    return null;
  }
}

export function toGameState(saveState: SaveStateV8): GameState {
  const planetStates = parsePlanetStatesMapV5(saveState.planetStates);
  const unlockedPlanets = resolveUnlockedPlanets(
    saveState.unlockedPlanets,
    planetStates,
  );

  return {
    energy: saveState.energy,
    planetStates,
    unlockedPlanets,
    selectedPlanetId: normalizeSelectedPlanet(
      saveState.selectedPlanetId,
      unlockedPlanets,
    ),
    stardust: saveState.stardust,
    prestigeCount: saveState.prestigeCount,
    prestigeUpgrades: parsePrestigeUpgrades(saveState.prestigeUpgrades),
    settings: normalizeGameSettings(saveState.settings),
    achievements: normalizeAchievementProgress(saveState.achievements),
  };
}
