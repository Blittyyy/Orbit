import { PLANET_IDS, type PlanetId } from '../config/planets';
import { getPlanetUpgradeTracks } from '../config/planets/economy';
import type { AchievementProgressState } from '../achievements/types';
import { createInitialAchievementProgress } from '../achievements/types';
import type { GameSettings } from './settings';
import { DEFAULT_GAME_SETTINGS } from './settings';

export type { GameSettings };
export { DEFAULT_GAME_SETTINGS };
export type { AchievementProgressState };
export { createInitialAchievementProgress };

/** Persistent progress for one configured upgrade track. */
export interface UpgradeProgressState {
  unlocked: boolean;
  level: number;
}

/** Persistent progression for a single planet. Visual/animation state lives elsewhere. */
export interface PlanetProgressState {
  rotationSpeedLevel: number;
  upgrades: Record<string, UpgradeProgressState>;
}

export type PlanetStatesMap = Record<PlanetId, PlanetProgressState>;

export type PrestigeUpgradeId =
  | 'cosmicMomentum'
  | 'orbitalKnowledge'
  | 'deepSpaceReserves';

export interface PrestigeUpgradeProgress {
  level: number;
}

export type PrestigeUpgradesState = Record<PrestigeUpgradeId, PrestigeUpgradeProgress>;

export interface GameState {
  energy: number;
  planetStates: PlanetStatesMap;
  unlockedPlanets: PlanetId[];
  selectedPlanetId: PlanetId;
  /** Permanent prestige currency — survives Solar System collapse. */
  stardust: number;
  /** Number of completed Solar System prestiges. */
  prestigeCount: number;
  prestigeUpgrades: PrestigeUpgradesState;
  settings: GameSettings;
  achievements: AchievementProgressState;
}

export function createEmptyUpgradeProgress(): UpgradeProgressState {
  return {
    unlocked: false,
    level: 0,
  };
}

export function createInitialPrestigeUpgrades(): PrestigeUpgradesState {
  return {
    cosmicMomentum: { level: 0 },
    orbitalKnowledge: { level: 0 },
    deepSpaceReserves: { level: 0 },
  };
}

export function createDefaultPlanetProgress(
  planetId?: PlanetId,
): PlanetProgressState {
  const upgrades: Record<string, UpgradeProgressState> = {};

  if (planetId) {
    for (const track of getPlanetUpgradeTracks(planetId)) {
      upgrades[track.id] = createEmptyUpgradeProgress();
    }
  }

  return {
    rotationSpeedLevel: 0,
    upgrades,
  };
}

export function createInitialPlanetStates(): PlanetStatesMap {
  const states = {} as PlanetStatesMap;

  for (const planetId of PLANET_IDS) {
    states[planetId] = createDefaultPlanetProgress(planetId);
  }

  return states;
}

export function getPlanetProgress(
  state: GameState,
  planetId: PlanetId,
): PlanetProgressState {
  return state.planetStates[planetId] ?? createDefaultPlanetProgress(planetId);
}

export function withPlanetProgress(
  state: GameState,
  planetId: PlanetId,
  progress: PlanetProgressState,
): GameState {
  return {
    ...state,
    planetStates: {
      ...state.planetStates,
      [planetId]: progress,
    },
  };
}

export function updatePlanetProgress(
  state: GameState,
  planetId: PlanetId,
  updater: (progress: PlanetProgressState) => PlanetProgressState,
): GameState {
  return withPlanetProgress(state, planetId, updater(getPlanetProgress(state, planetId)));
}

export function getUpgradeProgress(
  progress: PlanetProgressState,
  upgradeId: string,
): UpgradeProgressState {
  return progress.upgrades[upgradeId] ?? createEmptyUpgradeProgress();
}

export function isUpgradeUnlocked(
  progress: PlanetProgressState,
  upgradeId: string,
): boolean {
  return getUpgradeProgress(progress, upgradeId).unlocked;
}

export function getUpgradeLevel(
  progress: PlanetProgressState,
  upgradeId: string,
): number {
  return getUpgradeProgress(progress, upgradeId).level;
}
