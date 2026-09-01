import { StyleSheet, Text, View } from 'react-native';

interface SpaceEventBannerProps {
  title: string;
  subtitle: string;
  top: number;
}

export function SpaceEventBanner({ title, subtitle, top }: SpaceEventBannerProps) {
  return (
    <View pointerEvents="none" style={[styles.container, { top }]}>
      <View style={styles.banner}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
    zIndex: 14,
  },
  banner: {
    backgroundColor: 'rgba(12, 8, 32, 0.88)',
    borderColor: 'rgba(125, 211, 252, 0.32)',
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    color: '#bfdbfe',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'center',
  },
});
