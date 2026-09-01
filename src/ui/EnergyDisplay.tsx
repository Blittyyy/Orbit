import { StyleSheet, Text, View } from 'react-native';

import { formatNumber, formatRate } from '../utils/formatNumber';

interface EnergyDisplayProps {
  energy: number;
  planetEnergyPerSecond: number;
  systemEnergyPerSecond?: number;
}

export function EnergyDisplay({
  energy,
  planetEnergyPerSecond,
  systemEnergyPerSecond,
}: EnergyDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Energy</Text>
      <Text style={styles.total}>{formatNumber(energy)}</Text>
      <Text style={styles.rate}>{formatRate(planetEnergyPerSecond, 'Energy')}</Text>
      {systemEnergyPerSecond !== undefined &&
      Math.abs(systemEnergyPerSecond - planetEnergyPerSecond) > 0.05 ? (
        <Text style={styles.systemRate}>
          TOTAL SYSTEM: {formatRate(systemEnergyPerSecond, 'Energy')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  label: {
    color: '#8fa3d9',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  total: {
    color: '#f1f5ff',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 1,
    textAlign: 'center',
  },
  rate: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  systemRate: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
});
