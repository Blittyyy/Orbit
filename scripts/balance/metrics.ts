import {
  getPlayablePlanetIds,
  getPlanetUpgradeTracks,
  type PlanetId,
} from '../../src/config/planets';
import {
  getPlanetEnergyPerSecond,
  getPlanetPassiveEnergyPerSecond,
} from '../../src/game/energyLogic';
import {
  getPrimaryUpgradeTrack,
  getSecondaryUpgradeTrack,
  getUpgradeCost,
  isUpgradeUnlocked,
} from '../../src/game/planetUpgrades';
import {
  canPrestige,
  PRESTIGE_STORM_HARVESTERS_LEVEL,
} from '../../src/game/prestige';
import { getRotationSpeedUpgradeCost } from '../../src/game/rotationSpeedUpgrade';
import {
  getPlanetProgress,
  getUpgradeLevel,
  type GameState,
} from '../../src/game/types';
import { OPTIMIZER_CONFIG } from './config';
import type { PurchaseOption } from './types';

export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

/** Newest unlocked unfinished planet, else the newest unlocked planet. */
export function getFrontierPlanetId(state: GameState): PlanetId {
  const order = getPlayablePlanetIds();
  let newestUnlocked: PlanetId = order[0] ?? 'earth';

  for (const planetId of order) {
    if (!state.unlockedPlanets.includes(planetId)) {
      break;
    }

    newestUnlocked = planetId;

    if (!isPlanetSegmentComplete(state, planetId)) {
      return planetId;
    }
  }

  return newestUnlocked;
}

export function getSystemEps(
  state: GameState,
  frontierPlanetId: PlanetId,
  frontierSpinMultiplier: number,
): number {
  let total = 0;

  for (const planetId of getPlayablePlanetIds()) {
    if (!state.unlockedPlanets.includes(planetId)) {
      continue;
    }

    const spin =
      planetId === frontierPlanetId ? frontierSpinMultiplier : 1;
    total += getPlanetEnergyPerSecond(state, planetId, spin);
  }

  return total;
}

export function getPassivePlanetEpsMap(
  state: GameState,
): Partial<Record<PlanetId, number>> {
  const result: Partial<Record<PlanetId, number>> = {};

  for (const planetId of getPlayablePlanetIds()) {
    if (!state.unlockedPlanets.includes(planetId)) {
      continue;
    }
    result[planetId] = getPlanetPassiveEnergyPerSecond(state, planetId);
  }

  return result;
}

function nextPlanetUnlockInfo(
  state: GameState,
  planetId: PlanetId,
): { upgradeId: string; requiredLevel: number; label: string } | null {
  const secondary = getSecondaryUpgradeTrack(planetId);
  if (!secondary) {
    return null;
  }

  const playable = getPlayablePlanetIds();
  const index = playable.indexOf(planetId);
  const nextPlanet = index >= 0 ? playable[index + 1] : undefined;

  if (nextPlanet) {
    return {
      upgradeId: secondary.id,
      requiredLevel: 10,
      label: `Unlock ${nextPlanet}`,
    };
  }

  if (planetId === 'neptune') {
    return {
      upgradeId: secondary.id,
      requiredLevel: PRESTIGE_STORM_HARVESTERS_LEVEL,
      label: 'Prestige ready (Storm Harvesters Lv. 10)',
    };
  }

  return null;
}

function unlockAdvancementForRotation(
  state: GameState,
  planetId: PlanetId,
): { advances: boolean; label: string | null; levelsToUnlock: number | null } {
  const progress = getPlanetProgress(state, planetId);
  const primary = getPrimaryUpgradeTrack(planetId);

  if (!primary || primary.unlock.type !== 'rotationSpeed') {
    return { advances: false, label: null, levelsToUnlock: null };
  }

  if (isUpgradeUnlocked(progress, primary.id)) {
    return { advances: false, label: null, levelsToUnlock: null };
  }

  const required = primary.unlock.level;
  const nextLevel = progress.rotationSpeedLevel + 1;
  const levelsToUnlock = Math.max(0, required - progress.rotationSpeedLevel);

  return {
    advances: nextLevel <= required,
    label: `Unlock ${primary.displayName}`,
    levelsToUnlock,
  };
}

function unlockAdvancementForTrack(
  state: GameState,
  planetId: PlanetId,
  upgradeId: string,
): { advances: boolean; label: string | null; levelsToUnlock: number | null } {
  const progress = getPlanetProgress(state, planetId);
  const tracks = getPlanetUpgradeTracks(planetId);
  const primary = tracks[0];
  const secondary = tracks[1];
  const currentLevel = getUpgradeLevel(progress, upgradeId);
  const nextLevel = currentLevel + 1;

  if (primary && upgradeId === primary.id && secondary) {
    if (
      secondary.unlock.type === 'upgrade' &&
      secondary.unlock.upgradeId === primary.id &&
      !isUpgradeUnlocked(progress, secondary.id)
    ) {
      const required = secondary.unlock.level;
      return {
        advances: nextLevel <= required,
        label: `Unlock ${secondary.displayName}`,
        levelsToUnlock: Math.max(0, required - currentLevel),
      };
    }
  }

  if (secondary && upgradeId === secondary.id) {
    const gate = nextPlanetUnlockInfo(state, planetId);
    if (gate && gate.upgradeId === secondary.id) {
      return {
        advances: nextLevel <= gate.requiredLevel,
        label: gate.label,
        levelsToUnlock: Math.max(0, gate.requiredLevel - currentLevel),
      };
    }
  }

  return { advances: false, label: null, levelsToUnlock: null };
}

