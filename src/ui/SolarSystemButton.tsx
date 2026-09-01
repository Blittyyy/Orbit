import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SolarSystemButtonProps {
  onPress: () => void;
}

export function SolarSystemButton({ onPress }: SolarSystemButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.text}>Solar System</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(12, 8, 32, 0.82)',
    borderColor: 'rgba(125, 211, 252, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  text: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
