import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { PlanetId } from '../config/planets';
import type { PlanetEventEffect } from '../events';
import { IDLE_PLANET_EVENT_EFFECT } from '../events';
import type { AchievementDefinition } from '../achievements/types';
import { TICK_INTERVAL_MS } from '../game/constants';
import { GameEngine } from '../game/gameEngine';
import type { GameSettings } from '../game/settings';
import {
  calculateOfflineEarnings,
  calculateSimulatedOfflineHour,
  type OfflineEarningsResult,
} from '../game/offlineEarnings';
import type { PrestigeUpgradeId } from '../game/prestige';
import type { MutableRotationSpeedSource } from '../game/rotationSpeedSource';
import type { GameState } from '../game/types';
import type { SpinSpeedSource } from '../game/spinSpeed';
import {
  AUTOSAVE_INTERVAL_MS,
  clearGameSave,
  loadGameSave,
  writeGameSave,
} from '../save';
import { toGameState } from '../save/saveCodec';

interface UseGameEngineOptions {
  spinSpeedSource: SpinSpeedSource;
  rotationSpeedSource: MutableRotationSpeedSource;
  planetEventEffectRef: RefObject<PlanetEventEffect>;
}

function applyOfflineEarnings(
  engine: GameEngine,
  result: OfflineEarningsResult,
): OfflineEarningsResult | null {
  if (result.energyEarned <= 0) {
    return result.shouldShowPopup ? result : null;
  }

  engine.creditEnergy(result.energyEarned);
  void writeGameSave(engine.getState());

  return result.shouldShowPopup ? result : null;
}

