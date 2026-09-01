export type SoundEvent =
  | 'upgradePurchase'
  | 'upgradeUnlocked'
  | 'planetUnlocked'
  | 'achievementUnlocked'
  | 'eventReward'
  | 'enterPlanet'
  | 'manualSpinAcceleration'
  | 'offlineCollect'
  | 'prestige'
  | 'uiButton';

import type { GameSettings } from '../game/settings';
import { DEFAULT_GAME_SETTINGS } from '../game/settings';

export type { GameSettings };
export { DEFAULT_GAME_SETTINGS };

export interface SpinLoopState {
  intensity: number;
  active: boolean;
}
