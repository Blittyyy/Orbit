export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
};

export function normalizeGameSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_GAME_SETTINGS;
  }

  const record = raw as Record<string, unknown>;

  return {
    soundEnabled:
      typeof record.soundEnabled === 'boolean'
        ? record.soundEnabled
        : DEFAULT_GAME_SETTINGS.soundEnabled,
    hapticsEnabled:
      typeof record.hapticsEnabled === 'boolean'
        ? record.hapticsEnabled
        : DEFAULT_GAME_SETTINGS.hapticsEnabled,
  };
}
