import { Pressable, StyleSheet, View } from 'react-native';

import type { MeteorRuntimeState } from '../../events';
import { useReduceEffects } from '../../visual/EffectsSettingsContext';

interface MeteorShowerVisualProps {
  meteors: MeteorRuntimeState[];
  now: number;
  visible: boolean;
  onTapMeteor: (meteorId: string) => void;
}

function getMeteorProgress(meteor: MeteorRuntimeState, now: number): number {
  return Math.max(0, Math.min(1, (now - meteor.spawnAt) / meteor.durationMs));
}

export function MeteorShowerVisual({
  meteors,
  now,
  visible,
  onTapMeteor,
}: MeteorShowerVisualProps) {
  const reduceEffects = useReduceEffects();

  if (!visible) {
    return null;
  }

  return (
    <>
      {meteors.map((meteor) => {
        const progress = getMeteorProgress(meteor, now);
        if (progress >= 1) {
          return null;
        }

        const x = meteor.startX + (meteor.endX - meteor.startX) * progress;
        const y = meteor.startY + (meteor.endY - meteor.startY) * progress;
        const angle =
          (Math.atan2(
            meteor.endY - meteor.startY,
            meteor.endX - meteor.startX,
          ) *
            180) /
          Math.PI;
        const hitSize = 44;

        return (
          <Pressable
            key={meteor.id}
            disabled={meteor.tapped}
            onPress={() => onTapMeteor(meteor.id)}
            style={[
              styles.hitTarget,
              {
                left: x - hitSize / 2,
                top: y - hitSize / 2,
                width: hitSize,
                height: hitSize,
                opacity: meteor.tapped ? 0.25 : 1,
              },
            ]}
          >
            <View style={[styles.meteor, { transform: [{ rotate: `${angle}deg` }] }]}>
              <View style={styles.head} />
              <View style={[styles.tail, reduceEffects && styles.tailReduced]} />
            </View>
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  hitTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 11,
  },
  meteor: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  head: {
    backgroundColor: '#fdba74',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  tail: {
    backgroundColor: 'rgba(251, 191, 36, 0.8)',
    borderRadius: 999,
    height: 2,
    marginLeft: -1,
    width: 24,
  },
  tailReduced: {
    backgroundColor: 'rgba(251, 191, 36, 0.4)',
    width: 12,
  },
});
