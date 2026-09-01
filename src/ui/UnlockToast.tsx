import { StyleSheet, Text, View } from 'react-native';

interface UnlockToastProps {
  message: string;
  visible: boolean;
}

export function UnlockToast({ message, visible }: UnlockToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
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
    zIndex: 20,
  },
  toast: {
    backgroundColor: 'rgba(12, 8, 32, 0.92)',
    borderColor: 'rgba(248, 113, 113, 0.55)',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#f87171',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  text: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
