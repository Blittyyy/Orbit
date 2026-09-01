import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { getPlanetVisualConfig } from '../../config/celestial';
import type { PlanetId } from '../../config/planets';
import { PlanetUnlockBurst } from './PlanetUnlockBurst';
import { UnlockCelebrationPlanetPreview } from './UnlockCelebrationPlanetPreview';

const CELEBRATION_DURATION_MS = 2400;

interface PlanetUnlockCelebrationProps {
  visible: boolean;
  planetId: PlanetId;
  planetName: string;
  centerX: number;
  centerY: number;
  planetRadius: number;
  onViewSolarSystem: () => void;
  onDismiss: () => void;
}

export function PlanetUnlockCelebration({
  visible,
  planetId,
  planetName,
  centerX,
  centerY,
  planetRadius,
  onViewSolarSystem,
  onDismiss,
}: PlanetUnlockCelebrationProps) {
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const planetVisual = getPlanetVisualConfig(planetId);
  const burstAccent = useMemo(
    () =>
      planetVisual.placeholderAtmosphereColor ??
      planetVisual.placeholderAccentColor ??
      planetVisual.placeholderColor,
    [planetVisual],
  );

  useEffect(() => {
    if (!visible) {
      backdropOpacity.value = 0;
      cardScale.value = 0.88;
      cardOpacity.value = 0;
      return;
    }

    backdropOpacity.value = withTiming(1, { duration: 280 });
    cardOpacity.value = withDelay(120, withTiming(1, { duration: 320 }));
    cardScale.value = withDelay(
      120,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );

    const timeout = setTimeout(() => {
      backdropOpacity.value = withTiming(0, { duration: 500 });
      cardOpacity.value = withTiming(0, { duration: 450 });
      onDismiss();
    }, CELEBRATION_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [visible, backdropOpacity, cardOpacity, cardScale, onDismiss]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.8,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />

      <PlanetUnlockBurst
        active={visible}
        centerX={centerX}
        centerY={centerY}
        radius={planetRadius}
        accentColor={burstAccent}
      />

      <Animated.View style={[styles.cardWrap, cardStyle]} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>NEW PLANET UNLOCKED</Text>
          <UnlockCelebrationPlanetPreview planetId={planetId} active={visible} />
          <Text style={styles.planetName}>{planetName.toUpperCase()}</Text>
          <Pressable
            onPress={onViewSolarSystem}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>VIEW IN SOLAR SYSTEM</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#01040f',
  },
  cardWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(6, 10, 30, 0.97)',
    borderColor: 'rgba(253, 224, 71, 0.45)',
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 320,
    paddingHorizontal: 24,
    paddingBottom: 22,
    paddingTop: 20,
    shadowColor: '#fbbf24',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    width: '100%',
  },
  eyebrow: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  planetName: {
    color: '#f8fbff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 2,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 11,
    borderWidth: 1,
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 11,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.98)',
  },
  buttonText: {
    color: '#f8fbff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
