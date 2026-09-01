import { useCallback, useEffect, useRef, useState } from 'react';

import type { PlanetId } from '../config/planets';
import { isPlanetUnlocked } from '../game/planetProgression';
import type { GameState } from '../game/types';

const CELEBRATABLE_PLANETS: PlanetId[] = [
  'mars',
  'venus',
  'mercury',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

export interface PlanetUnlockCelebrationState {
  planetId: PlanetId;
}

export function usePlanetUnlockCelebration(state: GameState) {
  const previousUnlockedRef = useRef<Partial<Record<PlanetId, boolean>>>({});
  const [celebration, setCelebration] =
    useState<PlanetUnlockCelebrationState | null>(null);

  useEffect(() => {
    for (const planetId of CELEBRATABLE_PLANETS) {
      const unlocked = isPlanetUnlocked(state, planetId);
      const previous = previousUnlockedRef.current[planetId];

      if (previous === undefined) {
        previousUnlockedRef.current[planetId] = unlocked;
        continue;
      }

      if (!previous && unlocked) {
        setCelebration({ planetId });
      }

      previousUnlockedRef.current[planetId] = unlocked;
    }
  }, [state.unlockedPlanets]);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return { celebration, dismissCelebration };
}
