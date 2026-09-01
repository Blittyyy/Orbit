import { Pressable, StyleSheet, View } from 'react-native';

import { useReduceEffects } from '../../visual/EffectsSettingsContext';

interface CometPassVisualProps {
  width: number;
  height: number;
  progress: number;
  visible: boolean;
  onTap: () => void;
}

export function CometPassVisual({
  width,
  height,
  progress,
  visible,
  onTap,
}: CometPassVisualProps) {
  const reduceEffects = useReduceEffects();

  if (!visible || width <= 0 || height <= 0) {
    return null;
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const startX = -32;
  const startY = height * 0.18;
  const endX = width + 32;
  const endY = height * 0.52;
  const x = startX + (endX - startX) * clamped;
  const y = startY + (endY - startY) * clamped;
  const hitSize = 72;

  return (
    <Pressable
      onPress={onTap}
      style={[
        styles.hitTarget,
        {
          left: x - hitSize / 2,
          top: y - hitSize / 2,
          width: hitSize,
          height: hitSize,
        },
      ]}
    >
      <View style={styles.comet}>
        <View style={[styles.head, reduceEffects && styles.headReduced]} />
        <View style={[styles.tail, reduceEffects && styles.tailReduced]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 12,
  },
  comet: {
    alignItems: 'center',
    flexDirection: 'row',
    transform: [{ rotate: '28deg' }],
  },
  head: {
    backgroundColor: '#fef9c3',
    borderRadius: 999,
    height: 16,
    shadowColor: '#fde047',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    width: 16,
  },
  headReduced: {
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  tail: {
    backgroundColor: 'rgba(191, 219, 254, 0.75)',
    borderRadius: 999,
    height: 4,
    marginLeft: -2,
    width: 42,
  },
  tailReduced: {
    backgroundColor: 'rgba(191, 219, 254, 0.4)',
    height: 2,
    width: 24,
  },
});
