import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface AchievementClaimPopProps {
  label: string;
  visible: boolean;
}

export function AchievementClaimPop({ label, visible }: AchievementClaimPopProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const fadeOut = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, 700);

    return () => {
      clearTimeout(fadeOut);
    };
  }, [label, opacity, translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.Text
      style={[
        styles.pop,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      +{label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  pop: {
    color: '#86efac',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    position: 'absolute',
    right: 16,
    top: 8,
    zIndex: 2,
  },
});