export function useGameEngine({
  spinSpeedSource,
  rotationSpeedSource,
  planetEventEffectRef,
}: UseGameEngineOptions) {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(spinSpeedSource, rotationSpeedSource);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<GameState>(() => engine.getState());
  const [isReady, setIsReady] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarningsResult | null>(
    null,
  );
  const [achievementNotifications, setAchievementNotifications] = useState<
    AchievementDefinition[]
  >([]);
  const latestStateRef = useRef(state);
  const achievementToastsEnabledRef = useRef(false);

  const enqueueAchievementNotifications = useCallback(
    (definitions: AchievementDefinition[]) => {
      if (!achievementToastsEnabledRef.current || definitions.length === 0) {
        return;
      }

      setAchievementNotifications((current) => [...current, ...definitions]);
    },
    [],
  );

  const dismissAchievementNotification = useCallback(() => {
    setAchievementNotifications((current) => current.slice(1));
  }, []);

  const syncAchievementsFromSpin = useCallback(() => {
    const newlyCompleted = engine.syncAchievements(spinSpeedSource.getSpinRatio());
    enqueueAchievementNotifications(newlyCompleted);
  }, [engine, enqueueAchievementNotifications, spinSpeedSource]);

  useEffect(() => {
    return engine.subscribe((nextState) => {
      latestStateRef.current = nextState;
      setState(nextState);
      syncAchievementsFromSpin();
    });
  }, [engine, syncAchievementsFromSpin]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedGame = async () => {
      const saved = await loadGameSave();

      if (cancelled) {
        return;
      }

      if (saved) {
        engine.hydrate(toGameState(saved.state));

        const hydrated = engine.getState();
        const result = calculateOfflineEarnings(
          saved.savedAt,
          Date.now(),
          hydrated,
        );
        const popup = applyOfflineEarnings(engine, result);

        if (!cancelled && popup) {
          setOfflineEarnings(popup);
        }
      }

      if (!cancelled) {
        engine.syncAchievements(spinSpeedSource.getSpinRatio());
        achievementToastsEnabledRef.current = true;
        setIsReady(true);
      }
    };

    void loadSavedGame();

    return () => {
      cancelled = true;
    };
  }, [engine]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const interval = setInterval(() => {
      const effect = planetEventEffectRef.current ?? IDLE_PLANET_EVENT_EFFECT;
      const selectedPlanetId = engine.getState().selectedPlanetId;
      const activeEventMultiplier =
        effect.planetId === selectedPlanetId ? effect.productionMultiplier : 1;
      engine.tick(TICK_INTERVAL_MS / 1000, activeEventMultiplier);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [engine, isReady, planetEventEffectRef]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const persist = () => {
      void writeGameSave(latestStateRef.current);
    };

    const autosaveInterval = setInterval(persist, AUTOSAVE_INTERVAL_MS);

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        persist();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(autosaveInterval);
      subscription.remove();
    };
  }, [engine, isReady]);

  const purchaseRotationSpeedUpgrade = useCallback((planetId?: PlanetId) => {
    return engine.purchaseRotationSpeedUpgrade(planetId);
  }, [engine]);

  const purchaseUpgrade = useCallback((upgradeId: string, planetId?: PlanetId) => {
    return engine.purchaseUpgrade(upgradeId, planetId);
  }, [engine]);

  const purchasePrestigeUpgrade = useCallback((upgradeId: PrestigeUpgradeId) => {
    const purchased = engine.purchasePrestigeUpgrade(upgradeId);
    if (purchased) {
      void writeGameSave(engine.getState());
    }
    return purchased;
  }, [engine]);

  const performPrestige = useCallback(() => {
    const succeeded = engine.performPrestige();
    if (succeeded) {
      void writeGameSave(engine.getState());
    }
    return succeeded;
  }, [engine]);

  const dismissOfflineEarnings = useCallback(() => {
    setOfflineEarnings(null);
  }, []);

  const devLevelUp = useCallback((planetId?: PlanetId) => {
    engine.devLevelUpPlanet(planetId);
  }, [engine]);

  const devResetSave = useCallback(() => {
    void clearGameSave().then(() => {
      engine.resetToInitial();
      latestStateRef.current = engine.getState();
      setOfflineEarnings(null);
    });
  }, [engine]);

  const devLevelUpSatellite = useCallback((planetId?: PlanetId) => {
    engine.devLevelUpSatellite(planetId);
  }, [engine]);

  const devSimulateOfflineHour = useCallback(() => {
    const result = calculateSimulatedOfflineHour(engine.getState());
    const popup = applyOfflineEarnings(engine, result);
    setOfflineEarnings(popup);
  }, [engine]);

  const selectPlanet = useCallback(
    (planetId: PlanetId) => {
      engine.selectPlanet(planetId);
    },
    [engine],
  );

  const updateSettings = useCallback(
    (partial: Partial<GameSettings>) => {
      engine.updateSettings(partial);
      void writeGameSave(engine.getState());
    },
    [engine],
  );

  const devUnlockMars = useCallback(() => {
    engine.devUnlockMars();
  }, [engine]);

  const devUnlockVenus = useCallback(() => {
    engine.devUnlockVenus();
  }, [engine]);

  const devUnlockMercury = useCallback(() => {
    engine.devUnlockMercury();
  }, [engine]);

  const devUnlockJupiter = useCallback(() => {
    engine.devUnlockJupiter();
  }, [engine]);

  const devUnlockSaturn = useCallback(() => {
    engine.devUnlockSaturn();
  }, [engine]);

  const devUnlockUranus = useCallback(() => {
    engine.devUnlockUranus();
  }, [engine]);

  const devUnlockNeptune = useCallback(() => {
    engine.devUnlockNeptune();
  }, [engine]);

  const devReadyPrestige = useCallback(() => {
    engine.devReadyPrestige();
  }, [engine]);

  const devAddStardust = useCallback(() => {
    engine.devAddStardust();
  }, [engine]);

  const claimAchievement = useCallback(
    (achievementId: string) => {
      const claimed = engine.claimAchievement(achievementId);
      if (claimed) {
        void writeGameSave(engine.getState());
      }
      return claimed;
    },
    [engine],
  );

  const creditEnergy = useCallback(
    (amount: number) => {
      engine.creditEnergy(amount);
    },
    [engine],
  );

  const devCompleteAllAchievements = useCallback(() => {
    engine.devCompleteAllAchievements();
    void writeGameSave(engine.getState());
  }, [engine]);

  return {
    state,
    isReady,
    offlineEarnings,
    achievementNotifications,
    dismissAchievementNotification,
    purchaseRotationSpeedUpgrade,
    purchaseUpgrade,
    purchasePrestigeUpgrade,
    performPrestige,
    dismissOfflineEarnings,
    devLevelUp,
    devLevelUpSatellite,
    devUnlockMars,
    devUnlockVenus,
    devUnlockMercury,
    devUnlockJupiter,
    devUnlockSaturn,
    devUnlockUranus,
    devUnlockNeptune,
    devReadyPrestige,
    devAddStardust,
    devResetSave,
    devSimulateOfflineHour,
    selectPlanet,
    updateSettings,
    claimAchievement,
    creditEnergy,
    devCompleteAllAchievements,
  };
}
