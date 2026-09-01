import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { PlanetId } from '../config/planets';
import { getPlayablePlanetIds } from '../config/planets';
import { createRotationSpeedSource } from '../game/rotationSpeedSource';
import type { AchievementDefinition } from '../achievements/types';
import type { PlanetEventEffect } from '../events';
import { IDLE_PLANET_EVENT_EFFECT } from '../events';
import type { PrestigeUpgradeId } from '../game/prestige';
import type { GameSettings } from '../game/settings';
import type { GameState } from '../game/types';
import { createFeedbackController } from '../feedback/feedbackController';
import { useGameEngine } from '../hooks/useGameEngine';
import type { AppRoute } from '../navigation/types';
import {
  IDLE_NAV_TRANSITION,
  isPlanetRoute,
  NAV_TRANSITION_IN_MS,
  NAV_TRANSITION_OUT_MS,
  type NavTransitionState,
} from '../navigation/navTransition';
import {
  createSpinSpeedSource,
  getBaseAngularVelocity,
} from '../visual/spinSpeed';

import type { MutableRotationSpeedSource } from '../game/rotationSpeedSource';
import type { MutableSpinSpeedSource } from '../visual/spinSpeed';

interface GameSessionContextValue {
  state: GameState;
  isReady: boolean;
  route: AppRoute;
  leavingRoute: AppRoute | null;
  navTransition: NavTransitionState;
  isNavigating: boolean;
  solarSystemSelectedPlanet: PlanetId | null;
  solarSystemOriginPlanet: PlanetId;
  spinSpeedSource: MutableSpinSpeedSource;
  rotationSpeedSource: MutableRotationSpeedSource;
  offlineEarnings: ReturnType<typeof useGameEngine>['offlineEarnings'];
  achievementNotifications: AchievementDefinition[];
  dismissAchievementNotification: () => void;
  creditEnergy: (amount: number) => void;
  setPlanetEventEffect: (effect: PlanetEventEffect) => void;
  purchaseRotationSpeedUpgrade: (planetId?: PlanetId) => boolean;
  purchaseUpgrade: (upgradeId: string, planetId?: PlanetId) => boolean;
  purchasePrestigeUpgrade: (upgradeId: PrestigeUpgradeId) => boolean;
  performPrestige: () => boolean;
  dismissOfflineEarnings: () => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  devLevelUp: (planetId?: PlanetId) => void;
  devLevelUpSatellite: (planetId?: PlanetId) => void;
  devUnlockMars: () => void;
  devUnlockVenus: () => void;
  devUnlockMercury: () => void;
  devUnlockJupiter: () => void;
  devUnlockSaturn: () => void;
  devUnlockUranus: () => void;
  devUnlockNeptune: () => void;
  devReadyPrestige: () => void;
  devAddStardust: () => void;
  devResetSave: () => void;
  devSimulateOfflineHour: () => void;
  openSolarSystem: (options?: { selectPlanet?: PlanetId }) => void;
  setSolarSystemSelectedPlanet: (planetId: PlanetId | null) => void;
  openPrestige: () => void;
  openAchievements: () => void;
  enterPlanet: (planetId: PlanetId) => void;
  claimAchievement: (achievementId: string) => boolean;
  devCompleteAllAchievements: () => void;
  goToEarth: () => void;
}

