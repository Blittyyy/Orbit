import { getPlayablePlanetIds, type PlanetId } from '../config/planets';
import { SPACE_EVENT_DEFINITIONS } from './definitions';
import type { SpaceEventDefinition, SpaceEventId } from './types';

export const FIRST_EVENT_MIN_MS = 60_000;
export const FIRST_EVENT_MAX_MS = 120_000;
export const EVENT_COOLDOWN_MIN_MS = 120_000;
export const EVENT_COOLDOWN_MAX_MS = 240_000;

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomCooldownMs(): number {
  return Math.round(randomBetween(EVENT_COOLDOWN_MIN_MS, EVENT_COOLDOWN_MAX_MS));
}

export function randomFirstSpawnDelayMs(): number {
  return Math.round(randomBetween(FIRST_EVENT_MIN_MS, FIRST_EVENT_MAX_MS));
}

export function isEventEligibleForPlanet(
  definition: SpaceEventDefinition,
  planetId: PlanetId,
): boolean {
  if (!definition.planetIds || definition.planetIds.length === 0) {
    return getPlayablePlanetIds().includes(planetId);
  }

  return definition.planetIds.includes(planetId);
}

export function pickRandomSpaceEvent(planetId: PlanetId): SpaceEventDefinition | null {
  const eligible = SPACE_EVENT_DEFINITIONS.filter((definition) =>
    isEventEligibleForPlanet(definition, planetId),
  );

  if (eligible.length === 0) {
    return null;
  }

  const totalWeight = eligible.reduce(
    (sum, definition) => sum + definition.spawnWeight,
    0,
  );
  let roll = Math.random() * totalWeight;

  for (const definition of eligible) {
    roll -= definition.spawnWeight;
    if (roll <= 0) {
      return definition;
    }
  }

  return eligible[eligible.length - 1] ?? null;
}

export function createEventInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startSpaceEvent(
  definition: SpaceEventDefinition,
  planetId: PlanetId,
  now = Date.now(),
) {
  return {
    instanceId: createEventInstanceId(),
    definitionId: definition.id as SpaceEventId,
    planetId,
    startedAt: now,
    endsAt: now + definition.durationMs,
    comet: definition.visualType === 'comet' ? { caught: false } : undefined,
    meteorTaps: 0,
    meteors: [],
  };
}
