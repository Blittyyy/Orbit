import { getPlayablePlanetIds, getPlanetUpgradeTracks, type PlanetId } from '../config/planets';
import { PRESTIGE_STORM_HARVESTERS_LEVEL } from './prestige';
import { getUpgradeLevel, isUpgradeUnlocked } from './planetUpgrades';
import { isPlanetUnlocked } from './planetProgression';
import { getPlanetProgress, type GameState } from './types';

/** True when the planet's secondary track has reached its segment goal. */
export function isPlanetSegmentComplete(
  state: GameState,
  planetId: PlanetId,
): boolean {
  const tracks = getPlanetUpgradeTracks(planetId);
  const secondary = tracks[1];
  if (!secondary) {
    return true;
  }

  const progress = getPlanetProgress(state, planetId);
  if (!isUpgradeUnlocked(progress, secondary.id)) {
    return false;
  }

  const required =
    planetId === 'neptune' ? PRESTIGE_STORM_HARVESTERS_LEVEL : 10;

  return getUpgradeLevel(progress, secondary.id) >= required;
}

/**
 * The planet the player is currently progressing through:
 * newest unlocked planet that is not segment-complete, else newest unlocked.
 */
export function getFrontierPlanetId(state: GameState): PlanetId {
  const order = getPlayablePlanetIds();
  let newestUnlocked: PlanetId = order[0] ?? 'earth';

  for (const planetId of order) {
    if (!isPlanetUnlocked(state, planetId)) {
      break;
    }

    newestUnlocked = planetId;

    if (!isPlanetSegmentComplete(state, planetId)) {
      return planetId;
    }
  }

  return newestUnlocked;
}
