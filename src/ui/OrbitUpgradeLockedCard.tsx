import { StyleSheet, Text, View } from 'react-native';

import type { PlanetId, PlanetUpgradeConfig } from '../config/planets';
import { getUpgradeUnlockRequirementLabel } from '../config/planets';
import { upgradeCardStyles } from './upgradeCardStyles';

interface OrbitUpgradeLockedCardProps {
  planetId: PlanetId;
  track: PlanetUpgradeConfig;
}

export function OrbitUpgradeLockedCard({
  planetId,
  track,
}: OrbitUpgradeLockedCardProps) {
  return (
    <View style={[upgradeCardStyles.card, styles.card]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{track.displayName}</Text>
        <Text style={styles.lockedBadge}>Locked</Text>
      </View>
      <Text style={styles.requirement}>
        {getUpgradeUnlockRequirementLabel(planetId, track.id)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: 'rgba(100, 116, 139, 0.35)',
    marginTop: 8,
    paddingVertical: 9,
    shadowColor: '#64748b',
    shadowOpacity: 0.05,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  lockedBadge: {
    backgroundColor: 'rgba(51, 65, 85, 0.45)',
    borderColor: 'rgba(100, 116, 139, 0.4)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  requirement: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
