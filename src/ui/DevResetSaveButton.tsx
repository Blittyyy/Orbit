import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';

interface DevResetSaveButtonProps {
  onPress: () => void;
}

export function DevResetSaveButton({ onPress }: DevResetSaveButtonProps) {
  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>DEV Reset Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 12,
    position: 'absolute',
    top: 92,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(76, 29, 149, 0.85)',
    borderColor: 'rgba(196, 181, 253, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '600',
  },
});
