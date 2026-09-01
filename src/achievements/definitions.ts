import type { AchievementCategory, AchievementDefinition } from './types';

export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategory[] = [
  'SPIN',
  'PLANET_PROGRESSION',
  'UPGRADE',
  'SOLAR_SYSTEM',
  'PRESTIGE',
];

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  SPIN: 'Spin',
  PLANET_PROGRESSION: 'Planet Progression',
  UPGRADE: 'Upgrade',
  SOLAR_SYSTEM: 'Solar System',
  PRESTIGE: 'Prestige',
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-push',
    title: 'First Push',
    description: 'Spin a planet above 2x production.',
    category: 'SPIN',
    condition: { type: 'spinProductionMin', multiplier: 2 },
    reward: { type: 'energy', amount: 25 },
  },
  {
    id: 'full-send',
    title: 'Full Send',
    description: 'Reach 4x spin production.',
    category: 'SPIN',
    condition: { type: 'spinProductionMin', multiplier: 4 },
    reward: { type: 'energy', amount: 100 },
  },
  {
    id: 'orbital-maniac',
    title: 'Orbital Maniac',
    description: 'Reach 5x spin production.',
    category: 'SPIN',
    condition: { type: 'spinProductionMin', multiplier: 5 },
    reward: { type: 'energy', amount: 250 },
  },
  {
    id: 'lunar-arrival',
    title: 'Lunar Arrival',
    description: "Unlock Earth's Moon.",
    category: 'PLANET_PROGRESSION',
    condition: { type: 'upgradeUnlocked', planetId: 'earth', upgradeId: 'moon' },
    reward: { type: 'energy', amount: 100 },
  },
  {
    id: 'satellite-age',
    title: 'Satellite Age',
    description: "Unlock Earth's Satellites.",
    category: 'PLANET_PROGRESSION',
    condition: {
      type: 'upgradeUnlocked',
      planetId: 'earth',
      upgradeId: 'satellites',
    },
    reward: { type: 'energy', amount: 500 },
  },
  {
    id: 'red-frontier',
    title: 'Red Frontier',
    description: 'Unlock Mars.',
    category: 'PLANET_PROGRESSION',
    condition: { type: 'planetUnlocked', planetId: 'mars' },
    reward: { type: 'energy', amount: 1_000 },
  },
  {
    id: 'inner-worlds',
    title: 'Inner Worlds',
    description: 'Unlock Mercury and Venus.',
    category: 'PLANET_PROGRESSION',
    condition: { type: 'planetsUnlocked', planetIds: ['mercury', 'venus'] },
    reward: { type: 'energy', amount: 5_000 },
  },
  {
    id: 'gas-giant',
    title: 'Gas Giant',
    description: 'Unlock Jupiter.',
    category: 'PLANET_PROGRESSION',
    condition: { type: 'planetUnlocked', planetId: 'jupiter' },
    reward: { type: 'energy', amount: 25_000 },
  },
  {
    id: 'ringed-world',
    title: 'Ringed World',
    description: 'Unlock Saturn.',
    category: 'PLANET_PROGRESSION',
    condition: { type: 'planetUnlocked', planetId: 'saturn' },
    reward: { type: 'energy', amount: 100_000 },
  },
  {
    id: 'ice-giants',
    title: 'Ice Giants',
    description: 'Unlock Uranus and Neptune.',
    category: 'PLANET_PROGRESSION',
    condition: { type: 'planetsUnlocked', planetIds: ['uranus', 'neptune'] },
    reward: { type: 'energy', amount: 500_000 },
  },
  {
    id: 'eight-worlds',
    title: 'Eight Worlds',
    description: 'Unlock all eight planets.',
    category: 'SOLAR_SYSTEM',
    condition: { type: 'allPlayablePlanetsUnlocked' },
    reward: { type: 'energy', amount: 1_000_000 },
  },
  {
    id: 'system-mastered',
    title: 'System Mastered',
    description:
      'Reach prestige-ready status by completing Neptune Storm Harvesters Lv. 10.',
    category: 'SOLAR_SYSTEM',
    condition: { type: 'prestigeReady' },
    reward: { type: 'stardust', amount: 2 },
  },
  {
    id: 'reborn',
    title: 'Reborn',
    description: 'Prestige for the first time.',
    category: 'PRESTIGE',
    condition: { type: 'prestigeCountMin', count: 1 },
    reward: { type: 'stardust', amount: 2 },
  },
  {
    id: 'again',
    title: 'Again',
    description: 'Reach Prestige Count 3.',
    category: 'PRESTIGE',
    condition: { type: 'prestigeCountMin', count: 3 },
    reward: { type: 'stardust', amount: 5 },
  },
  {
    id: 'cosmic-veteran',
    title: 'Cosmic Veteran',
    description: 'Reach Prestige Count 10.',
    category: 'PRESTIGE',
    condition: { type: 'prestigeCountMin', count: 10 },
    reward: { type: 'stardust', amount: 10 },
  },
];

const achievementById = new Map(
  ACHIEVEMENT_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return achievementById.get(id);
}

export function getTotalAchievementCount(): number {
  return ACHIEVEMENT_DEFINITIONS.length;
}
