import { useLayoutEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useGameSession } from '../../context/GameSessionContext';
import {
  NAV_TRANSITION_IN_MS,
  NAV_TRANSITION_OUT_MS,
} from '../../navigation/navTransition';
import {
  getSolarTransitionVisuals,
  isLeavingSolarLayer,
  SOLAR_IN_SCALE,
  SOLAR_OUT_SCALE,
} from '../../navigation/navTransitionVisuals';

interface SolarSystemSceneTransitionProps {
  map: ReactNode;
  chrome: ReactNode;
  panel: ReactNode;
}

export function SolarSystemSceneTransition({
  map,
  chrome,
  panel,
}: SolarSystemSceneTransitionProps) {
  const { navTransition, route, leavingRoute } = useGameSession();
  const initial = getSolarTransitionVisuals(navTransition, {
    route,
    leavingRoute,
  });
  const mapScale = useSharedValue(initial.mapScale);
  const mapOpacity = useSharedValue(initial.mapOpacity);
  const chromeOpacity = useSharedValue(initial.chromeOpacity);
  const panelOpacity = useSharedValue(initial.panelOpacity);

  useLayoutEffect(() => {
    const { phase, kind } = navTransition;
    const isLeaving = isLeavingSolarLayer(navTransition, route, leavingRoute);

    if (isLeaving) {
      return;
    }

    if (phase === 'out' && kind === 'solar-to-planet') {
      cancelAnimation(mapScale);
      cancelAnimation(mapOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(panelOpacity);
      mapScale.value = withTiming(SOLAR_OUT_SCALE, {
        duration: NAV_TRANSITION_OUT_MS,
        easing: Easing.in(Easing.cubic),
      });
      mapOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      chromeOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      panelOpacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      return;
    }

    if (phase === 'in' && kind === 'planet-to-solar') {
      cancelAnimation(mapScale);
      cancelAnimation(mapOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(panelOpacity);
      mapScale.value = SOLAR_IN_SCALE;
      mapOpacity.value = 0;
      chromeOpacity.value = 0;
      panelOpacity.value = 0;
      mapScale.value = withTiming(1, {
        duration: NAV_TRANSITION_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      mapOpacity.value = withTiming(1, { duration: NAV_TRANSITION_IN_MS });
      chromeOpacity.value = withTiming(1, { duration: NAV_TRANSITION_IN_MS });
      panelOpacity.value = withTiming(1, {
        duration: NAV_TRANSITION_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (phase === 'idle') {
      cancelAnimation(mapScale);
      cancelAnimation(mapOpacity);
      cancelAnimation(chromeOpacity);
      cancelAnimation(panelOpacity);
      mapScale.value = 1;
      mapOpacity.value = 1;
      chromeOpacity.value = 1;
      panelOpacity.value = 1;
    }
  }, [
    navTransition,
    route,
    leavingRoute,
    chromeOpacity,
    mapOpacity,
    mapScale,
    panelOpacity,
  ]);

  const mapStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
    transform: [{ scale: mapScale.value }],
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
  }));

  return (
    <>
      <Animated.View style={[styles.map, mapStyle]} pointerEvents="none">
        {map}
      </Animated.View>
      <Animated.View
        style={[styles.overlay, chromeStyle]}
        pointerEvents="box-none"
      >
        {chrome}
      </Animated.View>
      <Animated.View
        style={[styles.panelOverlay, panelStyle]}
        pointerEvents="box-none"
      >
        {panel}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  panelOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
});
