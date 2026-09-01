/** Increment when the on-disk save shape changes. */
export const CURRENT_SAVE_VERSION = 9;

export const SAVE_STORAGE_KEY = '@orbit/game-save-v1';

/** Autosave interval — intentionally much slower than the simulation tick. */
export const AUTOSAVE_INTERVAL_MS = 30_000;

export interface SaveStateV1 {
  energy: number;
  rotationSpeedLevel: number;
  moonUnlocked: boolean;
  moonLevel: number;
}

export interface SaveStateV2 extends SaveStateV1 {
  satelliteUnlocked: boolean;
  satelliteLevel: number;
}

export interface SaveStateV3 extends SaveStateV2 {
  unlockedPlanets: string[];
  selectedPlanetId: string;
}

/** Pre-upgrade-track per-planet progress (save v4). */
export interface SavedPlanetProgressV4 {
  rotationSpeedLevel: number;
  moonUnlocked: boolean;
  moonLevel: number;
  satelliteUnlocked: boolean;
  satelliteLevel: number;
}

/** @deprecated Alias for SavedPlanetProgressV4. */
export type SavedPlanetProgress = SavedPlanetProgressV4;

export interface SaveStateV4 {
  energy: number;
  planetStates: Record<string, SavedPlanetProgressV4>;
  unlockedPlanets: string[];
  selectedPlanetId: string;
}

export interface SavedUpgradeProgress {
  unlocked: boolean;
  level: number;
}

export interface SavedPlanetProgressV5 {
  rotationSpeedLevel: number;
  upgrades: Record<string, SavedUpgradeProgress>;
}

export interface SaveStateV5 {
  energy: number;
  planetStates: Record<string, SavedPlanetProgressV5>;
  unlockedPlanets: string[];
  selectedPlanetId: string;
}

export interface SavedPrestigeUpgradeProgress {
  level: number;
}

export interface SavedPrestigeUpgrades {
  cosmicMomentum: SavedPrestigeUpgradeProgress;
  orbitalKnowledge: SavedPrestigeUpgradeProgress;
  deepSpaceReserves: SavedPrestigeUpgradeProgress;
}

/** Current save shape — adds permanent Solar System prestige meta. */
export interface SaveStateV6 extends SaveStateV5 {
  stardust: number;
  prestigeCount: number;
  prestigeUpgrades: SavedPrestigeUpgrades;
}

export interface SavedGameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showSpinMultiplier: boolean;
  reduceEffects: boolean;
}

/** Current save shape — adds persisted player settings. */
export interface SaveStateV7 extends SaveStateV6 {
  settings: SavedGameSettings;
}

export interface SavedAchievementProgress {
  completedIds: string[];
  claimedIds: string[];
  peakSpinProductionMultiplier: number;
}

/** Save v8 — persisted achievement progress. */
export interface SaveStateV8 extends SaveStateV7 {
  achievements: SavedAchievementProgress;
}

/** Current save shape — adds display / gameplay preference settings. */
export interface SaveStateV9 extends SaveStateV8 {}

export interface VersionedSaveEnvelope {
  version: number;
  savedAt: number;
  state: unknown;
}

export interface LoadedSave {
  savedAt: number;
  state: SaveStateV9;
}

export type HydratableSaveState = SaveStateV9;