const GameSessionContext = createContext<GameSessionContextValue | null>(null);

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const rotationSpeedSource = useRef(createRotationSpeedSource()).current;
  const spinSpeedSource = useRef(createSpinSpeedSource(rotationSpeedSource)).current;
  const [route, setRoute] = useState<AppRoute>('earth');
  const [leavingRoute, setLeavingRoute] = useState<AppRoute | null>(null);
  const [navTransition, setNavTransition] =
    useState<NavTransitionState>(IDLE_NAV_TRANSITION);
  const [solarSystemSelectedPlanet, setSolarSystemSelectedPlanet] =
    useState<PlanetId | null>(null);
  const [solarSystemOriginPlanet, setSolarSystemOriginPlanet] =
    useState<PlanetId>('earth');
  const planetEventEffectRef = useRef<PlanetEventEffect>(IDLE_PLANET_EVENT_EFFECT);
  const isNavigatingRef = useRef(false);
  const navTransitionRef = useRef(navTransition);
  const transitionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  navTransitionRef.current = navTransition;

  const game = useGameEngine({
    spinSpeedSource,
    rotationSpeedSource,
    planetEventEffectRef,
  });

  const setPlanetEventEffect = useCallback((effect: PlanetEventEffect) => {
    planetEventEffectRef.current = effect;
  }, []);

  const feedback = useMemo(
    () => createFeedbackController(game.state.settings),
    [game.state.settings],
  );

  const purchaseRotationSpeedUpgrade = useCallback(
    (planetId?: PlanetId) => {
      const purchased = game.purchaseRotationSpeedUpgrade(planetId);
      if (purchased) {
        feedback.onUpgradePurchase();
      }
      return purchased;
    },
    [feedback, game],
  );

  const purchaseUpgrade = useCallback(
    (upgradeId: string, planetId?: PlanetId) => {
      const purchased = game.purchaseUpgrade(upgradeId, planetId);
      if (purchased) {
        feedback.onUpgradePurchase();
      }
      return purchased;
    },
    [feedback, game],
  );

  const dismissOfflineEarnings = useCallback(() => {
    if (game.offlineEarnings) {
      feedback.onOfflineCollect();
    }
    game.dismissOfflineEarnings();
  }, [feedback, game]);

  const updateSettings = useCallback(
    (partial: Partial<GameSettings>) => {
      game.updateSettings(partial);
    },
    [game],
  );

  const clearTransitionTimers = useCallback(() => {
    for (const timer of transitionTimersRef.current) {
      clearTimeout(timer);
    }
    transitionTimersRef.current = [];
  }, []);

  const scheduleTransitionTimer = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(fn, delayMs);
    transitionTimersRef.current.push(timer);
    return timer;
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, [clearTransitionTimers]);

  const finishNavigation = useCallback(() => {
    setNavTransition(IDLE_NAV_TRANSITION);
    setLeavingRoute(null);
    isNavigatingRef.current = false;
  }, []);

  const resetSessionSpin = useCallback(() => {
    spinSpeedSource.setAngularVelocity(getBaseAngularVelocity(rotationSpeedSource));
  }, [spinSpeedSource, rotationSpeedSource]);

  const beginTransitionIn = useCallback(
    (kind: NavTransitionState['kind'], focusPlanetId: PlanetId | null) => {
      setNavTransition({
        phase: 'in',
        kind,
        focusPlanetId,
      });
      scheduleTransitionTimer(finishNavigation, NAV_TRANSITION_IN_MS);
    },
    [finishNavigation, scheduleTransitionTimer],
  );

  const runNavTransition = useCallback(
    (
      kind: 'planet-to-solar' | 'solar-to-planet',
      focusPlanetId: PlanetId,
      onSwap: () => void,
    ) => {
      if (navTransitionRef.current.phase === 'out') {
        return false;
      }

      clearTransitionTimers();

      if (navTransitionRef.current.phase === 'in') {
        setLeavingRoute(null);
      }

      isNavigatingRef.current = true;
      setNavTransition({
        phase: 'out',
        kind,
        focusPlanetId,
      });

      scheduleTransitionTimer(() => {
        setLeavingRoute(route);
        onSwap();
        beginTransitionIn(kind, focusPlanetId);
      }, NAV_TRANSITION_OUT_MS);

      return true;
    },
    [beginTransitionIn, clearTransitionTimers, route, scheduleTransitionTimer],
  );

  const openSolarSystem = useCallback(
    (options?: { selectPlanet?: PlanetId }) => {
      if (route === 'solarSystem') {
        return;
      }

      if (navTransitionRef.current.phase === 'out') {
        return;
      }

      const focusPlanet = isPlanetRoute(route)
        ? route
        : game.state.selectedPlanetId;
      const selection =
        options?.selectPlanet ??
        solarSystemSelectedPlanet ??
        focusPlanet;

      setSolarSystemOriginPlanet(focusPlanet);

      if (selection) {
        setSolarSystemSelectedPlanet(selection);
      }

      if (!isPlanetRoute(route)) {
        setRoute('solarSystem');
        return;
      }

      runNavTransition('planet-to-solar', focusPlanet, () => {
        setRoute('solarSystem');
      });
    },
    [
      game.state.selectedPlanetId,
      route,
      runNavTransition,
      solarSystemSelectedPlanet,
    ],
  );

  const openPrestige = useCallback(() => {
    if (isNavigatingRef.current) {
      return;
    }
    clearTransitionTimers();
    finishNavigation();
    setRoute('prestige');
  }, [clearTransitionTimers, finishNavigation]);

  const openAchievements = useCallback(() => {
    if (isNavigatingRef.current) {
      return;
    }
    clearTransitionTimers();
    finishNavigation();
    setRoute('achievements');
  }, [clearTransitionTimers, finishNavigation]);

  const enterPlanet = useCallback(
    (planetId: PlanetId) => {
      if (!getPlayablePlanetIds().includes(planetId)) {
        return;
      }

      if (navTransitionRef.current.phase === 'out') {
        return;
      }

      setSolarSystemSelectedPlanet(planetId);

      if (route !== 'solarSystem') {
        game.selectPlanet(planetId);
        setRoute(planetId);
        return;
      }

      feedback.onEnterPlanet();

      runNavTransition('solar-to-planet', planetId, () => {
        game.selectPlanet(planetId);
        setRoute(planetId);
      });
    },
    [feedback, game, route, runNavTransition],
  );

  const goToEarth = useCallback(() => {
    if (navTransitionRef.current.phase === 'out') {
      return;
    }

    const returnPlanet = solarSystemOriginPlanet;

    setSolarSystemSelectedPlanet(returnPlanet);

    if (route === 'solarSystem') {
      feedback.onEnterPlanet();

      runNavTransition('solar-to-planet', returnPlanet, () => {
        game.selectPlanet(returnPlanet);
        setRoute(returnPlanet);
      });
      return;
    }

    game.selectPlanet('earth');
    setRoute('earth');
  }, [feedback, game, route, runNavTransition, solarSystemOriginPlanet]);

  const performPrestige = useCallback(() => {
    const succeeded = game.performPrestige();
    if (succeeded) {
      feedback.onPrestige();
      clearTransitionTimers();
      finishNavigation();
      resetSessionSpin();
      game.selectPlanet('earth');
      setRoute('earth');
    }
    return succeeded;
  }, [clearTransitionTimers, feedback, finishNavigation, game, resetSessionSpin]);

  const value = useMemo<GameSessionContextValue>(
    () => ({
      state: game.state,
      isReady: game.isReady,
      route,
      leavingRoute,
      navTransition,
      isNavigating: navTransition.phase !== 'idle',
      solarSystemSelectedPlanet,
      solarSystemOriginPlanet,
      spinSpeedSource,
      rotationSpeedSource,
      offlineEarnings: game.offlineEarnings,
      achievementNotifications: game.achievementNotifications,
      dismissAchievementNotification: game.dismissAchievementNotification,
      creditEnergy: game.creditEnergy,
      setPlanetEventEffect,
      purchaseRotationSpeedUpgrade,
      purchaseUpgrade,
      purchasePrestigeUpgrade: game.purchasePrestigeUpgrade,
      performPrestige,
      dismissOfflineEarnings,
      updateSettings,
      devLevelUp: game.devLevelUp,
      devLevelUpSatellite: game.devLevelUpSatellite,
      devUnlockMars: game.devUnlockMars,
      devUnlockVenus: game.devUnlockVenus,
      devUnlockMercury: game.devUnlockMercury,
      devUnlockJupiter: game.devUnlockJupiter,
      devUnlockSaturn: game.devUnlockSaturn,
      devUnlockUranus: game.devUnlockUranus,
      devUnlockNeptune: game.devUnlockNeptune,
      devReadyPrestige: game.devReadyPrestige,
      devAddStardust: game.devAddStardust,
      devResetSave: game.devResetSave,
      devSimulateOfflineHour: game.devSimulateOfflineHour,
      openSolarSystem,
      setSolarSystemSelectedPlanet,
      openPrestige,
      openAchievements,
      enterPlanet,
      claimAchievement: game.claimAchievement,
      devCompleteAllAchievements: game.devCompleteAllAchievements,
      goToEarth,
    }),
    [
      game,
      route,
      leavingRoute,
      navTransition,
      solarSystemSelectedPlanet,
      solarSystemOriginPlanet,
      spinSpeedSource,
      rotationSpeedSource,
      performPrestige,
      purchaseRotationSpeedUpgrade,
      purchaseUpgrade,
      dismissOfflineEarnings,
      updateSettings,
      setPlanetEventEffect,
      openSolarSystem,
      openPrestige,
      openAchievements,
      enterPlanet,
      goToEarth,
    ],
  );

  return (
    <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>
  );
}

export function useGameSession(): GameSessionContextValue {
  const context = useContext(GameSessionContext);

  if (!context) {
    throw new Error('useGameSession must be used within GameSessionProvider');
  }

  return context;
}
