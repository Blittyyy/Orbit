import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';

interface DevLevelUpButtonProps {
  moonUnlocked: boolean;
  onPress: () => void;
}

export function DevLevelUpButton({ moonUnlocked, onPress }: DevLevelUpButtonProps) {
  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  const label = moonUnlocked ? 'DEV +1 Moon' : 'DEV +1 Rotation';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 12,
    position: 'absolute',
    top: 52,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(127, 29, 29, 0.85)',
    borderColor: 'rgba(248, 113, 113, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '600',
  },
});
