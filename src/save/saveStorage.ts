import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseSaveEnvelope, serializeGameState } from './saveCodec';
import { SAVE_STORAGE_KEY, type LoadedSave } from './saveTypes';
import type { GameState } from '../game/types';

export async function loadGameSave(): Promise<LoadedSave | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return parseSaveEnvelope(raw);
  } catch {
    return null;
  }
}

export async function writeGameSave(state: GameState): Promise<void> {
  try {
    const envelope = serializeGameState(state);
    await AsyncStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Persistence failures should never interrupt gameplay.
  }
}

export async function clearGameSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Ignore storage errors during dev reset.
  }
}
