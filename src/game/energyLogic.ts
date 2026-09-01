import { getPlayablePlanetIds, getPlanetEconomy, type PlanetId } from '../config/planets';
import { getConfiguredUpgradesMultiplier } from './planetUpgrades';
import { getCosmicMomentumMultiplier } from './prestige';
import { getRotationSpeedMultiplier } from './rotationSpeedUpgrade';
import { getSpinProductionMultiplier } from './spinCurve';
import {
  getPlanetProgress,
  type GameState,
  type PlanetProgressState,
} from './types';

export { getSpinProductionMultiplier } from './spinCurve';

export function getBaseEnergyPerSecond(
  rotationSpeedLevel: number,
  planetId: PlanetId = 'earth',
): number {
  return (
    getPlanetEconomy(planetId).baseEnergyPerSecond *
    getRotationSpeedMultiplier(rotationSpeedLevel, planetId)
  );
}

/**
 * Production for one planet:
 * base × Rotation Speed × planet tracks × Cosmic Momentum × spin (when active).
 */
export function getPlanetEnergyPerSecond(
  state: GameState,
  planetId: PlanetId,
  spinRatio: number,
  eventMultiplier = 1,
): number {
  const progress = getPlanetProgress(state, planetId);
  return (
    getBaseEnergyPerSecond(progress.rotationSpeedLevel, planetId) *
    getConfiguredUpgradesMultiplier(progress, planetId) *
    getCosmicMomentumMultiplier(state) *
    eventMultiplier *
    getSpinProductionMultiplier(spinRatio)
  );
}

/** @deprecated Prefer getPlanetEnergyPerSecond(state, planetId, spinRatio). */
export function getPlanetEnergyPerSecondFromProgress(
  progress: PlanetProgressState,
  spinRatio: number,
  planetId: PlanetId,
  cosmicMomentumMultiplier = 1,
): number {
  return (
    getBaseEnergyPerSecond(progress.rotationSpeedLevel, planetId) *
    getConfiguredUpgradesMultiplier(progress, planetId) *
    cosmicMomentumMultiplier *
    getSpinProductionMultiplier(spinRatio)
  );
}

export function getPlanetPassiveEnergyPerSecond(
  state: GameState,
  planetId: PlanetId,
): number {
  return getPlanetEnergyPerSecond(state, planetId, 1);
}

/**
 * Total passive production across all unlocked playable planets.
 * Spin bonuses are not included — use getActivePlanetEnergyPerSecond for that.
 */
export function getTotalPassiveEnergyPerSecond(state: GameState): number {
  let total = 0;

  for (const planetId of getPlayablePlanetIds()) {
    if (!state.unlockedPlanets.includes(planetId)) {
      continue;
    }

    total += getPlanetPassiveEnergyPerSecond(state, planetId);
  }

  return total;
}

/**
 * Live Energy/sec for the planet being viewed (includes flick/spin).
 * Background planets still produce at their passive rates.
 */
export function getCombinedEnergyPerSecond(
  state: GameState,
  activePlanetId: PlanetId,
  activeSpinRatio: number,
  activeEventMultiplier = 1,
): number {
  let total = 0;

  for (const planetId of getPlayablePlanetIds()) {
    if (!state.unlockedPlanets.includes(planetId)) {
      continue;
    }

    const spinRatio = planetId === activePlanetId ? activeSpinRatio : 1;
    const eventMultiplier =
      planetId === activePlanetId ? activeEventMultiplier : 1;
    total += getPlanetEnergyPerSecond(
      state,
      planetId,
      spinRatio,
      eventMultiplier,
    );
  }

  return total;
}

export function getActivePlanetEnergyPerSecond(
  state: GameState,
  activePlanetId: PlanetId,
  activeSpinRatio: number,
  eventMultiplier = 1,
): number {
  return getPlanetEnergyPerSecond(
    state,
    activePlanetId,
    activeSpinRatio,
    eventMultiplier,
  );
}
