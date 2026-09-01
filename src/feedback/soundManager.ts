import type { SoundEvent, SpinLoopState } from './types';

export type SoundAssetMap = Partial<Record<SoundEvent, string>>;

/**
 * Lightweight sound event bus. Playback is a no-op until assets are registered.
 * Gameplay code should call `play()` / `updateSpinLoop()` — not load audio directly.
 */
export class SoundManager {
  private assets: SoundAssetMap = {};
  private spinLoop: SpinLoopState = { intensity: 0, active: false };

  registerAssets(assets: SoundAssetMap): void {
    this.assets = { ...this.assets, ...assets };
  }

  play(event: SoundEvent, enabled: boolean): void {
    if (!enabled) {
      return;
    }

    const asset = this.assets[event];
    if (!asset) {
      return;
    }

    // Future: load/play via expo-av or similar without touching gameplay callers.
    void asset;
  }

  updateSpinLoop(next: SpinLoopState, enabled: boolean): void {
    if (!enabled) {
      if (this.spinLoop.active || this.spinLoop.intensity > 0) {
        this.spinLoop = { intensity: 0, active: false };
      }
      return;
    }

    this.spinLoop = {
      intensity: Math.max(0, Math.min(1, next.intensity)),
      active: next.active,
    };

    const spinAsset = this.assets.manualSpinAcceleration;
    if (!spinAsset) {
      return;
    }

    // Future: drive loop gain / crossfade from this.spinLoop.
    void spinAsset;
  }

  getSpinLoopState(): SpinLoopState {
    return this.spinLoop;
  }
}

export const soundManager = new SoundManager();
