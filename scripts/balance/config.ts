/**
 * Tunable assumptions for the balance harness.
 * Change these freely — they do not affect production gameplay.
 */

import type { PrestigeUpgradeId } from '../../src/game/prestige';

export type PlayerProfileId = 'idle' | 'casual' | 'active' | 'optimizer';

export interface PlayerProfileConfig {
  id: PlayerProfileId;
  label: string;
  description: string;
  /**
   * Average production multiplier applied only to the frontier (selected) planet.
   * Background planets always use 1x passive.
   * 1.0 = no manual spin; 1.4 / 2.0 = casual / active averages.
   */
  frontierSpinMultiplier: number;
  /**
   * Purchase policy id.
   * - frontier: scripted progression on the newest unfinished planet
   * - optimizer: pick by payback + unlock value across all unlocked planets
   */
  purchasePolicy: 'frontier' | 'optimizer';
}

/** Easy-to-tune player profiles. */
export const PLAYER_PROFILES: Record<PlayerProfileId, PlayerProfileConfig> = {
  idle: {
    id: 'idle',
    label: 'IDLE',
    description: 'No manual spinning; frontier always 1x.',
    frontierSpinMultiplier: 1.0,
    purchasePolicy: 'frontier',
  },
  casual: {
    id: 'casual',
    label: 'CASUAL',
    description: 'Periodic play with occasional spinning.',
    frontierSpinMultiplier: 1.4,
    purchasePolicy: 'frontier',
  },
  active: {
    id: 'active',
    label: 'ACTIVE',
    description: 'Frequently spinning; not constant max spin.',
    frontierSpinMultiplier: 2.0,
    purchasePolicy: 'frontier',
  },
  optimizer: {
    id: 'optimizer',
    label: 'OPTIMIZER',
    description: '1x spin; purchases by payback + unlock value.',
    frontierSpinMultiplier: 1.0,
    purchasePolicy: 'optimizer',
  },
};

export type StardustStrategyId =
  | 'cosmic_only'
  | 'orbital_only'
  | 'reserves_only'
  | 'balanced_cheapest'
  | 'cosmic_then_orbital'
  | 'equalize_levels';

export interface StardustStrategyConfig {
  id: StardustStrategyId;
  label: string;
  description: string;
  /**
   * Preferred upgrade order when multiple are affordable.
   * Used by cosmic_then_orbital / equalize variants.
   */
  priority?: PrestigeUpgradeId[];
  /** For cosmic_then_orbital: buy Cosmic until this level, then Orbital. */
  cosmicTargetLevel?: number;
}

export const STARDUST_STRATEGIES: Record<
  StardustStrategyId,
  StardustStrategyConfig
> = {
  cosmic_only: {
    id: 'cosmic_only',
    label: 'Cosmic Only',
    description: 'Spend all Stardust on Cosmic Momentum.',
    priority: ['cosmicMomentum'],
  },
  orbital_only: {
    id: 'orbital_only',
    label: 'Orbital Only',
    description: 'Spend all Stardust on Orbital Knowledge.',
    priority: ['orbitalKnowledge'],
  },
  reserves_only: {
    id: 'reserves_only',
    label: 'Reserves Only',
    description: 'Spend all Stardust on Deep Space Reserves.',
    priority: ['deepSpaceReserves'],
  },
  balanced_cheapest: {
    id: 'balanced_cheapest',
    label: 'Balanced (Cheapest)',
    description: 'Always buy the cheapest next prestige upgrade.',
  },
  cosmic_then_orbital: {
    id: 'cosmic_then_orbital',
    label: 'Cosmic → Orbital',
    description: 'Raise Cosmic to target, then dump into Orbital Knowledge.',
    priority: ['cosmicMomentum', 'orbitalKnowledge'],
    cosmicTargetLevel: 5,
  },
  equalize_levels: {
    id: 'equalize_levels',
    label: 'Equalize Levels',
    description: 'Keep Cosmic / Orbital / Reserves levels as even as possible.',
    priority: ['cosmicMomentum', 'orbitalKnowledge', 'deepSpaceReserves'],
  },
};

/** Default strategy used for multi-run prestige cycle reports. */
export const DEFAULT_STARDUST_STRATEGY: StardustStrategyId = 'balanced_cheapest';

/** Prestige run numbers to highlight in reports. */
export const PRESTIGE_REPORT_RUNS = [1, 2, 3, 5, 10] as const;

/** How many prestige cycles to simulate (run index = cycle number). */
export const PRESTIGE_CYCLES_TO_SIMULATE = 10;

/** Optimizer scoring knobs. */
export const OPTIMIZER_CONFIG = {
  /** Weight added when a purchase advances an unlock / prestige gate. */
  unlockScoreBonus: 8,
  /** Soft floor so zero-delta options do not explode. */
  minDeltaEps: 1e-12,
  /**
   * When payback is very long, still prefer unlock-advancing buys
   * if remaining levels-to-gate is small.
   */
  unlockProximityBonusPerLevel: 0.75,
  /** Prefer frontier planet slightly even for optimizer. */
  frontierPreferenceBonus: 0.35,
};

/** Automatic balance warning thresholds (tune freely). */
export const WARNING_THRESHOLDS = {
  /** Flag upgrades with payback longer than this (seconds) when purchased. */
  poorPaybackSeconds: 45 * 60,
  /** New planet share of system EPS shortly after unlock. */
  weakNewPlanetShare: 0.05,
  /** Seconds after unlock to sample new-planet contribution. */
  weakNewPlanetSampleSeconds: 60,
  /** Old planet share that still dominates late in its successor segment. */
  dominantOldPlanetShare: 0.75,
  /** Segment longer than median * this factor. */
  longSegmentFactor: 2.5,
  /** Segment shorter than median * this factor. */
  shortSegmentFactor: 0.15,
  /** Absolute floor for "nearly instant" segments (seconds). */
  instantSegmentSeconds: 30,
  /** Active/idle ratio over a long stretch that feels too mandatory. */
  activeIdleRatioWarn: 2.5,
  /** Prestige run improvement below this fraction is weak. */
  weakPrestigeImprovement: 0.05,
};

/** Milestone labels used in reports. */
export const MILESTONE_KEYS = [
  'rotationLv10',
  'track1Unlock',
  'track1Lv5',
  'track2Unlock',
  'track2Lv10',
  'nextPlanetUnlock',
] as const;

export type MilestoneKey = (typeof MILESTONE_KEYS)[number];
