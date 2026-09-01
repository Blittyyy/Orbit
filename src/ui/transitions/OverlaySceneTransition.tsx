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
  getOverlayTransitionVisuals,
  isLeavingOverlayLayer,
  OVERLAY_SLIDE_DISTANCE,
} from '../../navigation/navTransitionVisuals';

interface OverlaySceneTransitionProps {
  children: ReactNode;
}

export function OverlaySceneTransition({ children }: OverlaySceneTransitionProps) {
  const { navTransition, route, leavingRoute } = useGameSession();
  const initial = getOverlayTransitionVisuals(navTransition, {
    route,
    leavingRoute,
  });
  const opacity = useSharedValue(initial.opacity);
  const translateY = useSharedValue(initial.translateY);

  useLayoutEffect(() => {
    const { phase, kind } = navTransition;
    const isLeaving = isLeavingOverlayLayer(navTransition, route, leavingRoute);

    if (isLeaving) {
      return;
    }

    if (phase === 'out' && kind === 'overlay-to-solar') {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = withTiming(0, { duration: NAV_TRANSITION_OUT_MS });
      translateY.value = withTiming(OVERLAY_SLIDE_DISTANCE, {
        duration: NAV_TRANSITION_OUT_MS,
        easing: Easing.in(Easing.cubic),
      });
      return;
    }

    if (phase === 'in' && kind === 'solar-to-overlay') {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = 0;
      translateY.value = OVERLAY_SLIDE_DISTANCE;
      opacity.value = withTiming(1, { duration: NAV_TRANSITION_IN_MS });
      translateY.value = withTiming(0, {
        duration: NAV_TRANSITION_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (phase === 'idle') {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = 1;
      translateY.value = 0;
    }
  }, [navTransition, route, leavingRoute, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.root, style]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
});
