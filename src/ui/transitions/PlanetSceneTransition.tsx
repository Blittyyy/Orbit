import { useLayoutEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { PlanetId } from '../../config/planets';
import { useGameSession } from '../../context/GameSessionContext';
import {
  NAV_TRANSITION_IN_MS,
  NAV_TRANSITION_OUT_MS,
} from '../../navigation/navTransition';
import {
  getPlanetTransitionVisuals,
  isLeavingPlanetLayer,
  PLANET_IN_SCALE,
  PLANET_OUT_SCALE,
} from '../../navigation/navTransitionVisuals';

interface PlanetSceneTransitionProps {
  planetId: PlanetId;
  scene: ReactNode;
  chrome: ReactNode;
  hud: ReactNode;
}

export function PlanetSceneTransition({
  planetId,
  scene,
  chrome,
  hud,
}: PlanetSceneTransitionProps) {
  const { navTransition, route, leavingRoute } = useGameSession();
  const initial = getPlanetTransitionVisuals(navTransition, planetId, {
    route,
    leavingRoute,
  });
  const planetScale = useSharedValue(initial.planetScale);
  const sceneOpacity = useSharedValue(initial.sceneOpacity);
  const chromeOpacity = useSharedValue(initial.chromeOpacity);
  const hudOpacity = useSharedValue(initial.hudOpacity);

  useLayoutEffect(() => {
    const { phase, kind, focusPlanetId } = navTransition;
    const isFocus = focusPlanetId === planetId;
    const isLeaving = isLeavingPlanetLayer(
      navTransition,
      planetId,
      route,
      leavingRoute,
    );

    if (isLeaving) {
      return;
    }

    if (phase === 'out' && kind === 'planet-to-solar' && isFocus) {
      cancelAnimation(planetScale);
      cancelAnimation(sceneOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(hudOpacity);
      planetScale.value = withTiming(PLANET_OUT_SCALE, {
        duration: NAV_TRANSITION_OUT_MS,
        easing: Easing.in(Easing.cubic),
      });
      sceneOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      chromeOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      hudOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      return;
    }

    if (phase === 'in' && kind === 'solar-to-planet' && isFocus) {
      cancelAnimation(planetScale);
      cancelAnimation(sceneOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(hudOpacity);
      planetScale.value = PLANET_IN_SCALE;
      sceneOpacity.value = 0;
      chromeOpacity.value = 0;
      hudOpacity.value = 0;
      planetScale.value = withTiming(1, {
        duration: NAV_TRANSITION_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      sceneOpacity.value = withTiming(1, { duration: NAV_TRANSITION_IN_MS });
      chromeOpacity.value = withDelay(
        60,
        withTiming(1, { duration: NAV_TRANSITION_IN_MS - 60 }),
      );
      hudOpacity.value = withDelay(
        90,
        withTiming(1, { duration: NAV_TRANSITION_IN_MS - 90 }),
      );
      return;
    }

    if (phase === 'idle') {
      cancelAnimation(planetScale);
      cancelAnimation(sceneOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(hudOpacity);
      planetScale.value = 1;
      sceneOpacity.value = 1;
      chromeOpacity.value = 1;
      hudOpacity.value = 1;
    }
  }, [
    navTransition,
    planetId,
    route,
    leavingRoute,
    chromeOpacity,
    hudOpacity,
    planetScale,
    sceneOpacity,
  ]);

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
    transform: [{ scale: planetScale.value }],
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
  }));
  const hudStyle = useAnimatedStyle(() => ({
    opacity: hudOpacity.value,
  }));

  return (
    <>
      <Animated.View
        style={[styles.scene, sceneStyle]}
        pointerEvents="box-none"
      >
        {scene}
      </Animated.View>
      <Animated.View
        style={[styles.overlay, chromeStyle]}
        pointerEvents="box-none"
      >
        {chrome}
      </Animated.View>
      <Animated.View
        style={[styles.overlay, hudStyle]}
        pointerEvents="box-none"
      >
        {hud}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
