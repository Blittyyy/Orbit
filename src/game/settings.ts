export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  /** Live spin production multiplier near the planet. Off for normal play. */
  showSpinMultiplier: boolean;
  /** Lowers particle counts and glow; gameplay is unchanged. */
  reduceEffects: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  showSpinMultiplier: false,
  reduceEffects: false,
};

function readBoolean(record: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = record[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeGameSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_GAME_SETTINGS;
  }

  const record = raw as Record<string, unknown>;

  return {
    soundEnabled: readBoolean(
      record,
      'soundEnabled',
      DEFAULT_GAME_SETTINGS.soundEnabled,
    ),
    hapticsEnabled: readBoolean(
      record,
      'hapticsEnabled',
      DEFAULT_GAME_SETTINGS.hapticsEnabled,
    ),
    showSpinMultiplier: readBoolean(
      record,
      'showSpinMultiplier',
      DEFAULT_GAME_SETTINGS.showSpinMultiplier,
    ),
    reduceEffects: readBoolean(
      record,
      'reduceEffects',
      DEFAULT_GAME_SETTINGS.reduceEffects,
    ),
  };
}
