import type { PlanetId } from '../../src/config/planets';
import {
  getPrimaryUpgradeTrack,
  getSecondaryUpgradeTrack,
  isUpgradeUnlocked,
} from '../../src/game/planetUpgrades';
import { getPlanetProgress, getUpgradeLevel } from '../../src/game/types';
import type { PlayerProfileConfig } from './config';
import {
  getFrontierPlanetId,
  isPlanetSegmentComplete,
} from './metrics';
import type { PurchaseOption } from './types';
import type { GameState } from '../../src/game/types';

/**
 * Frontier scripted policy: buy the next gated progression upgrade on the
 * newest unfinished planet (rotation → track1 → track2), ignoring side buys.
 */
export function pickFrontierPurchase(
  state: GameState,
  options: PurchaseOption[],
): PurchaseOption | null {
  const frontier = getFrontierPlanetId(state);

  if (isPlanetSegmentComplete(state, frontier)) {
    return null;
  }

  const progress = getPlanetProgress(state, frontier);
  const primary = getPrimaryUpgradeTrack(frontier);
  const secondary = getSecondaryUpgradeTrack(frontier);

  const onFrontier = options.filter((option) => option.planetId === frontier);

  const find = (
    predicate: (option: PurchaseOption) => boolean,
  ): PurchaseOption | null => onFrontier.find(predicate) ?? null;

  if (
    primary &&
    primary.unlock.type === 'rotationSpeed' &&
    !isUpgradeUnlocked(progress, primary.id)
  ) {
    return find((option) => option.kind === 'rotationSpeed');
  }

  if (
    primary &&
    isUpgradeUnlocked(progress, primary.id) &&
    secondary &&
    secondary.unlock.type === 'upgrade' &&
    !isUpgradeUnlocked(progress, secondary.id)
  ) {
    return find(
      (option) =>
        option.kind === 'upgradeTrack' && option.upgradeId === primary.id,
    );
  }

  if (secondary && isUpgradeUnlocked(progress, secondary.id)) {
    return find(
      (option) =>
        option.kind === 'upgradeTrack' && option.upgradeId === secondary.id,
    );
  }

  // Fallback: cheapest unlock-advancing buy on frontier, else best score.
  const unlockBuys = onFrontier.filter((option) => option.advancesUnlock);
  if (unlockBuys.length > 0) {
    return unlockBuys.sort((a, b) => a.cost - b.cost)[0] ?? null;
  }

  return (
    onFrontier.sort((a, b) => b.score - a.score)[0] ??
    options.sort((a, b) => b.score - a.score)[0] ??
    null
  );
}

/** Optimizer: unlock progression on the frontier beats side-planet farming. */
export function pickOptimizerPurchase(
  state: GameState,
  options: PurchaseOption[],
): PurchaseOption | null {
  if (options.length === 0) {
    return null;
  }

  const frontier = getFrontierPlanetId(state);
  const sortBest = (list: PurchaseOption[]): PurchaseOption | null =>
    [...list].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.paybackSeconds !== b.paybackSeconds) {
        return a.paybackSeconds - b.paybackSeconds;
      }
      return a.cost - b.cost;
    })[0] ?? null;

  if (!isPlanetSegmentComplete(state, frontier)) {
    const frontierOptions = options.filter(
      (option) => option.planetId === frontier,
    );
    const unlockOptions = frontierOptions.filter(
      (option) => option.advancesUnlock,
    );

    if (unlockOptions.length > 0) {
      // Within unlock-advancing buys, prefer shortest payback / best score.
      return sortBest(unlockOptions);
    }

    if (frontierOptions.length > 0) {
      return sortBest(frontierOptions);
    }
  }

  return sortBest(options);
}

export function pickPurchase(
  profile: PlayerProfileConfig,
  state: GameState,
  options: PurchaseOption[],
): PurchaseOption | null {
  if (profile.purchasePolicy === 'optimizer') {
    return pickOptimizerPurchase(state, options);
  }

  return pickFrontierPurchase(state, options);
}

export function desiredFrontierFocus(state: GameState): PlanetId {
  return getFrontierPlanetId(state);
}

export function trackLevels(
  state: GameState,
  planetId: PlanetId,
): {
  rotation: number;
  track1Level: number;
  track1Unlocked: boolean;
  track2Level: number;
  track2Unlocked: boolean;
} {
  const progress = getPlanetProgress(state, planetId);
  const primary = getPrimaryUpgradeTrack(planetId);
  const secondary = getSecondaryUpgradeTrack(planetId);

  return {
    rotation: progress.rotationSpeedLevel,
    track1Level: primary ? getUpgradeLevel(progress, primary.id) : 0,
    track1Unlocked: primary
      ? isUpgradeUnlocked(progress, primary.id)
      : false,
    track2Level: secondary ? getUpgradeLevel(progress, secondary.id) : 0,
    track2Unlocked: secondary
      ? isUpgradeUnlocked(progress, secondary.id)
      : false,
  };
}
