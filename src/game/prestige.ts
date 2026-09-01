/** Prestige meta-progression config and helpers. */

import { DEFAULT_PLANET_ID } from '../config/planets';
import {
  applyPlanetUnlocks,
  devUnlockNeptune,
  isPlanetUnlocked,
} from './planetProgression';
import { applyUpgradeUnlocks } from './planetUpgrades';
import {
  createInitialPlanetStates,
  createInitialPrestigeUpgrades,
  getPlanetProgress,
  getUpgradeLevel,
  isUpgradeUnlocked,
  type GameState,
  type PrestigeUpgradeId,
  type PrestigeUpgradesState,
} from './types';

export type { PrestigeUpgradeId, PrestigeUpgradesState };

export const PRESTIGE_STARDUST_REWARD = 10;

export const BASE_OFFLINE_DURATION_MS = 4 * 60 * 60 * 1000;
export const OFFLINE_DURATION_BONUS_PER_LEVEL_MS = 60 * 60 * 1000;

export const COSMIC_MOMENTUM_BONUS_PER_LEVEL = 0.1;
export const ORBITAL_KNOWLEDGE_DISCOUNT_PER_LEVEL = 0.05;
export const ORBITAL_KNOWLEDGE_MAX_DISCOUNT = 0.5;

export const NEPTUNE_STORM_HARVESTERS_UPGRADE_ID = 'stormHarvesters';
export const PRESTIGE_STORM_HARVESTERS_LEVEL = 10;

export interface PrestigeUpgradeConfig {
  id: PrestigeUpgradeId;
  displayName: string;
  description: string;
  /** Stardust cost to go from `currentLevel` → `currentLevel + 1`. */
  getNextCost: (currentLevel: number) => number;
}

export const PRESTIGE_UPGRADE_IDS: PrestigeUpgradeId[] = [
  'cosmicMomentum',
  'orbitalKnowledge',
  'deepSpaceReserves',
];

export const PRESTIGE_UPGRADES: Record<PrestigeUpgradeId, PrestigeUpgradeConfig> = {
  cosmicMomentum: {
    id: 'cosmicMomentum',
    displayName: 'Cosmic Momentum',
    description: '+10% production from all planets per level',
    getNextCost: (currentLevel) => currentLevel + 1,
  },
  orbitalKnowledge: {
    id: 'orbitalKnowledge',
    displayName: 'Orbital Knowledge',
    description: '−5% Energy upgrade costs per level (max 50%)',
    getNextCost: (currentLevel) => 2 * (currentLevel + 1),
  },
  deepSpaceReserves: {
    id: 'deepSpaceReserves',
    displayName: 'Deep Space Reserves',
    description: '+1 hour maximum offline earnings per level',
    getNextCost: (currentLevel) => 2 * (currentLevel + 1),
  },
};

export { createInitialPrestigeUpgrades };

export function getPrestigeUpgradeLevel(
  state: GameState,
  upgradeId: PrestigeUpgradeId,
): number {
  return state.prestigeUpgrades[upgradeId]?.level ?? 0;
}

/** True when Neptune Storm Harvesters is Lv. 10+ (prestige available). */
export function canPrestige(state: GameState): boolean {
  if (!isPlanetUnlocked(state, 'neptune')) {
    return false;
  }

  const neptune = getPlanetProgress(state, 'neptune');
  return (
    isUpgradeUnlocked(neptune, NEPTUNE_STORM_HARVESTERS_UPGRADE_ID) &&
    getUpgradeLevel(neptune, NEPTUNE_STORM_HARVESTERS_UPGRADE_ID) >=
      PRESTIGE_STORM_HARVESTERS_LEVEL
  );
}

export function getCosmicMomentumMultiplier(state: GameState): number {
  return (
    1 +
    getPrestigeUpgradeLevel(state, 'cosmicMomentum') *
      COSMIC_MOMENTUM_BONUS_PER_LEVEL
  );
}

export function getCosmicMomentumBonusPercent(state: GameState): number {
  return getPrestigeUpgradeLevel(state, 'cosmicMomentum') * 10;
}

export function getOrbitalKnowledgeDiscount(state: GameState): number {
  return Math.min(
    ORBITAL_KNOWLEDGE_MAX_DISCOUNT,
    getPrestigeUpgradeLevel(state, 'orbitalKnowledge') *
      ORBITAL_KNOWLEDGE_DISCOUNT_PER_LEVEL,
  );
}

export function getOrbitalKnowledgeDiscountPercent(state: GameState): number {
  return getOrbitalKnowledgeDiscount(state) * 100;
}

