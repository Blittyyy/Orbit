import { triggerHaptic, triggerSelectionHaptic } from './haptics';
import type { GameSettings } from '../game/settings';
import { soundManager } from './soundManager';

export interface FeedbackController {
  onUpgradePurchase: () => void;
  onUpgradeTrackUnlock: () => void;
  onPlanetUnlock: () => void;
  onAchievementUnlock: () => void;
  onAchievementClaim: () => void;
  onEventReward: () => void;
  onEnterPlanet: () => void;
  onPrestige: () => void;
  onOfflineCollect: () => void;
  onManualSpinAcceleration: () => void;
  onUiButton: () => void;
}

export function createFeedbackController(
  settings: GameSettings,
): FeedbackController {
  const { soundEnabled, hapticsEnabled } = settings;

  return {
    onUpgradePurchase: () => {
      void triggerHaptic('light', hapticsEnabled);
      soundManager.play('upgradePurchase', soundEnabled);
    },
    onUpgradeTrackUnlock: () => {
      void triggerHaptic('medium', hapticsEnabled);
      soundManager.play('upgradeUnlocked', soundEnabled);
    },
    onPlanetUnlock: () => {
      void triggerHaptic('medium', hapticsEnabled);
      soundManager.play('planetUnlocked', soundEnabled);
    },
    onAchievementUnlock: () => {
      void triggerHaptic('medium', hapticsEnabled);
      soundManager.play('achievementUnlocked', soundEnabled);
    },
    onAchievementClaim: () => {
      void triggerHaptic('light', hapticsEnabled);
      soundManager.play('upgradePurchase', soundEnabled);
    },
    onEventReward: () => {
      void triggerHaptic('medium', hapticsEnabled);
      soundManager.play('eventReward', soundEnabled);
    },
    onEnterPlanet: () => {
      void triggerHaptic('light', hapticsEnabled);
      soundManager.play('enterPlanet', soundEnabled);
    },
    onPrestige: () => {
      void triggerHaptic('success', hapticsEnabled);
      soundManager.play('prestige', soundEnabled);
    },
    onOfflineCollect: () => {
      void triggerHaptic('success', hapticsEnabled);
      soundManager.play('offlineCollect', soundEnabled);
    },
    onManualSpinAcceleration: () => {
      soundManager.play('manualSpinAcceleration', soundEnabled);
    },
    onUiButton: () => {
      void triggerSelectionHaptic(hapticsEnabled);
      soundManager.play('uiButton', soundEnabled);
    },
  };
}
