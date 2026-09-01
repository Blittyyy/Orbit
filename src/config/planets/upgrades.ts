/** Visual behavior for an upgrade track's orbiting objects. */
export type UpgradeVisualType =
  | 'moon'
  | 'satellite'
  | 'asteroid'
  | 'ring'
  | 'station'
  | 'comet'
  | 'none';

/** UI accent for upgrade cards (preserves Earth Moon / Satellite look). */
export type UpgradeCardAccent = 'moon' | 'satellite';

export type UpgradeUnlockRequirement =
  | { type: 'rotationSpeed'; level: number }
  | { type: 'upgrade'; upgradeId: string; level: number };

export interface VisibleCountThreshold {
  /** Inclusive minimum upgrade level for this visible count. */
  minLevel: number;
  count: number;
}

export interface PlanetUpgradeConfig {
  id: string;
  displayName: string;
  unlock: UpgradeUnlockRequirement;
  /** Level assigned when the upgrade first unlocks. */
  startingLevel: number;
  bonusPerLevel: number;
  baseUpgradeCost: number;
  costMultiplier: number;
  visualType: UpgradeVisualType;
  /**
   * Celestial config id used to look up placeholder/final art
   * (e.g. moon id or satellite id on the planet visual).
   */
  visualId?: string;
  cardAccent: UpgradeCardAccent;
  /** Cosmetic multi-object thresholds (satellite-style). */
  visibleCountThresholds?: VisibleCountThreshold[];
}

/** Earth / Mars satellite cosmetic count ladder. */
export const DEFAULT_SATELLITE_VISIBLE_COUNTS: VisibleCountThreshold[] = [
  { minLevel: 1, count: 1 },
  { minLevel: 5, count: 2 },
  { minLevel: 10, count: 3 },
  { minLevel: 20, count: 4 },
];

/** Jupiter Galilean moons cosmetic count ladder. */
export const GALILEAN_MOON_VISIBLE_COUNTS: VisibleCountThreshold[] = [
  { minLevel: 1, count: 1 },
  { minLevel: 3, count: 2 },
  { minLevel: 5, count: 3 },
  { minLevel: 8, count: 4 },
];

/** Uranus Moon Network cosmetic count ladder. */
export const URANUS_MOON_NETWORK_VISIBLE_COUNTS: VisibleCountThreshold[] = [
  { minLevel: 1, count: 1 },
  { minLevel: 3, count: 2 },
  { minLevel: 5, count: 3 },
  { minLevel: 8, count: 4 },
  { minLevel: 12, count: 5 },
];

export function getVisibleObjectCount(
  level: number,
  thresholds: VisibleCountThreshold[] | undefined,
): number {
  if (level < 1) {
    return 0;
  }

  if (!thresholds || thresholds.length === 0) {
    return 1;
  }

  let count = 0;

  for (const threshold of thresholds) {
    if (level >= threshold.minLevel) {
      count = threshold.count;
    }
  }

  return count;
}
