import { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { getRotationSpeedUpgradeViewModel } from '../game/rotationSpeedUpgrade';
import type { PlanetId } from '../config/planets';
import type { GameState } from '../game/types';
import { formatNumber } from '../utils/formatNumber';
import { upgradeCardStyles as styles } from './upgradeCardStyles';

interface RotationSpeedUpgradeCardProps {
  energy: number;
  level: number;
  planetId: PlanetId;
  onUpgrade: () => boolean;
  gameState?: GameState;
}

function formatBonusPercent(percent: number): string {
  if (percent <= 0) {
    return '+0%';
  }

  return `+${percent.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

export function RotationSpeedUpgradeCard({
  energy,
  level,
  planetId,
  onUpgrade,
  gameState,
}: RotationSpeedUpgradeCardProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const upgrade = getRotationSpeedUpgradeViewModel(energy, level, planetId, gameState);

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
    outputRange: ['rgba(96, 165, 250, 0.28)', 'rgba(125, 211, 252, 0.95)'],
  });

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.45],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        cardSpacing.card,
        {
          borderColor,
          shadowOpacity,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Rotation Speed</Text>
        <Text style={styles.levelBadge}>Lv. {upgrade.level}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Bonus</Text>
          <Text style={[styles.statValue, styles.bonusValue]}>
            {formatBonusPercent(upgrade.productionBonusPercent)}
          </Text>
        </View>
        <View style={[styles.statBlock, cardSpacing.costBlock]}>
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
          styles.button,
          !upgrade.canAfford && styles.buttonDisabled,
          pressed && upgrade.canAfford && styles.buttonPressed,
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

const cardSpacing = {
  card: {
    marginTop: 8,
  },
  costBlock: {
    alignItems: 'flex-end' as const,
  },
};
