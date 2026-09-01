import { getPlayablePlanetIds } from '../config/planets';
import { isPlanetUnlocked } from '../game/planetProgression';
import { isUpgradeUnlocked } from '../game/planetUpgrades';
import { canPrestige, getNeptuneStormHarvestersProgress } from '../game/prestige';
import { getPlanetProgress, type GameState } from '../game/types';
import type {
  AchievementCondition,
  AchievementDefinition,
  AchievementEvaluationContext,
  AchievementProgressDisplay,
  AchievementProgressState,
} from './types';
import { createInitialAchievementProgress } from './types';

export function normalizeAchievementProgress(
  raw: unknown,
): AchievementProgressState {
  const defaults = createInitialAchievementProgress();

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const record = raw as Record<string, unknown>;
  const completedIds = Array.isArray(record.completedIds)
    ? record.completedIds.filter((id): id is string => typeof id === 'string')
    : defaults.completedIds;
  const claimedIds = Array.isArray(record.claimedIds)
    ? record.claimedIds.filter((id): id is string => typeof id === 'string')
    : defaults.claimedIds;
  const peak =
    typeof record.peakSpinProductionMultiplier === 'number' &&
    Number.isFinite(record.peakSpinProductionMultiplier)
      ? Math.max(1, record.peakSpinProductionMultiplier)
      : defaults.peakSpinProductionMultiplier;

  return {
    completedIds,
    claimedIds,
    peakSpinProductionMultiplier: peak,
  };
}

function formatMultiplier(value: number): string {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 10 ? 0 : 1,
  })}x`;
}

export function isAchievementConditionMet(
  condition: AchievementCondition,
  state: GameState,
  context: AchievementEvaluationContext,
): boolean {
  switch (condition.type) {
    case 'spinProductionMin':
      return context.peakSpinProductionMultiplier >= condition.multiplier;
    case 'upgradeUnlocked': {
      const progress = getPlanetProgress(state, condition.planetId);
      return isUpgradeUnlocked(progress, condition.upgradeId);
    }
    case 'planetUnlocked':
      return isPlanetUnlocked(state, condition.planetId);
    case 'planetsUnlocked':
      return condition.planetIds.every((planetId) =>
        isPlanetUnlocked(state, planetId),
      );
    case 'allPlayablePlanetsUnlocked':
      return getPlayablePlanetIds().every((planetId) =>
        isPlanetUnlocked(state, planetId),
      );
    case 'prestigeReady':
      return canPrestige(state);
    case 'prestigeCountMin':
      return state.prestigeCount >= condition.count;
    default:
      return false;
  }
}

export function getAchievementProgressDisplay(
  definition: AchievementDefinition,
  state: GameState,
): AchievementProgressDisplay | null {
  const { condition } = definition;

  switch (condition.type) {
    case 'spinProductionMin':
      return {
        current: state.achievements.peakSpinProductionMultiplier,
        target: condition.multiplier,
        label: `${formatMultiplier(state.achievements.peakSpinProductionMultiplier)} / ${formatMultiplier(condition.multiplier)}`,
      };
    case 'prestigeCountMin':
      return {
        current: state.prestigeCount,
        target: condition.count,
        label: `Prestiges ${state.prestigeCount} / ${condition.count}`,
      };
    case 'allPlayablePlanetsUnlocked': {
      const target = getPlayablePlanetIds().length;
      const current = state.unlockedPlanets.length;
      return {
        current,
        target,
        label: `Planets ${current} / ${target}`,
      };
    }
    case 'planetsUnlocked': {
      const current = condition.planetIds.filter((planetId) =>
        isPlanetUnlocked(state, planetId),
      ).length;
      const target = condition.planetIds.length;
      return {
        current,
        target,
        label: `Planets ${current} / ${target}`,
      };
    }
    case 'prestigeReady': {
      const storm = getNeptuneStormHarvestersProgress(state);
      return {
        current: storm.level,
        target: storm.required,
        label: `Storm Harvesters ${storm.level} / ${storm.required}`,
      };
    }
    default:
      return null;
  }
}

export function updatePeakSpinProduction(
  achievements: AchievementProgressState,
  spinProductionMultiplier: number,
): AchievementProgressState {
  if (!Number.isFinite(spinProductionMultiplier)) {
    return achievements;
  }

  const peak = Math.max(
    achievements.peakSpinProductionMultiplier,
    spinProductionMultiplier,
  );

  if (peak === achievements.peakSpinProductionMultiplier) {
    return achievements;
  }

  return {
    ...achievements,
    peakSpinProductionMultiplier: peak,
  };
}
