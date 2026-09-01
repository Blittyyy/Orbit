import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlanetUpgradeConfig, UpgradeCardAccent } from '../config/planets';
import { getUpgradeViewModel } from '../game/planetUpgrades';
import type { PlanetProgressState, GameState } from '../game/types';
import type { PlanetId } from '../config/planets';
import { formatNumber } from '../utils/formatNumber';
import { upgradeCardStyles as styles } from './upgradeCardStyles';

interface OrbitUpgradeCardProps {
  energy: number;
  planetId: PlanetId;
  progress: PlanetProgressState;
  track: PlanetUpgradeConfig;
  onUpgrade: () => boolean;
  justUnlocked?: boolean;
  gameState?: GameState;
}

function formatBonusPercent(percent: number): string {
  return `+${percent.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

const ACCENT: Record<
  UpgradeCardAccent,
  {
    borderIdle: string;
    borderActive: string;
    shadow: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    bonus: string;
    buttonBg: string;
    buttonBorder: string;
    buttonPressed: string;
  }
> = {
  moon: {
    borderIdle: 'rgba(167, 139, 250, 0.3)',
    borderActive: 'rgba(196, 181, 253, 0.95)',
    shadow: '#a78bfa',
    badgeBg: 'rgba(109, 40, 217, 0.2)',
    badgeBorder: 'rgba(196, 181, 253, 0.35)',
    badgeText: '#ddd6fe',
    bonus: '#c4b5fd',
    buttonBg: 'rgba(109, 40, 217, 0.9)',
    buttonBorder: 'rgba(196, 181, 253, 0.45)',
    buttonPressed: 'rgba(139, 92, 246, 0.98)',
  },
  satellite: {
    borderIdle: 'rgba(56, 189, 248, 0.3)',
    borderActive: 'rgba(125, 211, 252, 0.95)',
    shadow: '#38bdf8',
    badgeBg: 'rgba(8, 47, 73, 0.55)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    badgeText: '#bae6fd',
    bonus: '#7dd3fc',
    buttonBg: 'rgba(3, 105, 161, 0.92)',
    buttonBorder: 'rgba(125, 211, 252, 0.45)',
    buttonPressed: 'rgba(14, 165, 233, 0.98)',
  },
};

export function OrbitUpgradeCard({
  energy,
  planetId,
  progress,
  track,
  onUpgrade,
  justUnlocked = false,
  gameState,
}: OrbitUpgradeCardProps) {
  const glow = useRef(new Animated.Value(justUnlocked ? 1 : 0)).current;
  const upgrade = getUpgradeViewModel(energy, progress, planetId, track.id, gameState);
  const accent = ACCENT[track.cardAccent];

  useEffect(() => {
    if (!justUnlocked) {
      return;
    }

    glow.setValue(1);
    Animated.timing(glow, {
      toValue: 0,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [glow, justUnlocked]);

  if (!upgrade) {
    return null;
  }

  const handlePress = () => {
    const purchased = onUpgrade();

    if (!purchased) {
      return;
    }

    glow.setValue(0);
    Animated.sequence([
      Animated.timing(glow, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(glow, {
        toValue: 0,
        duration: 420,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [accent.borderIdle, accent.borderActive],
  });

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.5],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        localStyles.card,
        {
          borderColor,
          shadowColor: accent.shadow,
          shadowOpacity,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{upgrade.displayName}</Text>
        <Text
          style={[
            localStyles.levelBadge,
            {
              backgroundColor: accent.badgeBg,
              borderColor: accent.badgeBorder,
              color: accent.badgeText,
            },
          ]}
        >
          Lv. {upgrade.level}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Bonus</Text>
          <Text style={[styles.statValue, { color: accent.bonus }]}>
            {formatBonusPercent(upgrade.productionBonusPercent)}
          </Text>
        </View>
        <View style={[styles.statBlock, localStyles.costBlock]}>
          <Text style={styles.statLabel}>Cost</Text>
          <Text style={[styles.statValue, styles.costValue]}>
            {formatNumber(upgrade.upgradeCost)}
          </Text>
        </View>
      </View>

      <Pressable
        disabled={!upgrade.canAfford}
        onPress={handlePress}
        style={({ pressed }) => [
          localStyles.button,
          {
            backgroundColor: accent.buttonBg,
            borderColor: accent.buttonBorder,
          },
          !upgrade.canAfford && styles.buttonDisabled,
          pressed && upgrade.canAfford && { backgroundColor: accent.buttonPressed },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            !upgrade.canAfford && styles.buttonTextDisabled,
          ]}
        >
          Upgrade
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const localStyles = StyleSheet.create({
  card: {
    marginTop: 8,
  },
  levelBadge: {
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  costBlock: {
    alignItems: 'flex-end',
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 42,
    paddingVertical: 10,
  },
});
