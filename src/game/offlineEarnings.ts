import { getTotalPassiveEnergyPerSecond } from './energyLogic';
import { getMaxOfflineDurationMs } from './prestige';
import type { GameState } from './types';

/** Base maximum offline catch-up — 4 hours (before Deep Space Reserves). */
export const MAX_OFFLINE_DURATION_MS = 4 * 60 * 60 * 1000;

/** Show the away popup only after the player has been gone at least this long. */
export const MIN_OFFLINE_POPUP_DURATION_MS = 30_000;

const MEANINGFUL_ENERGY_THRESHOLD = 0.5;

export interface OfflineEarningsResult {
  elapsedMs: number;
  creditedMs: number;
  energyEarned: number;
  shouldShowPopup: boolean;
}

export function calculateOfflineEarnings(
  savedAt: number,
  now: number,
  state: GameState,
): OfflineEarningsResult {
  const elapsedMs = Math.max(0, now - savedAt);
  const creditedMs = Math.min(elapsedMs, getMaxOfflineDurationMs(state));
  const energyEarned =
    getTotalPassiveEnergyPerSecond(state) * (creditedMs / 1000);

  return {
    elapsedMs,
    creditedMs,
    energyEarned,
    shouldShowPopup:
      elapsedMs >= MIN_OFFLINE_POPUP_DURATION_MS &&
      energyEarned >= MEANINGFUL_ENERGY_THRESHOLD,
  };
}

export function calculateSimulatedOfflineHour(state: GameState): OfflineEarningsResult {
  const oneHourMs = 60 * 60 * 1000;
  return calculateOfflineEarnings(Date.now() - oneHourMs, Date.now(), state);
}
