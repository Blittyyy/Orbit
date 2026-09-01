import { StyleSheet, View } from 'react-native';

import { useReduceEffects } from '../../visual/EffectsSettingsContext';

interface SolarFlareVisualProps {
  centerX: number;
  centerY: number;
  planetRadius: number;
  visible: boolean;
}

export function SolarFlareVisual({
  centerX,
  centerY,
  planetRadius,
  visible,
}: SolarFlareVisualProps) {
  const reduceEffects = useReduceEffects();

  if (!visible) {
    return null;
  }

  const glowSize = planetRadius * (reduceEffects ? 2.1 : 2.8);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.glow,
        reduceEffects && styles.glowReduced,
        {
          width: glowSize,
          height: glowSize,
          left: centerX - glowSize / 2,
          top: centerY - glowSize / 2,
          borderRadius: glowSize / 2,
        },
      ]}
    >
      <View style={[styles.innerGlow, reduceEffects && styles.innerGlowReduced]} />
      <View style={[styles.streak, styles.streakOne]} />
      {reduceEffects ? null : <View style={[styles.streak, styles.streakTwo]} />}
      {reduceEffects ? null : <View style={[styles.streak, styles.streakThree]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    backgroundColor: 'rgba(251, 146, 60, 0.14)',
    borderColor: 'rgba(253, 186, 116, 0.35)',
    borderWidth: 1,
    position: 'absolute',
    zIndex: 4,
  },
  glowReduced: {
    backgroundColor: 'rgba(251, 146, 60, 0.07)',
    borderColor: 'rgba(253, 186, 116, 0.18)',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 224, 71, 0.08)',
    borderRadius: 999,
  },
  innerGlowReduced: {
    backgroundColor: 'rgba(253, 224, 71, 0.04)',
  },
  streak: {
    backgroundColor: 'rgba(253, 224, 71, 0.35)',
    borderRadius: 999,
    height: 2,
    position: 'absolute',
    width: 28,
  },
  streakOne: {
    right: 12,
    top: '28%',
    transform: [{ rotate: '24deg' }],
  },
  streakTwo: {
    left: 16,
    top: '58%',
    transform: [{ rotate: '-18deg' }],
    width: 22,
  },
  streakThree: {
    right: '22%',
    top: 10,
    transform: [{ rotate: '52deg' }],
    width: 18,
  },
});
