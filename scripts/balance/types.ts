import type { PlanetId } from '../../src/config/planets';
import type { PrestigeUpgradeId } from '../../src/game/prestige';
import type {
  MilestoneKey,
  PlayerProfileId,
  StardustStrategyId,
} from './config';

export type PurchaseKind = 'rotationSpeed' | 'upgradeTrack';

export interface PurchaseOption {
  kind: PurchaseKind;
  planetId: PlanetId;
  upgradeId?: string;
  displayName: string;
  cost: number;
  currentEps: number;
  epsAfter: number;
  deltaEps: number;
  paybackSeconds: number;
  advancesUnlock: boolean;
  unlockLabel: string | null;
  levelsToUnlock: number | null;
  score: number;
}

export interface PlanetShareSnapshot {
  atSeconds: number;
  label: string;
  totalEps: number;
  shares: Partial<Record<PlanetId, number>>;
  planetEps: Partial<Record<PlanetId, number>>;
}

export interface PlanetMilestoneTimes {
  planetId: PlanetId;
  rotationLv10: number | null;
  track1Unlock: number | null;
  track1Lv5: number | null;
  track2Unlock: number | null;
  track2Lv10: number | null;
  nextPlanetUnlock: number | null;
  /** Time spent progressing this planet's segment (to track2Lv10 or prestige). */
  segmentSeconds: number | null;
}

export interface RunResult {
  profileId: PlayerProfileId;
  strategyId: StardustStrategyId | null;
  runNumber: number;
  elapsedSeconds: number;
  neptuneUnlockSeconds: number | null;
  prestigeReadySeconds: number | null;
  totalEnergyEarned: number;
  endingEnergy: number;
  endingSystemEps: number;
  endingPlanetEps: Partial<Record<PlanetId, number>>;
  planetMilestones: PlanetMilestoneTimes[];
  productionShares: PlanetShareSnapshot[];
  prestigeLevels: Record<PrestigeUpgradeId, number>;
  stardustSpentThisBreak: number;
  stardustRemaining: number;
  prestigeCountAtStart: number;
  purchases: number;
  poorPaybackPurchases: Array<{
    name: string;
    paybackSeconds: number;
    atSeconds: number;
  }>;
}

export interface PrestigeCampaignResult {
  profileId: PlayerProfileId;
  strategyId: StardustStrategyId;
  runs: RunResult[];
}

export interface BalanceWarning {
  severity: 'info' | 'warn' | 'critical';
  code: string;
  message: string;
}

export interface ProfileComparisonRow {
  milestone: string;
  idleSeconds: number | null;
  casualSeconds: number | null;
  activeSeconds: number | null;
  optimizerSeconds: number | null;
  activeIdleRatio: number | null;
  casualIdleRatio: number | null;
}

export type MilestoneEventMap = Partial<
  Record<PlanetId, Partial<Record<MilestoneKey, number>>>
> & {
  neptuneUnlock?: number;
  prestigeReady?: number;
};
