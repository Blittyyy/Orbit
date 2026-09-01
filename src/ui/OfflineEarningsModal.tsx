import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { OfflineEarningsResult } from '../game/offlineEarnings';
import { formatDuration, formatNumber } from '../utils/formatNumber';

interface OfflineEarningsModalProps {
  result: OfflineEarningsResult | null;
  onCollect: () => void;
}

export function OfflineEarningsModal({
  result,
  onCollect,
}: OfflineEarningsModalProps) {
  if (!result) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={onCollect}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>WHILE YOU WERE AWAY</Text>
          <Text style={styles.energy}>{formatNumber(result.energyEarned)} Energy</Text>
          <Text style={styles.duration}>
            Offline for: {formatDuration(result.elapsedMs)}
          </Text>
          <Pressable
            onPress={onCollect}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>COLLECT</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 6, 22, 0.72)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 32, 0.96)',
    borderColor: 'rgba(125, 211, 252, 0.28)',
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 340,
    paddingHorizontal: 24,
    paddingVertical: 22,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    width: '100%',
  },
  title: {
    color: '#8fa3d9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  energy: {
    color: '#f1f5ff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 12,
    textAlign: 'center',
  },
  duration: {
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 11,
    borderWidth: 1,
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 28,
    paddingVertical: 10,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.98)',
  },
  buttonText: {
    color: '#f8fbff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
