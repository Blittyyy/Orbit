import { StyleSheet, Text, View } from 'react-native';

interface PlanetLabelProps {
  top: number;
  name: string;
}

export function PlanetLabel({ top, name }: PlanetLabelProps) {
  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <Text style={styles.text}>{name.toUpperCase()}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  text: {
    color: 'rgba(191, 219, 254, 0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  underline: {
    backgroundColor: 'rgba(125, 211, 252, 0.35)',
    borderRadius: 999,
    height: 2,
    marginTop: 4,
    width: 24,
  },
});