function scoreOption(
  option: Omit<PurchaseOption, 'score'>,
  frontierPlanetId: PlanetId,
): number {
  const payback = Math.max(option.paybackSeconds, 0);
  const efficiency = 1 / (payback + 1);

  let score = efficiency;

  if (option.advancesUnlock) {
    score += OPTIMIZER_CONFIG.unlockScoreBonus * efficiency;
    if (option.levelsToUnlock != null) {
      score +=
        OPTIMIZER_CONFIG.unlockProximityBonusPerLevel /
        Math.max(1, option.levelsToUnlock);
    }
  }

  if (option.planetId === frontierPlanetId) {
    score += OPTIMIZER_CONFIG.frontierPreferenceBonus * efficiency;
  }

  return score;
}

function buildOption(
  state: GameState,
  frontierPlanetId: PlanetId,
  frontierSpinMultiplier: number,
  partial: Omit<
    PurchaseOption,
    | 'currentEps'
    | 'epsAfter'
    | 'deltaEps'
    | 'paybackSeconds'
    | 'score'
  > & { apply: (s: GameState) => GameState | null },
): PurchaseOption | null {
  const currentEps = getSystemEps(state, frontierPlanetId, frontierSpinMultiplier);

  // Preview with enough Energy so cost affordability does not hide the option.
  const previewState: GameState = {
    ...state,
    energy: Number.MAX_SAFE_INTEGER,
  };
  const nextState = partial.apply(previewState);

  if (!nextState) {
    return null;
  }

  const epsAfter = getSystemEps(
    nextState,
    frontierPlanetId,
    frontierSpinMultiplier,
  );
  const deltaEps = Math.max(0, epsAfter - currentEps);
  const paybackSeconds =
    deltaEps > OPTIMIZER_CONFIG.minDeltaEps
      ? partial.cost / deltaEps
      : Number.POSITIVE_INFINITY;

  const withoutScore = {
    kind: partial.kind,
    planetId: partial.planetId,
    upgradeId: partial.upgradeId,
    displayName: partial.displayName,
    cost: partial.cost,
    currentEps,
    epsAfter,
    deltaEps,
    paybackSeconds,
    advancesUnlock: partial.advancesUnlock,
    unlockLabel: partial.unlockLabel,
    levelsToUnlock: partial.levelsToUnlock,
  };

  return {
    ...withoutScore,
    score: scoreOption(withoutScore, frontierPlanetId),
  };
}

/**
 * Enumerate purchasable Energy upgrades with payback / unlock metrics.
 * Uses real cost + production helpers so sim math tracks the game.
 */
export function enumeratePurchaseOptions(
  state: GameState,
  frontierPlanetId: PlanetId,
  frontierSpinMultiplier: number,
  purchaseRotation: (s: GameState, planetId: PlanetId) => GameState | null,
  purchaseTrack: (
    s: GameState,
    planetId: PlanetId,
    upgradeId: string,
  ) => GameState | null,
): PurchaseOption[] {
  const options: PurchaseOption[] = [];

  for (const planetId of state.unlockedPlanets) {
    const progress = getPlanetProgress(state, planetId);
    const rotCost = getRotationSpeedUpgradeCost(
      progress.rotationSpeedLevel,
      planetId,
      state,
    );
    const rotUnlock = unlockAdvancementForRotation(state, planetId);

    const rotOption = buildOption(state, frontierPlanetId, frontierSpinMultiplier, {
      kind: 'rotationSpeed',
      planetId,
      displayName: `${planetId} Rotation Speed Lv.${progress.rotationSpeedLevel + 1}`,
      cost: rotCost,
      advancesUnlock: rotUnlock.advances,
      unlockLabel: rotUnlock.label,
      levelsToUnlock: rotUnlock.levelsToUnlock,
      apply: (s) => purchaseRotation(s, planetId),
    });

    if (rotOption) {
      options.push(rotOption);
    }

    for (const track of getPlanetUpgradeTracks(planetId)) {
      if (!isUpgradeUnlocked(progress, track.id)) {
        continue;
      }

      const level = getUpgradeLevel(progress, track.id);
      if (level < 1) {
        continue;
      }

      const cost = getUpgradeCost(level, track, state);
      const unlock = unlockAdvancementForTrack(state, planetId, track.id);

      const trackOption = buildOption(
        state,
        frontierPlanetId,
        frontierSpinMultiplier,
        {
          kind: 'upgradeTrack',
          planetId,
          upgradeId: track.id,
          displayName: `${planetId} ${track.displayName} Lv.${level + 1}`,
          cost,
          advancesUnlock: unlock.advances,
          unlockLabel: unlock.label,
          levelsToUnlock: unlock.levelsToUnlock,
          apply: (s) => purchaseTrack(s, planetId, track.id),
        },
      );

      if (trackOption) {
        options.push(trackOption);
      }
    }
  }

  return options;
}

export function isPlanetSegmentComplete(
  state: GameState,
  planetId: PlanetId,
): boolean {
  const secondary = getSecondaryUpgradeTrack(planetId);
  if (!secondary) {
    return true;
  }

  const progress = getPlanetProgress(state, planetId);
  if (!isUpgradeUnlocked(progress, secondary.id)) {
    return false;
  }

  const required =
    planetId === 'neptune'
      ? PRESTIGE_STORM_HARVESTERS_LEVEL
      : 10;

  return getUpgradeLevel(progress, secondary.id) >= required;
}

export function runComplete(state: GameState): boolean {
  return canPrestige(state);
}
