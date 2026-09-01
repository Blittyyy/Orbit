import { StyleSheet, Text, View } from 'react-native';

interface AchievementToastProps {
  title: string;
  visible: boolean;
}

export function AchievementToast({ title, visible }: AchievementToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.eyebrow}>ACHIEVEMENT UNLOCKED</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 108,
    zIndex: 25,
  },
  toast: {
    backgroundColor: 'rgba(12, 8, 32, 0.94)',
    borderColor: 'rgba(253, 224, 71, 0.55)',
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 320,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#facc15',
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  eyebrow: {
    color: '#fde68a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  title: {
    color: '#fff7ed',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
});
