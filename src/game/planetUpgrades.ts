import {
  getPlanetEconomy,
  getPlanetUpgradeConfig,
  getPlanetUpgradeTracks,
  getUpgradeUnlockRequirementLabel,
  type PlanetId,
  type PlanetUpgradeConfig,
} from '../config/planets';
import { applyOrbitalKnowledgeToCost } from './prestige';
import {
  createEmptyUpgradeProgress,
  getPlanetProgress,
  getUpgradeLevel,
  getUpgradeProgress,
  isUpgradeUnlocked,
  updatePlanetProgress,
  type GameState,
  type PlanetProgressState,
  type UpgradeProgressState,
} from './types';

export function ensurePlanetUpgradeSlots(
  progress: PlanetProgressState,
  planetId: PlanetId,
): PlanetProgressState {
  const tracks = getPlanetUpgradeTracks(planetId);
  let changed = false;
  const upgrades = { ...progress.upgrades };

  for (const track of tracks) {
    if (!(track.id in upgrades)) {
      upgrades[track.id] = createEmptyUpgradeProgress();
      changed = true;
    }
  }

  if (!changed) {
    return progress;
  }

  return {
    ...progress,
    upgrades,
  };
}

export function getUpgradeMultiplier(
  level: number,
  bonusPerLevel: number,
): number {
  if (level <= 0) {
    return 1;
  }

  return 1 + level * bonusPerLevel;
}

/** Product of all configured production upgrade multipliers for a planet. */
export function getConfiguredUpgradesMultiplier(
  progress: PlanetProgressState,
  planetId: PlanetId,
): number {
  let multiplier = 1;

  for (const track of getPlanetUpgradeTracks(planetId)) {
    const level = getUpgradeLevel(progress, track.id);
    multiplier *= getUpgradeMultiplier(level, track.bonusPerLevel);
  }

  return multiplier;
}

export function getUpgradeProductionBonusPercent(
  level: number,
  bonusPerLevel: number,
): number {
  return level * bonusPerLevel * 100;
}

export function getUpgradeCost(
  level: number,
  track: PlanetUpgradeConfig,
  state?: GameState,
): number {
  if (level < 1) {
    return 0;
  }

  const configured =
    track.baseUpgradeCost * Math.pow(track.costMultiplier, level - 1);

  if (!state) {
    return configured;
  }

  return applyOrbitalKnowledgeToCost(configured, state);
}

export function canPurchaseUpgrade(
  energy: number,
  level: number,
  track: PlanetUpgradeConfig,
  state?: GameState,
): boolean {
  if (level < 1) {
    return false;
  }

  return energy >= getUpgradeCost(level, track, state);
}

export function isUnlockRequirementMet(
  progress: PlanetProgressState,
  track: PlanetUpgradeConfig,
): boolean {
  if (track.unlock.type === 'rotationSpeed') {
    return progress.rotationSpeedLevel >= track.unlock.level;
  }

  const dependency = getUpgradeProgress(progress, track.unlock.upgradeId);
  return (
    dependency.unlocked && dependency.level >= track.unlock.level
  );
}

export function shouldUnlockUpgrade(
  progress: PlanetProgressState,
  planetId: PlanetId,
  upgradeId: string,
): boolean {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);

  if (!track) {
    return false;
  }

  const current = getUpgradeProgress(progress, upgradeId);
  return !current.unlocked && isUnlockRequirementMet(progress, track);
}

export function unlockUpgradeInProgress(
  progress: PlanetProgressState,
  planetId: PlanetId,
  upgradeId: string,
): PlanetProgressState {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);

  if (!track || !shouldUnlockUpgrade(progress, planetId, upgradeId)) {
    return progress;
  }

  return {
    ...progress,
    upgrades: {
      ...progress.upgrades,
      [upgradeId]: {
        unlocked: true,
        level: track.startingLevel,
      },
    },
  };
}

/**
 * Apply any newly earned upgrade unlocks (may cascade in config order).
 */
export function applyUpgradeUnlocksToProgress(
  progress: PlanetProgressState,
  planetId: PlanetId,
): PlanetProgressState {
  let next = ensurePlanetUpgradeSlots(progress, planetId);
  let changed = true;

  while (changed) {
    changed = false;

    for (const track of getPlanetUpgradeTracks(planetId)) {
      if (shouldUnlockUpgrade(next, planetId, track.id)) {
        next = unlockUpgradeInProgress(next, planetId, track.id);
        changed = true;
      }
    }
  }

  return next;
}

