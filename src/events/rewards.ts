import type { PlanetId } from '../config/planets';
import { getPlanetPassiveEnergyPerSecond } from '../game/energyLogic';
import type { GameState } from '../game/types';
import type { SpaceEventDefinition } from './types';

export function getEventPassiveTapReward(
  state: GameState,
  planetId: PlanetId,
  passiveSeconds: number,
): number {
  return getPlanetPassiveEnergyPerSecond(state, planetId) * passiveSeconds;
}

export function getCometReward(
  state: GameState,
  planetId: PlanetId,
  definition: SpaceEventDefinition,
): number {
  if (definition.effect.type !== 'cometTap') {
    return 0;
  }

  return getEventPassiveTapReward(
    state,
    planetId,
    definition.effect.passiveSeconds,
  );
}

export function getMeteorReward(
  state: GameState,
  planetId: PlanetId,
  definition: SpaceEventDefinition,
): number {
  if (definition.effect.type !== 'meteorTap') {
    return 0;
  }

  return getEventPassiveTapReward(
    state,
    planetId,
    definition.effect.passiveSecondsPerTap,
  );
}

export function getEventProductionMultiplier(
  definition: SpaceEventDefinition | undefined,
): number {
  if (!definition || definition.effect.type !== 'productionBoost') {
    return 1;
  }

  return definition.effect.multiplier;
}
