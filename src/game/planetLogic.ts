import { getPlayablePlanetIds } from '../config/planets';
import { applyPlanetUnlocks } from './planetProgression';
import { applyUpgradeUnlocks } from './planetUpgrades';
import {
  getPlanetEnergyPerSecond,
  getPlanetPassiveEnergyPerSecond,
} from './energyLogic';
import {
  createInitialPlanetStates,
  createInitialPrestigeUpgrades,
  createInitialAchievementProgress,
  DEFAULT_GAME_SETTINGS,
  type GameState,
} from './types';
import { DEFAULT_PLANET_ID } from '../config/planets';

export function createInitialState(): GameState {
  return {
    energy: 0,
    planetStates: createInitialPlanetStates(),
    unlockedPlanets: [DEFAULT_PLANET_ID],
    selectedPlanetId: DEFAULT_PLANET_ID,
    stardust: 0,
    prestigeCount: 0,
    prestigeUpgrades: createInitialPrestigeUpgrades(),
    settings: DEFAULT_GAME_SETTINGS,
    achievements: createInitialAchievementProgress(),
  };
}

function applyUnlocksForPlayablePlanets(state: GameState): GameState {
  let next = state;

  for (const planetId of getPlayablePlanetIds()) {
    if (!next.unlockedPlanets.includes(planetId)) {
      continue;
    }

    next = applyUpgradeUnlocks(next, planetId);
  }

  return applyPlanetUnlocks(next);
}

/**
 * Simulation tick.
 * - Every unlocked playable planet produces Energy.
 * - Manual spin multiplier applies only to the active (selected) planet.
 */
export function tickGameState(
  state: GameState,
  dtSeconds: number,
  activeSpinRatio: number,
  activeEventMultiplier = 1,
): GameState {
  let energyGain = 0;

  for (const planetId of getPlayablePlanetIds()) {
    if (!state.unlockedPlanets.includes(planetId)) {
      continue;
    }

    const spinRatio =
      planetId === state.selectedPlanetId ? activeSpinRatio : 1;
    const eventMultiplier =
      planetId === state.selectedPlanetId ? activeEventMultiplier : 1;
    energyGain +=
      getPlanetEnergyPerSecond(state, planetId, spinRatio, eventMultiplier) *
      dtSeconds;
  }

  const nextState: GameState = {
    ...state,
    energy: state.energy + energyGain,
  };

  return applyUnlocksForPlayablePlanets(nextState);
}

export { getPlanetPassiveEnergyPerSecond };
