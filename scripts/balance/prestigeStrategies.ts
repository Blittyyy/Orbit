import {
  canAffordPrestigeUpgrade,
  getPrestigeUpgradeLevel,
  getPrestigeUpgradeNextCost,
  PRESTIGE_UPGRADE_IDS,
  purchasePrestigeUpgrade,
  type PrestigeUpgradeId,
} from '../../src/game/prestige';
import type { GameState } from '../../src/game/types';
import {
  STARDUST_STRATEGIES,
  type StardustStrategyConfig,
  type StardustStrategyId,
} from './config';

function buy(state: GameState, upgradeId: PrestigeUpgradeId): GameState | null {
  return purchasePrestigeUpgrade(state, upgradeId);
}

function pickEqualize(state: GameState): PrestigeUpgradeId | null {
  const affordable = PRESTIGE_UPGRADE_IDS.filter((id) =>
    canAffordPrestigeUpgrade(state, id),
  );

  if (affordable.length === 0) {
    return null;
  }

  return [...affordable].sort((a, b) => {
    const levelDiff =
      getPrestigeUpgradeLevel(state, a) - getPrestigeUpgradeLevel(state, b);
    if (levelDiff !== 0) {
      return levelDiff;
    }
    return getPrestigeUpgradeNextCost(state, a) - getPrestigeUpgradeNextCost(state, b);
  })[0] ?? null;
}

function pickCheapest(state: GameState): PrestigeUpgradeId | null {
  const affordable = PRESTIGE_UPGRADE_IDS.filter((id) =>
    canAffordPrestigeUpgrade(state, id),
  );

  if (affordable.length === 0) {
    return null;
  }

  return [...affordable].sort(
    (a, b) =>
      getPrestigeUpgradeNextCost(state, a) - getPrestigeUpgradeNextCost(state, b),
  )[0] ?? null;
}

function pickPriority(
  state: GameState,
  priority: PrestigeUpgradeId[],
): PrestigeUpgradeId | null {
  for (const id of priority) {
    if (canAffordPrestigeUpgrade(state, id)) {
      return id;
    }
  }
  return null;
}

function pickCosmicThenOrbital(
  state: GameState,
  strategy: StardustStrategyConfig,
): PrestigeUpgradeId | null {
  const target = strategy.cosmicTargetLevel ?? 5;
  const cosmicLevel = getPrestigeUpgradeLevel(state, 'cosmicMomentum');

  if (cosmicLevel < target && canAffordPrestigeUpgrade(state, 'cosmicMomentum')) {
    return 'cosmicMomentum';
  }

  if (canAffordPrestigeUpgrade(state, 'orbitalKnowledge')) {
    return 'orbitalKnowledge';
  }

  if (canAffordPrestigeUpgrade(state, 'cosmicMomentum')) {
    return 'cosmicMomentum';
  }

  return pickCheapest(state);
}

function chooseUpgrade(
  state: GameState,
  strategy: StardustStrategyConfig,
): PrestigeUpgradeId | null {
  switch (strategy.id) {
    case 'balanced_cheapest':
      return pickCheapest(state);
    case 'equalize_levels':
      return pickEqualize(state);
    case 'cosmic_then_orbital':
      return pickCosmicThenOrbital(state, strategy);
    case 'cosmic_only':
    case 'orbital_only':
    case 'reserves_only':
      return pickPriority(state, strategy.priority ?? []);
    default:
      return pickCheapest(state);
  }
}

/**
 * Spend available Stardust according to strategy until no further buys.
 * Returns updated state and how much Stardust was spent.
 */
export function allocateStardust(
  state: GameState,
  strategyId: StardustStrategyId,
): { state: GameState; spent: number } {
  const strategy = STARDUST_STRATEGIES[strategyId];
  let next = state;
  let spent = 0;
  let guard = 0;

  while (guard < 10_000) {
    guard += 1;
    const choice = chooseUpgrade(next, strategy);
    if (!choice) {
      break;
    }

    const cost = getPrestigeUpgradeNextCost(next, choice);
    const purchased = buy(next, choice);
    if (!purchased) {
      break;
    }

    spent += cost;
    next = purchased;
  }

  return { state: next, spent };
}
