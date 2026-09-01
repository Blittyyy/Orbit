import type { PlanetId } from '../config/planets';

export type AchievementCategory =
  | 'SPIN'
  | 'PLANET_PROGRESSION'
  | 'UPGRADE'
  | 'SOLAR_SYSTEM'
  | 'PRESTIGE';

export interface AchievementEnergyReward {
  type: 'energy';
  amount: number;
}

export interface AchievementStardustReward {
  type: 'stardust';
  amount: number;
}

export type AchievementReward =
  | AchievementEnergyReward
  | AchievementStardustReward;

export type AchievementCondition =
  | { type: 'spinProductionMin'; multiplier: number }
  | { type: 'upgradeUnlocked'; planetId: PlanetId; upgradeId: string }
  | { type: 'planetUnlocked'; planetId: PlanetId }
  | { type: 'planetsUnlocked'; planetIds: PlanetId[] }
  | { type: 'allPlayablePlanetsUnlocked' }
  | { type: 'prestigeReady' }
  | { type: 'prestigeCountMin'; count: number };

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  reward: AchievementReward;
}

export interface AchievementProgressState {
  completedIds: string[];
  claimedIds: string[];
  peakSpinProductionMultiplier: number;
}

export function createInitialAchievementProgress(): AchievementProgressState {
  return {
    completedIds: [],
    claimedIds: [],
    peakSpinProductionMultiplier: 1,
  };
}

export interface AchievementEvaluationContext {
  peakSpinProductionMultiplier: number;
}

export interface AchievementProgressDisplay {
  current: number;
  target: number;
  label: string;
}

export type AchievementCardStatus =
  | 'locked'
  | 'in_progress'
  | 'complete'
  | 'claimed';

export interface AchievementViewModel {
  definition: AchievementDefinition;
  status: AchievementCardStatus;
  progress: AchievementProgressDisplay | null;
}
