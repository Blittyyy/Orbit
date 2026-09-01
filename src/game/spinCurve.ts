/**
 * Map absolute spin ratio (|ω| / ω_base) → Energy production multiplier.
 *
 * - Auto rotation (ratio ≤ 1) → 1.0x
 * - Faster spinning always increases production (no hard gameplay cap)
 * - Stronger diminishing returns so sustained averages stay modest
 *
 * Tuned with reduced gesture scales so typical 60s phone tests land near:
 *   normal play ≈ 1.8–2.5x average
 *   aggressive ≈ 2.8–3.8x average
 * with brief peaks above 4x possible but uncommon.
 */

/** Scales how strongly excess spin converts into production bonus. */
export const SPIN_BONUS_SCALE = 0.52;

/**
 * Sub-linear exponent (< 1) for diminishing returns at high speed.
 * Still strictly increasing for all excess > 0.
 */
export const SPIN_BONUS_EXPONENT = 0.74;

export function getSpinProductionMultiplier(spinRatio: number): number {
  const ratio = Math.abs(spinRatio);

  if (!Number.isFinite(ratio) || ratio <= 1) {
    return 1;
  }

  const excess = ratio - 1;
  const bonus = SPIN_BONUS_SCALE * Math.pow(excess, SPIN_BONUS_EXPONENT);

  if (!Number.isFinite(bonus) || bonus <= 0) {
    return 1;
  }

  return 1 + bonus;
}
