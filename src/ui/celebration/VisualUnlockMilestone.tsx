import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const MILESTONE_DURATION_MS = 1800;

interface VisualUnlockMilestoneProps {
  label: string;
  visible: boolean;
  onComplete: () => void;
}

export function VisualUnlockMilestone({
  label,
  visible,
  onComplete,
}: VisualUnlockMilestoneProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.82);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      opacity.value = 0;
      scale.value = 0.82;
      glow.value = 0;
      return;
    }

    opacity.value = withSequence(
      withTiming(1, { duration: 260 }),
      withDelay(900, withTiming(0, { duration: 500 })),
    );
    scale.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    glow.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(700, withTiming(0, { duration: 500 })),
    );

    const timeout = setTimeout(onComplete, MILESTONE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [visible, glow, onComplete, opacity, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
    transform: [{ scale: 1 + glow.value * 0.25 }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.badge, containerStyle]}>
        <Text style={styles.text}>{label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '34%',
    zIndex: 25,
  },
  glow: {
    backgroundColor: 'rgba(125, 211, 252, 0.35)',
    borderRadius: 999,
    height: 72,
    position: 'absolute',
    width: 220,
  },
  badge: {
    backgroundColor: 'rgba(8, 12, 36, 0.94)',
    borderColor: 'rgba(125, 211, 252, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#7dd3fc',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  text: {
    color: '#e0f2fe',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
