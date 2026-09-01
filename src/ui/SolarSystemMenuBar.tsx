import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGameSession } from '../context/GameSessionContext';
import { useFeedback } from '../feedback';

export function SolarSystemMenuBar() {
  const insets = useSafeAreaInsets();
  const { openAchievements, openPrestige, openSettings } = useGameSession();
  const { feedback } = useFeedback();

  return (
    <View style={[styles.container, { top: insets.top + 36 }]} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Achievements"
        onPress={() => {
          feedback.onUiButton();
          openAchievements();
        }}
        style={[styles.button, styles.achievements]}
      >
        <Text style={[styles.icon, styles.achievementsIcon]}>★</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Prestige"
        onPress={() => {
          feedback.onUiButton();
          openPrestige();
        }}
        style={[styles.button, styles.prestige]}
      >
        <Text style={[styles.icon, styles.prestigeIcon]}>✦</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Settings"
        onPress={() => {
          feedback.onUiButton();
          openSettings();
        }}
        style={styles.button}
      >
        <Text style={styles.icon}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 12,
    zIndex: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 32, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.38)',
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  achievements: {
    borderColor: 'rgba(253, 224, 71, 0.42)',
  },
  prestige: {
    borderColor: 'rgba(196, 181, 253, 0.45)',
  },
  icon: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  achievementsIcon: {
    color: '#fde68a',
  },
  prestigeIcon: {
    color: '#ddd6fe',
  },
});
