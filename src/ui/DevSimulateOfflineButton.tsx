import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';

interface DevSimulateOfflineButtonProps {
  onPress: () => void;
}

export function DevSimulateOfflineButton({ onPress }: DevSimulateOfflineButtonProps) {
  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>DEV +1 Hour Offline</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 12,
    position: 'absolute',
    top: 132,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(30, 58, 138, 0.88)',
    borderColor: 'rgba(125, 211, 252, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
});
