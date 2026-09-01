import { getSpinProductionMultiplier } from '../game/spinCurve';
import type { GameState } from '../game/types';
import { ACHIEVEMENT_DEFINITIONS, getAchievementDefinition } from './definitions';
import {
  getAchievementProgressDisplay,
  isAchievementConditionMet,
  updatePeakSpinProduction,
} from './evaluate';
import type {
  AchievementCardStatus,
  AchievementDefinition,
  AchievementViewModel,
} from './types';

export function evaluateAchievements(
  state: GameState,
  spinRatio: number,
): { state: GameState; newlyCompleted: AchievementDefinition[] } {
  const spinProductionMultiplier = getSpinProductionMultiplier(spinRatio);
  const achievements = updatePeakSpinProduction(
    state.achievements,
    spinProductionMultiplier,
  );

  let nextState: GameState =
    achievements === state.achievements
      ? state
      : { ...state, achievements };

  const context = {
    peakSpinProductionMultiplier: nextState.achievements.peakSpinProductionMultiplier,
  };

  const newlyCompleted: AchievementDefinition[] = [];
  const completedSet = new Set(nextState.achievements.completedIds);

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (completedSet.has(definition.id)) {
      continue;
    }

    if (!isAchievementConditionMet(definition.condition, nextState, context)) {
      continue;
    }

    completedSet.add(definition.id);
    newlyCompleted.push(definition);
  }

  if (newlyCompleted.length === 0) {
    return { state: nextState, newlyCompleted };
  }

  return {
    state: {
      ...nextState,
      achievements: {
        ...nextState.achievements,
        completedIds: [...completedSet],
      },
    },
    newlyCompleted,
  };
}

export function claimAchievementReward(
  state: GameState,
  achievementId: string,
): GameState | null {
  const definition = getAchievementDefinition(achievementId);

  if (!definition) {
    return null;
  }

  if (!state.achievements.completedIds.includes(achievementId)) {
    return null;
  }

  if (state.achievements.claimedIds.includes(achievementId)) {
    return null;
  }

  const claimedIds = [...state.achievements.claimedIds, achievementId];
  let energy = state.energy;
  let stardust = state.stardust;

  if (definition.reward.type === 'energy') {
    energy += definition.reward.amount;
  } else {
    stardust += definition.reward.amount;
  }

  return {
    ...state,
    energy,
    stardust,
    achievements: {
      ...state.achievements,
      claimedIds,
    },
  };
}

export function devCompleteAllAchievements(state: GameState): GameState {
  const completedIds = ACHIEVEMENT_DEFINITIONS.map((definition) => definition.id);

  return {
    ...state,
    achievements: {
      ...state.achievements,
      completedIds,
      claimedIds: state.achievements.claimedIds.filter((id) =>
        completedIds.includes(id),
      ),
    },
  };
}

function getAchievementStatus(
  definition: AchievementDefinition,
  state: GameState,
): AchievementCardStatus {
  if (state.achievements.claimedIds.includes(definition.id)) {
    return 'claimed';
  }

  if (state.achievements.completedIds.includes(definition.id)) {
    return 'complete';
  }

  const progress = getAchievementProgressDisplay(definition, state);
  if (progress && progress.current > 0) {
    return 'in_progress';
  }

  return 'locked';
}

export function getAchievementViewModels(state: GameState): AchievementViewModel[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
    definition,
    status: getAchievementStatus(definition, state),
    progress: getAchievementProgressDisplay(definition, state),
  }));
}

export function getCompletedAchievementCount(state: GameState): number {
  return state.achievements.completedIds.length;
}

export function formatAchievementReward(
  reward: AchievementDefinition['reward'],
): string {
  if (reward.type === 'energy') {
    return `${reward.amount.toLocaleString('en-US')} Energy`;
  }

  return `${reward.amount.toLocaleString('en-US')} Stardust`;
}
