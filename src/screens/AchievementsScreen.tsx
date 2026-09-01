import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_ORDER,
  formatAchievementReward,
  getAchievementViewModels,
  getCompletedAchievementCount,
  getTotalAchievementCount,
  type AchievementViewModel,
} from '../achievements';
import { SHOW_DEV_CONTROLS } from '../config/dev';
import { useGameSession } from '../context/GameSessionContext';
import { useFeedback } from '../feedback';
import { AchievementClaimPop } from '../ui/AchievementClaimPop';
import { DevPanel } from '../ui/DevPanel';

function AchievementCard({
  item,
  onClaim,
}: {
  item: AchievementViewModel;
  onClaim: (achievementId: string) => void;
}) {
  const { definition, status, progress } = item;
  const rewardLabel = formatAchievementReward(definition.reward);
  const isClaimable = status === 'complete';
  const isClaimed = status === 'claimed';

  return (
    <View
      style={[
        styles.card,
        isClaimable && styles.cardComplete,
        isClaimed && styles.cardClaimed,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{definition.title}</Text>
        <Text style={styles.rewardLabel}>{rewardLabel}</Text>
      </View>
      <Text style={styles.cardDescription}>{definition.description}</Text>
      {progress && status !== 'claimed' ? (
        <Text style={styles.progressText}>{progress.label}</Text>
      ) : null}
      {isClaimable ? (
        <Pressable
          onPress={() => onClaim(definition.id)}
          style={({ pressed }) => [
            styles.claimButton,
            pressed && styles.claimButtonPressed,
          ]}
        >
          <Text style={styles.claimButtonText}>CLAIM</Text>
        </Pressable>
      ) : null}
      {isClaimed ? <Text style={styles.claimedText}>CLAIMED</Text> : null}
    </View>
  );
}

export function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const {
    state,
    openSolarSystem,
    claimAchievement,
    devCompleteAllAchievements,
  } = useGameSession();
  const { feedback } = useFeedback();
  const [claimPop, setClaimPop] = useState<string | null>(null);

  const viewModels = useMemo(() => getAchievementViewModels(state), [state]);
  const completedCount = getCompletedAchievementCount(state);
  const totalCount = getTotalAchievementCount();

  const grouped = useMemo(() => {
    const groups = new Map<string, AchievementViewModel[]>();

    for (const category of ACHIEVEMENT_CATEGORY_ORDER) {
      groups.set(category, []);
    }

    for (const item of viewModels) {
      const list = groups.get(item.definition.category) ?? [];
      list.push(item);
      groups.set(item.definition.category, list);
    }

    return groups;
  }, [viewModels]);

  const handleClaim = (achievementId: string) => {
    const item = viewModels.find(
      (entry) => entry.definition.id === achievementId,
    );

    if (!item || item.status !== 'complete') {
      return;
    }

    const claimed = claimAchievement(achievementId);
    if (!claimed) {
      return;
    }

    feedback.onAchievementClaim();
    setClaimPop(formatAchievementReward(item.definition.reward));
    setTimeout(() => setClaimPop(null), 1000);
  };

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
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {completedCount} / {totalCount} completed
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {ACHIEVEMENT_CATEGORY_ORDER.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) {
            return null;
          }

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {ACHIEVEMENT_CATEGORY_LABELS[category]}
              </Text>
              {items.map((item) => (
                <AchievementCard
                  key={item.definition.id}
                  item={item}
                  onClaim={handleClaim}
                />
              ))}
            </View>
          );
        })}

        {SHOW_DEV_CONTROLS ? (
          <DevPanel variant="inline">
            <Pressable
              onPress={devCompleteAllAchievements}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>Complete Achievements</Text>
            </Pressable>
          </DevPanel>
        ) : null}
      </ScrollView>

      <AchievementClaimPop label={claimPop ?? ''} visible={claimPop !== null} />
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
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardComplete: {
    borderColor: 'rgba(253, 224, 71, 0.45)',
  },
  cardClaimed: {
    borderColor: 'rgba(134, 239, 172, 0.28)',
    opacity: 0.82,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  rewardLabel: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  progressText: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  claimButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    minWidth: 108,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  claimButtonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.98)',
  },
  claimButtonText: {
    color: '#f8fbff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  claimedText: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
  },
  devButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.88)',
    borderColor: 'rgba(252, 165, 165, 0.45)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  devButtonText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '700',
  },
});
