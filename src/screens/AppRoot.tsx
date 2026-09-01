import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { getPlayablePlanetIds, type PlanetId } from '../config/planets';
import { GameSessionProvider, useGameSession } from '../context/GameSessionContext';
import { useFeedback } from '../feedback';
import { AchievementToast } from '../ui/AchievementToast';
import { AchievementsScreen } from './AchievementsScreen';
import { PlanetGameScreen } from './PlanetGameScreen';
import { PrestigeScreen } from './PrestigeScreen';
import { SolarSystemScreen } from './SolarSystemScreen';

const ACHIEVEMENT_TOAST_DURATION_MS = 2600;

function isPlayableRoute(route: string): route is PlanetId {
  return getPlayablePlanetIds().includes(route as PlanetId);
}

function renderRoute(route: ReturnType<typeof useGameSession>['route']) {
  if (route === 'solarSystem') {
    return <SolarSystemScreen />;
  }

  if (route === 'prestige') {
    return <PrestigeScreen />;
  }

  if (route === 'achievements') {
    return <AchievementsScreen />;
  }

  if (isPlayableRoute(route)) {
    return <PlanetGameScreen planetId={route} />;
  }

  return <PlanetGameScreen planetId="earth" />;
}

function AchievementNotificationHost() {
  const { achievementNotifications, dismissAchievementNotification } =
    useGameSession();
  const { feedback } = useFeedback();
  const active = achievementNotifications[0] ?? null;

  useEffect(() => {
    if (!active) {
      return;
    }

    feedback.onAchievementUnlock();

    const timer = setTimeout(() => {
      dismissAchievementNotification();
    }, ACHIEVEMENT_TOAST_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [active?.id, dismissAchievementNotification, feedback]);

  return (
    <AchievementToast title={active?.title ?? ''} visible={active !== null} />
  );
}

function AppNavigator() {
  const { route, leavingRoute, isReady } = useGameSession();

  if (!isReady) {
    return <View style={styles.boot} />;
  }

  const showLeavingLayer =
    leavingRoute !== null && leavingRoute !== route;

  return (
    <View style={styles.root}>
      {showLeavingLayer ? (
        <View pointerEvents="none" style={styles.leavingLayer}>
          {renderRoute(leavingRoute)}
        </View>
      ) : null}
      <View style={styles.activeLayer}>{renderRoute(route)}</View>
      <AchievementNotificationHost />
    </View>
  );
}

export function AppRoot() {
  return (
    <GameSessionProvider>
      <AppNavigator />
    </GameSessionProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    backgroundColor: '#06061a',
    flex: 1,
  },
  root: {
    backgroundColor: '#06061a',
    flex: 1,
  },
  leavingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  activeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