/** Multiplier applied to configured Energy upgrade costs (0.5–1). */
export function getOrbitalKnowledgeCostMultiplier(state: GameState): number {
  return 1 - getOrbitalKnowledgeDiscount(state);
}

/**
 * Apply Orbital Knowledge discount to a configured Energy cost.
 * Costs never drop to 0 or below.
 */
export function applyOrbitalKnowledgeToCost(
  configuredCost: number,
  state: GameState,
): number {
  if (!Number.isFinite(configuredCost) || configuredCost <= 0) {
    return configuredCost;
  }

  const discounted =
    configuredCost * getOrbitalKnowledgeCostMultiplier(state);
  return Math.max(1, Math.ceil(discounted - Number.EPSILON));
}

export function getMaxOfflineDurationMs(state: GameState): number {
  return (
    BASE_OFFLINE_DURATION_MS +
    getPrestigeUpgradeLevel(state, 'deepSpaceReserves') *
      OFFLINE_DURATION_BONUS_PER_LEVEL_MS
  );
}

export function getMaxOfflineDurationHours(state: GameState): number {
  return getMaxOfflineDurationMs(state) / (60 * 60 * 1000);
}

export function getPrestigeUpgradeNextCost(
  state: GameState,
  upgradeId: PrestigeUpgradeId,
): number {
  return PRESTIGE_UPGRADES[upgradeId].getNextCost(
    getPrestigeUpgradeLevel(state, upgradeId),
  );
}

export function canAffordPrestigeUpgrade(
  state: GameState,
  upgradeId: PrestigeUpgradeId,
): boolean {
  return state.stardust >= getPrestigeUpgradeNextCost(state, upgradeId);
}

export function purchasePrestigeUpgrade(
  state: GameState,
  upgradeId: PrestigeUpgradeId,
): GameState | null {
  const cost = getPrestigeUpgradeNextCost(state, upgradeId);

  if (state.stardust < cost) {
    return null;
  }

  const currentLevel = getPrestigeUpgradeLevel(state, upgradeId);

  return {
    ...state,
    stardust: state.stardust - cost,
    prestigeUpgrades: {
      ...state.prestigeUpgrades,
      [upgradeId]: { level: currentLevel + 1 },
    },
  };
}

/**
 * Reset run progression; keep Stardust / prestigeCount / prestige upgrades,
 * then grant this prestige's Stardust reward.
 */
export function performPrestige(state: GameState): GameState | null {
  if (!canPrestige(state)) {
    return null;
  }

  const preservedStardust = state.stardust + PRESTIGE_STARDUST_REWARD;
  const preservedCount = state.prestigeCount + 1;
  const preservedUpgrades = { ...state.prestigeUpgrades };

  let next: GameState = {
    energy: 0,
    planetStates: createInitialPlanetStates(),
    unlockedPlanets: [DEFAULT_PLANET_ID],
    selectedPlanetId: DEFAULT_PLANET_ID,
    stardust: preservedStardust,
    prestigeCount: preservedCount,
    prestigeUpgrades: preservedUpgrades,
    settings: state.settings,
    achievements: state.achievements,
  };

  next = applyUpgradeUnlocks(next, DEFAULT_PLANET_ID);
  return applyPlanetUnlocks(next);
}

export function getNeptuneStormHarvestersProgress(state: GameState): {
  level: number;
  required: number;
  unlocked: boolean;
} {
  const neptune = getPlanetProgress(state, 'neptune');
  return {
    level: getUpgradeLevel(neptune, NEPTUNE_STORM_HARVESTERS_UPGRADE_ID),
    required: PRESTIGE_STORM_HARVESTERS_LEVEL,
    unlocked: isUpgradeUnlocked(neptune, NEPTUNE_STORM_HARVESTERS_UPGRADE_ID),
  };
}

/** DEV: unlock the full system and meet the prestige Storm Harvesters gate. */
export function readyPrestigeForDev(state: GameState): GameState {
  let next = devUnlockNeptune(state);
  next = {
    ...next,
    planetStates: {
      ...next.planetStates,
      neptune: {
        rotationSpeedLevel: Math.max(
          10,
          getPlanetProgress(next, 'neptune').rotationSpeedLevel,
        ),
        upgrades: {
          ...getPlanetProgress(next, 'neptune').upgrades,
          triton: { unlocked: true, level: 5 },
          stormHarvesters: {
            unlocked: true,
            level: PRESTIGE_STORM_HARVESTERS_LEVEL,
          },
        },
      },
    },
  };

  return applyPlanetUnlocks(applyUpgradeUnlocks(next, 'neptune'));
}

export function devAddStardust(state: GameState, amount = PRESTIGE_STARDUST_REWARD): GameState {
  return {
    ...state,
    stardust: state.stardust + amount,
  };
}
