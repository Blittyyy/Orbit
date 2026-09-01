import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHOW_DEV_CONTROLS } from '../config/dev';

interface DevLevelUpSatelliteButtonProps {
  onPress: () => void;
}

export function DevLevelUpSatelliteButton({ onPress }: DevLevelUpSatelliteButtonProps) {
  if (!__DEV__ || !SHOW_DEV_CONTROLS) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>DEV +1 Satellite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 12,
    position: 'absolute',
    top: 172,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(8, 47, 73, 0.9)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#bae6fd',
    fontSize: 12,
    fontWeight: '600',
  },
});
