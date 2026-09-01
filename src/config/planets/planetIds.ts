/** Canonical planet identifiers for game progression and navigation. */
export const PLANET_IDS = [
  'earth',
  'mars',
  'venus',
  'mercury',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
] as const;

export type PlanetId = (typeof PLANET_IDS)[number];

export const DEFAULT_PLANET_ID: PlanetId = 'earth';

export function isPlanetId(value: unknown): value is PlanetId {
  return typeof value === 'string' && PLANET_IDS.includes(value as PlanetId);
}
