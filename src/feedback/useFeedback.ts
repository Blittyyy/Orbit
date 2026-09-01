import { useMemo } from 'react';

import { useGameSession } from '../context/GameSessionContext';
import { createFeedbackController } from './feedbackController';
import type { GameSettings } from './types';

export function useFeedback() {
  const { state, updateSettings } = useGameSession();
  const settings = state.settings;

  const feedback = useMemo(
    () => createFeedbackController(settings),
    [settings],
  );

  const setSoundEnabled = (soundEnabled: boolean) => {
    updateSettings({ soundEnabled });
  };

  const setHapticsEnabled = (hapticsEnabled: boolean) => {
    updateSettings({ hapticsEnabled });
  };

  const setSettings = (next: Partial<GameSettings>) => {
    updateSettings(next);
  };

  return {
    settings,
    feedback,
    setSoundEnabled,
    setHapticsEnabled,
    setSettings,
  };
}
