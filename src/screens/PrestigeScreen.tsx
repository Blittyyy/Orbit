import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHOW_DEV_CONTROLS } from '../config/dev';
import { useGameSession } from '../context/GameSessionContext';
import {
  canAffordPrestigeUpgrade,
  canPrestige,
  getCosmicMomentumBonusPercent,
  getMaxOfflineDurationHours,
  getNeptuneStormHarvestersProgress,
  getOrbitalKnowledgeDiscountPercent,
  getPrestigeUpgradeLevel,
  getPrestigeUpgradeNextCost,
  PRESTIGE_STARDUST_REWARD,
  PRESTIGE_UPGRADES,
  type PrestigeUpgradeId,
} from '../game/prestige';
import { formatNumber } from '../utils/formatNumber';

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}%`;
}

export function PrestigeScreen() {
  const insets = useSafeAreaInsets();
  const {
    state,
    purchasePrestigeUpgrade,
    performPrestige,
    openSolarSystem,
    devReadyPrestige,
    devAddStardust,
  } = useGameSession();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;

  const prestigeReady = canPrestige(state);
  const stormProgress = getNeptuneStormHarvestersProgress(state);

  useEffect(() => {
    if (!collapsing) {
      return;
    }

    fade.setValue(0);
    flash.setValue(0);

    Animated.sequence([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(flash, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(flash, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      performPrestige();
      setCollapsing(false);
      setConfirmVisible(false);
    });
  }, [collapsing, fade, flash, performPrestige]);

  const handleConfirmCollapse = () => {
    if (!prestigeReady || collapsing) {
      return;
    }
    setConfirmVisible(false);
    setCollapsing(true);
  };

  const renderUpgradeCard = (upgradeId: PrestigeUpgradeId) => {
    const config = PRESTIGE_UPGRADES[upgradeId];
    const level = getPrestigeUpgradeLevel(state, upgradeId);
    const cost = getPrestigeUpgradeNextCost(state, upgradeId);
    const affordable = canAffordPrestigeUpgrade(state, upgradeId);

    let effectLabel = '';
    if (upgradeId === 'cosmicMomentum') {
      effectLabel = `Bonus: +${formatPercent(getCosmicMomentumBonusPercent(state))}`;
    } else if (upgradeId === 'orbitalKnowledge') {
      effectLabel = `Cost reduction: −${formatPercent(getOrbitalKnowledgeDiscountPercent(state))}`;
    } else {
      effectLabel = `Offline cap: ${getMaxOfflineDurationHours(state)} hours`;
    }

    return (
      <View key={upgradeId} style={styles.card}>
        <Text style={styles.cardTitle}>{config.displayName.toUpperCase()}</Text>
        <Text style={styles.cardMeta}>Lv. {level}</Text>
        <Text style={styles.cardEffect}>{effectLabel}</Text>
        <Text style={styles.cardCost}>
          Cost: {formatNumber(cost)} Stardust
        </Text>
        <Pressable
          disabled={!affordable}
          onPress={() => purchasePrestigeUpgrade(upgradeId)}
          style={({ pressed }) => [
            styles.upgradeButton,
            !affordable && styles.upgradeButtonDisabled,
            pressed && affordable && styles.upgradeButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.upgradeButtonText,
              !affordable && styles.upgradeButtonTextDisabled,
            ]}
          >
            Upgrade
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => openSolarSystem()} style={styles.backButton}>
          <Text style={styles.backText}>← Solar System</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stardustValue}>
          {formatNumber(state.stardust)} Stardust
        </Text>
        <Text style={styles.prestigeCount}>
          Prestige Count: {formatNumber(state.prestigeCount)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESTIGE</Text>
          {prestigeReady ? (
            <>
              <Text style={styles.readyTitle}>COLLAPSE SOLAR SYSTEM</Text>
              <Text style={styles.reward}>
                Reward: +{PRESTIGE_STARDUST_REWARD} Stardust
              </Text>
              <Pressable
                onPress={() => setConfirmVisible(true)}
                style={({ pressed }) => [
                  styles.prestigeButton,
                  pressed && styles.prestigeButtonPressed,
                ]}
              >
                <Text style={styles.prestigeButtonText}>PRESTIGE</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.lockedCopy}>
                Complete Neptune Storm Harvesters Lv. 10
                {'\n'}
                to collapse this Solar System.
              </Text>
              <Text style={styles.progress}>
                Storm Harvesters:{' '}
                {stormProgress.unlocked ? stormProgress.level : 0}/
                {stormProgress.required}
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERMANENT UPGRADES</Text>
          {renderUpgradeCard('cosmicMomentum')}
          {renderUpgradeCard('orbitalKnowledge')}
          {renderUpgradeCard('deepSpaceReserves')}
        </View>

        {__DEV__ && SHOW_DEV_CONTROLS ? (
          <View style={styles.devRow}>
            <Pressable onPress={devReadyPrestige} style={styles.devButton}>
              <Text style={styles.devButtonText}>DEV Ready Prestige</Text>
            </Pressable>
            <Pressable onPress={devAddStardust} style={styles.devButton}>
              <Text style={styles.devButtonText}>DEV +10 Stardust</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={confirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>COLLAPSE SOLAR SYSTEM?</Text>
            <Text style={styles.modalSectionLabel}>You will lose:</Text>
            <Text style={styles.modalBody}>
              - Energy{'\n'}
              - planet upgrades{'\n'}
              - unlocked planets
            </Text>
            <Text style={styles.modalSectionLabel}>You will keep:</Text>
            <Text style={styles.modalBody}>
              - Stardust{'\n'}
              - permanent upgrades
            </Text>
            <Text style={styles.modalReward}>
              Reward:{'\n'}+{PRESTIGE_STARDUST_REWARD} Stardust
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={({ pressed }) => [
                  styles.modalCancel,
                  pressed && styles.modalCancelPressed,
                ]}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmCollapse}
                style={({ pressed }) => [
                  styles.modalConfirm,
                  pressed && styles.modalConfirmPressed,
                ]}
              >
                <Text style={styles.modalConfirmText}>COLLAPSE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {collapsing ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              styles.collapseFade,
              {
                opacity: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.88],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.collapseFlash,
              {
                opacity: flash,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#06061a',
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backText: {
    color: '#bae6fd',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stardustValue: {
    color: '#fde68a',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  prestigeCount: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: '#8fa3d9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  lockedCopy: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  progress: {
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  readyTitle: {
    color: '#e8edff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  reward: {
    color: '#fde68a',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  prestigeButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.92)',
    borderColor: 'rgba(248, 113, 113, 0.55)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  prestigeButtonPressed: {
    opacity: 0.85,
  },
  prestigeButtonText: {
    color: '#fecaca',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: 'rgba(12, 8, 32, 0.94)',
    borderColor: 'rgba(125, 211, 252, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: {
    color: '#e8edff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  cardEffect: {
    color: '#7dd3fc',
    fontSize: 13,
    marginTop: 6,
  },
  cardCost: {
    color: '#fde68a',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  upgradeButtonPressed: {
    opacity: 0.85,
  },
  upgradeButtonText: {
    color: '#e0f2fe',
    fontSize: 13,
    fontWeight: '700',
  },
  upgradeButtonTextDisabled: {
    color: '#64748b',
  },
  devRow: {
    gap: 8,
    marginTop: 20,
  },
  devButton: {
    backgroundColor: 'rgba(76, 29, 149, 0.85)',
    borderColor: 'rgba(196, 181, 253, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  devButtonText: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 6, 22, 0.78)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: 'rgba(12, 8, 32, 0.98)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 360,
    paddingHorizontal: 22,
    paddingVertical: 22,
    width: '100%',
  },
  modalTitle: {
    color: '#fecaca',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  modalSectionLabel: {
    color: '#8fa3d9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
  },
  modalBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  modalReward: {
    color: '#fde68a',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  modalCancel: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modalCancelPressed: {
    opacity: 0.85,
  },
  modalCancelText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalConfirm: {
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
    borderColor: 'rgba(248, 113, 113, 0.55)',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modalConfirmPressed: {
    opacity: 0.85,
  },
  modalConfirmText: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  collapseFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
  },
  collapseFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafc',
  },
});
