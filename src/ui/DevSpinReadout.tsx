import { StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';
import { getSpinProductionMultiplier } from '../game/spinCurve';

interface DevSpinReadoutProps {
  spinRatio: number;
}

/**
 * DEV-only calibration HUD for the manual spin curve.
 * Hidden in production / when DEV controls are off.
 */
export function DevSpinReadout({ spinRatio }: DevSpinReadoutProps) {
  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  const production = getSpinProductionMultiplier(spinRatio);
  const ratio = Number.isFinite(spinRatio) ? Math.abs(spinRatio) : 1;

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.line}>SPIN {production.toFixed(2)}x</Text>
      <Text style={styles.sub}>VELOCITY {ratio.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    top: 52,
    zIndex: 9,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  line: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },
  sub: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
});
