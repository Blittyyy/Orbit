import { getSpinProductionMultiplier } from '../game/spinCurve';

const STREAK_COUNT = 6;

/** Production level where visual boost intensity is considered "full". */
const SPIN_BOOST_FULL_PRODUCTION = 4;

export const SPEED_STREAK_ANGLES = Array.from(
  { length: STREAK_COUNT },
  (_, index) => (index / STREAK_COUNT) * Math.PI * 2,
);

/**
 * Visual boost intensity from the live production multiplier.
 * Soft-saturates for streak FX; does not cap Energy production.
 */
export function getSpinBoostIntensity(spinRatio: number): number {
  const production = getSpinProductionMultiplier(spinRatio);
  if (production <= 1) {
    return 0;
  }

  return Math.min(
    1,
    (production - 1) / (SPIN_BOOST_FULL_PRODUCTION - 1),
  );
}
