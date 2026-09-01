import { StyleSheet, Text, View } from 'react-native';

import { getSpinProductionMultiplier } from '../game/spinCurve';

interface SpinMultiplierBadgeProps {
  spinRatio: number;
  visible: boolean;
  top: number;
}

export function SpinMultiplierBadge({
  spinRatio,
  visible,
  top,
}: SpinMultiplierBadgeProps) {
  if (!visible) {
    return null;
  }

  const multiplier = getSpinProductionMultiplier(spinRatio);

  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <Text style={styles.text}>{multiplier.toFixed(2)}x</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 8,
  },
  text: {
    color: 'rgba(253, 224, 71, 0.88)',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
