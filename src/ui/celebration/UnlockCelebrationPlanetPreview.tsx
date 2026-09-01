import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { getPlanetVisualConfig } from '../../config/celestial';
import type { PlanetId } from '../../config/planets';
import { PlanetBodyView } from '../../rendering/celestial/PlanetBodyView';

const PREVIEW_SIZE = 128;
const PREVIEW_RADIUS = 46;
const PREVIEW_CENTER = PREVIEW_SIZE / 2;

interface UnlockCelebrationPlanetPreviewProps {
  planetId: PlanetId;
  active: boolean;
}

export function UnlockCelebrationPlanetPreview({
  planetId,
  active,
}: UnlockCelebrationPlanetPreviewProps) {
  const scale = useSharedValue(0.84);
  const opacity = useSharedValue(0.42);
  const config = getPlanetVisualConfig(planetId);

  useEffect(() => {
    scale.value = 0.84;
    opacity.value = 0.42;

    if (!active) {
      return;
    }

    scale.value = withDelay(
      100,
      withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }),
    );
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, [active, planetId, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <PlanetBodyView
          config={config}
          centerX={PREVIEW_CENTER}
          centerY={PREVIEW_CENTER}
          radius={PREVIEW_RADIUS}
          surfaceOffset={0}
          spinRatio={1}
        />
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: PREVIEW_SIZE,
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 4,
    width: PREVIEW_SIZE,
  },
  canvas: {
    height: PREVIEW_SIZE,
    width: PREVIEW_SIZE,
  },
});
