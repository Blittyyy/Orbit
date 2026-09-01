import { applyPlanetUnlocks } from './planetProgression';
import {
  applyUpgradeUnlocks,
  bumpUpgradeLevel,
  getPrimaryUpgradeTrack,
  getSecondaryUpgradeTrack,
  isUpgradeUnlocked,
} from './planetUpgrades';
import { getPlanetProgress, updatePlanetProgress, type GameState } from './types';

/** DEV progression cheats always target Earth. */
const DEV_PLANET = 'earth' as const;

export function devLevelUp(state: GameState): GameState {
  const earth = getPlanetProgress(state, DEV_PLANET);
  const primary = getPrimaryUpgradeTrack(DEV_PLANET);

  if (primary && isUpgradeUnlocked(earth, primary.id)) {
    return applyPlanetUnlocks(
      applyUpgradeUnlocks(
        updatePlanetProgress(state, DEV_PLANET, (progress) =>
          bumpUpgradeLevel(progress, DEV_PLANET, primary.id),
        ),
        DEV_PLANET,
      ),
    );
  }

  return applyPlanetUnlocks(
    applyUpgradeUnlocks(
      updatePlanetProgress(state, DEV_PLANET, (progress) => ({
        ...progress,
        rotationSpeedLevel: progress.rotationSpeedLevel + 1,
      })),
      DEV_PLANET,
    ),
  );
}

export function devLevelUpSatellite(state: GameState): GameState {
  const secondary = getSecondaryUpgradeTrack(DEV_PLANET);

  if (!secondary) {
    return state;
  }

  return applyPlanetUnlocks(
    applyUpgradeUnlocks(
      updatePlanetProgress(state, DEV_PLANET, (progress) =>
        bumpUpgradeLevel(progress, DEV_PLANET, secondary.id),
      ),
      DEV_PLANET,
    ),
  );
}

export {
  devUnlockJupiter,
  devUnlockMars,
  devUnlockMercury,
  devUnlockNeptune,
  devUnlockSaturn,
  devUnlockUranus,
  devUnlockVenus,
} from './planetProgression';
