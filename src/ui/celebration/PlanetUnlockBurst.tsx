import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const STREAK_COUNT = 7;
const SPARK_COUNT = 6;

interface PlanetUnlockBurstProps {
  centerX: number;
  centerY: number;
  radius: number;
  active: boolean;
  /** Planet atmosphere / accent — tints the pulse and streaks. */
  accentColor?: string;
}

function BurstSpark({
  angle,
  maxDistance,
  size,
  color,
  delayMs,
  active,
}: {
  angle: number;
  maxDistance: number;
  size: number;
  color: string;
  delayMs: number;
  active: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    if (!active) {
      return;
    }

    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }),
    );
  }, [active, delayMs, progress]);

  const style = useAnimatedStyle(() => {
    const distance = progress.value * maxDistance;
    const opacity = Math.max(0, (1 - progress.value * 1.2) * 0.55);

    return {
      opacity,
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: 0.5 + progress.value * 0.5 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.spark,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function BurstStreak({
  angle,
  maxDistance,
  color,
  delayMs,
  active,
}: {
  angle: number;
  maxDistance: number;
  color: string;
  delayMs: number;
  active: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    if (!active) {
      return;
    }

    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
    );
  }, [active, delayMs, progress]);

  const style = useAnimatedStyle(() => {
    const distance = progress.value * maxDistance;
    const opacity = Math.max(0, (1 - progress.value * 1.15) * 0.42);
    const stretch = 0.35 + progress.value * 0.95;

    return {
      opacity,
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { rotate: `${angle}rad` },
        { scaleX: stretch },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.streak,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

function EnergyPulseRing({
  size,
  borderColor,
  delayMs,
  active,
  startScale,
  endScale,
  peakOpacity,
}: {
  size: number;
  borderColor: string;
  delayMs: number;
  active: boolean;
  startScale: number;
  endScale: number;
  peakOpacity: number;
}) {
  const ringScale = useSharedValue(startScale);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    ringScale.value = startScale;
    ringOpacity.value = 0;

    if (!active) {
      return;
    }

    ringOpacity.value = peakOpacity;
    ringScale.value = withDelay(
      delayMs,
      withTiming(endScale, {
        duration: 1900,
        easing: Easing.out(Easing.cubic),
      }),
    );
    ringOpacity.value = withDelay(
      delayMs,
      withTiming(0, { duration: 1900, easing: Easing.out(Easing.quad) }),
    );
  }, [active, delayMs, endScale, peakOpacity, ringOpacity, ringScale, startScale]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderColor,
        },
        ringStyle,
      ]}
    />
  );
}

export function PlanetUnlockBurst({
  centerX,
  centerY,
  radius,
  active,
  accentColor = 'rgba(253, 224, 71, 0.35)',
}: PlanetUnlockBurstProps) {
  const ringSize = radius * 1.75;
  const softAccent = accentColor.includes('rgba')
    ? accentColor.replace(/,\s*[0-9.]+\s*\)/, ', 0.28)')
    : 'rgba(253, 224, 71, 0.28)';
  const streakColor = accentColor.includes('rgba')
    ? accentColor.replace(/,\s*[0-9.]+\s*\)/, ', 0.38)')
    : 'rgba(253, 224, 71, 0.38)';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: centerX,
          top: centerY,
        },
      ]}
    >
      <EnergyPulseRing
        size={ringSize}
        borderColor={softAccent}
        delayMs={0}
        active={active}
        startScale={0.88}
        endScale={1.62}
        peakOpacity={0.26}
      />
      <EnergyPulseRing
        size={ringSize * 0.82}
        borderColor={softAccent}
        delayMs={70}
        active={active}
        startScale={0.82}
        endScale={1.38}
        peakOpacity={0.14}
      />

      {Array.from({ length: STREAK_COUNT }, (_, index) => {
        const angle = (index / STREAK_COUNT) * Math.PI * 2 + 0.2;
        return (
          <BurstStreak
            key={`streak-${index}`}
            angle={angle}
            maxDistance={radius * (1.15 + (index % 2) * 0.2)}
            color={streakColor}
            delayMs={index * 40}
            active={active}
          />
        );
      })}

      {Array.from({ length: SPARK_COUNT }, (_, index) => {
        const angle = (index / SPARK_COUNT) * Math.PI * 2 + 0.55;
        return (
          <BurstSpark
            key={`spark-${index}`}
            angle={angle}
            maxDistance={radius * (1.05 + (index % 2) * 0.15)}
            size={2 + (index % 2)}
            color={streakColor}
            delayMs={index * 55}
            active={active}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 30,
  },
  ring: {
    borderWidth: 1,
    position: 'absolute',
  },
  streak: {
    borderRadius: 1,
    height: 1.5,
    position: 'absolute',
    width: 16,
  },
  spark: {
    position: 'absolute',
  },
});
