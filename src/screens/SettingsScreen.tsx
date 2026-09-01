import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GAME_ABOUT_BLURB, GAME_VERSION } from '../config/appInfo';
import { useGameSession } from '../context/GameSessionContext';
import { useFeedback } from '../feedback';
import { CURRENT_SAVE_VERSION } from '../save';
import { SettingsToggleRow } from '../ui/SettingsToggleRow';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, openSolarSystem, updateSettings } = useGameSession();
  const { feedback } = useFeedback();
  const settings = state.settings;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => {
            feedback.onUiButton();
            openSolarSystem();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Solar System</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <View style={styles.card}>
            <SettingsToggleRow
              label="Sound Effects"
              value={settings.soundEnabled}
              onValueChange={(soundEnabled) => {
                feedback.onUiButton();
                updateSettings({ soundEnabled });
              }}
            />
            <View style={styles.divider} />
            <SettingsToggleRow
              label="Haptics"
              value={settings.hapticsEnabled}
              onValueChange={(hapticsEnabled) => {
                updateSettings({ hapticsEnabled });
                if (hapticsEnabled) {
                  feedback.onUiButton();
                }
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GAMEPLAY</Text>
          <View style={styles.card}>
            <SettingsToggleRow
              label="Show Spin Multiplier"
              description="Display the live spin bonus next to the planet."
              value={settings.showSpinMultiplier}
              onValueChange={(showSpinMultiplier) => {
                feedback.onUiButton();
                updateSettings({ showSpinMultiplier });
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISPLAY</Text>
          <View style={styles.card}>
            <SettingsToggleRow
              label="Reduce Effects"
              description="Lower particle counts and glow. Gameplay is unchanged."
              value={settings.reduceEffects}
              onValueChange={(reduceEffects) => {
                feedback.onUiButton();
                updateSettings({ reduceEffects });
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <Text style={styles.aboutLine}>Game version {GAME_VERSION}</Text>
            <Text style={styles.aboutLine}>Save version {CURRENT_SAVE_VERSION}</Text>
            <Text style={styles.aboutBlurb}>{GAME_ABOUT_BLURB}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#06061a',
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: '#bfdbfe',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(12, 8, 32, 0.92)',
    borderColor: 'rgba(125, 211, 252, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  divider: {
    backgroundColor: 'rgba(148, 163, 184, 0.16)',
    height: StyleSheet.hairlineWidth,
  },
  aboutLine: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  aboutBlurb: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    marginTop: 10,
  },
});
