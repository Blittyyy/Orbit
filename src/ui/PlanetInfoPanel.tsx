import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRate } from '../utils/formatNumber';

interface PlanetInfoPanelProps {
  title: string;
  subtitle?: string;
  productionLabel?: string;
  productionPerSecond?: number;
  locked?: boolean;
  selected?: boolean;
  frontier?: boolean;
  showEnter?: boolean;
  onEnter?: () => void;
}

export function PlanetInfoPanel({
  title,
  subtitle,
  productionLabel,
  productionPerSecond,
  locked = false,
  selected = false,
  frontier = false,
  showEnter = false,
  onEnter,
}: PlanetInfoPanelProps) {
  return (
    <View
      style={[
        styles.panel,
        selected && styles.panelSelected,
        frontier && styles.panelFrontier,
      ]}
    >
      {frontier ? <Text style={styles.frontierBadge}>FRONTIER</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {locked ? <Text style={styles.lockedBadge}>Locked</Text> : null}
      {subtitle ? (
        <Text style={[styles.subtitle, locked && styles.subtitleLocked]}>
          {subtitle}
        </Text>
      ) : null}
      {productionLabel && productionPerSecond !== undefined ? (
        <Text style={styles.production}>
          {productionLabel}: {formatRate(productionPerSecond, 'Energy')}
        </Text>
      ) : null}
      {showEnter && onEnter ? (
        <Pressable
          onPress={onEnter}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>ENTER PLANET</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 32, 0.94)',
    borderColor: 'rgba(125, 211, 252, 0.28)',
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  panelSelected: {
    borderColor: 'rgba(125, 211, 252, 0.62)',
    shadowColor: '#7dd3fc',
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  panelFrontier: {
    borderColor: 'rgba(253, 224, 71, 0.42)',
  },
  title: {
    color: '#e8edff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitleLocked: {
    color: '#cbd5e1',
  },
  production: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  lockedBadge: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  frontierBadge: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 11,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 24,
    paddingVertical: 10,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.98)',
  },
  buttonText: {
    color: '#f8fbff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
