import { getPlanetEconomy } from '../config/planets';
import type { PlanetId } from '../config/planets';
import { applyOrbitalKnowledgeToCost } from './prestige';
import {
  getPlanetProgress,
  updatePlanetProgress,
  type GameState,
  type PlanetProgressState,
} from './types';

export function getRotationSpeedMultiplier(
  level: number,
  planetId: PlanetId = 'earth',
): number {
  const { bonusPerLevel } = getPlanetEconomy(planetId).rotationSpeed;
  return Math.pow(1 + bonusPerLevel, level);
}

/** Configured Rotation Speed cost before prestige discounts. */
export function getConfiguredRotationSpeedUpgradeCost(
  level: number,
  planetId: PlanetId = 'earth',
): number {
  const { baseCost, costMultiplier } = getPlanetEconomy(planetId).rotationSpeed;
  return baseCost * Math.pow(costMultiplier, level);
}

export function getRotationSpeedUpgradeCost(
  level: number,
  planetId: PlanetId = 'earth',
  state?: GameState,
): number {
  const configured = getConfiguredRotationSpeedUpgradeCost(level, planetId);
  if (!state) {
    return configured;
  }
  return applyOrbitalKnowledgeToCost(configured, state);
}

export function getRotationSpeedProductionBonusPercent(
  level: number,
  planetId: PlanetId = 'earth',
): number {
  return (getRotationSpeedMultiplier(level, planetId) - 1) * 100;
}

export function canPurchaseRotationSpeedUpgrade(
  energy: number,
  level: number,
  planetId: PlanetId = 'earth',
  state?: GameState,
): boolean {
  return energy >= getRotationSpeedUpgradeCost(level, planetId, state);
}

export function purchaseRotationSpeedUpgradeForProgress(
  energy: number,
  progress: PlanetProgressState,
  planetId: PlanetId,
  state: GameState,
): { energy: number; progress: PlanetProgressState } | null {
  const cost = getRotationSpeedUpgradeCost(
    progress.rotationSpeedLevel,
    planetId,
    state,
  );

  if (energy < cost) {
    return null;
  }

  return {
    energy: energy - cost,
    progress: {
      ...progress,
      rotationSpeedLevel: progress.rotationSpeedLevel + 1,
    },
  };
}

export function purchaseRotationSpeedUpgrade(
  state: GameState,
  planetId: PlanetId = 'earth',
): GameState | null {
  const result = purchaseRotationSpeedUpgradeForProgress(
    state.energy,
    getPlanetProgress(state, planetId),
    planetId,
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

export interface RotationSpeedUpgradeViewModel {
  level: number;
  productionBonusPercent: number;
  upgradeCost: number;
  canAfford: boolean;
}

export function getRotationSpeedUpgradeViewModel(
  energy: number,
  level: number,
  planetId: PlanetId = 'earth',
  state?: GameState,
): RotationSpeedUpgradeViewModel {
  return {
    level,
    productionBonusPercent: getRotationSpeedProductionBonusPercent(level, planetId),
    upgradeCost: getRotationSpeedUpgradeCost(level, planetId, state),
    canAfford: canPurchaseRotationSpeedUpgrade(energy, level, planetId, state),
  };
}