export function applyUpgradeUnlocks(
  state: GameState,
  planetId: PlanetId,
): GameState {
  return updatePlanetProgress(state, planetId, (progress) =>
    applyUpgradeUnlocksToProgress(progress, planetId),
  );
}

export function applyAllPlanetUpgradeUnlocks(state: GameState): GameState {
  let next = state;

  for (const planetId of state.unlockedPlanets) {
    next = applyUpgradeUnlocks(next, planetId);
  }

  return next;
}

export function purchaseUpgradeForProgress(
  energy: number,
  progress: PlanetProgressState,
  planetId: PlanetId,
  upgradeId: string,
  state: GameState,
): { energy: number; progress: PlanetProgressState } | null {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);
  const current = getUpgradeProgress(progress, upgradeId);

  if (!track || !current.unlocked || current.level < 1) {
    return null;
  }

  const cost = getUpgradeCost(current.level, track, state);

  if (energy < cost) {
    return null;
  }

  return {
    energy: energy - cost,
    progress: {
      ...progress,
      upgrades: {
        ...progress.upgrades,
        [upgradeId]: {
          unlocked: true,
          level: current.level + 1,
        },
      },
    },
  };
}

export function purchaseUpgrade(
  state: GameState,
  planetId: PlanetId,
  upgradeId: string,
): GameState | null {
  const result = purchaseUpgradeForProgress(
    state.energy,
    getPlanetProgress(state, planetId),
    planetId,
    upgradeId,
    state,
  );

  if (!result) {
    return null;
  }

  return updatePlanetProgress(
    {
      ...state,
      energy: result.energy,
    },
    planetId,
    () => result.progress,
  );
}

export interface UpgradeViewModel {
  id: string;
  displayName: string;
  level: number;
  productionBonusPercent: number;
  upgradeCost: number;
  canAfford: boolean;
  unlockRequirementLabel: string;
}

export function getUpgradeViewModel(
  energy: number,
  progress: PlanetProgressState,
  planetId: PlanetId,
  upgradeId: string,
  state?: GameState,
): UpgradeViewModel | null {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);

  if (!track) {
    return null;
  }

  const current = getUpgradeProgress(progress, upgradeId);

  return {
    id: track.id,
    displayName: track.displayName,
    level: current.level,
    productionBonusPercent: getUpgradeProductionBonusPercent(
      current.level,
      track.bonusPerLevel,
    ),
    upgradeCost: getUpgradeCost(current.level, track, state),
    canAfford: canPurchaseUpgrade(energy, current.level, track, state),
    unlockRequirementLabel: getUpgradeUnlockRequirementLabel(planetId, upgradeId),
  };
}

/** First production upgrade track (Moon / Phobos) — used by DEV primary button. */
export function getPrimaryUpgradeTrack(
  planetId: PlanetId,
): PlanetUpgradeConfig | undefined {
  return getPlanetUpgradeTracks(planetId)[0];
}

/** Second production upgrade track (Satellite / Orbiter) — used by DEV secondary button. */
export function getSecondaryUpgradeTrack(
  planetId: PlanetId,
): PlanetUpgradeConfig | undefined {
  return getPlanetUpgradeTracks(planetId)[1];
}

export function withUpgradeProgress(
  progress: PlanetProgressState,
  upgradeId: string,
  next: UpgradeProgressState,
): PlanetProgressState {
  return {
    ...progress,
    upgrades: {
      ...progress.upgrades,
      [upgradeId]: next,
    },
  };
}

export function bumpUpgradeLevel(
  progress: PlanetProgressState,
  planetId: PlanetId,
  upgradeId: string,
): PlanetProgressState {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);
  const current = getUpgradeProgress(progress, upgradeId);

  if (!track) {
    return progress;
  }

  if (!current.unlocked) {
    return withUpgradeProgress(progress, upgradeId, {
      unlocked: true,
      level: track.startingLevel,
    });
  }

  return withUpgradeProgress(progress, upgradeId, {
    unlocked: true,
    level: current.level + 1,
  });
}

export {
  getUpgradeLevel,
  getUpgradeProgress,
  getUpgradeUnlockRequirementLabel,
  isUpgradeUnlocked,
};

/** @deprecated Prefer getPlanetEconomy(planetId).baseEnergyPerSecond — kept for call-site clarity. */
export function getPlanetBaseEnergyPerSecond(planetId: PlanetId): number {
  return getPlanetEconomy(planetId).baseEnergyPerSecond;
}
