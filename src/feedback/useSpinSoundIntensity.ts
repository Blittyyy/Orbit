import { useEffect } from 'react';

import { soundManager } from './soundManager';

/** Spin multiplier where loop intensity reaches full volume. */
const SPIN_INTENSITY_CEILING = 5;

interface UseSpinSoundIntensityOptions {
  spinRatio: number;
  isDragging: boolean;
  soundEnabled: boolean;
}

/**
 * Future-facing spin audio driver. Updates loop intensity from spin state —
 * never fires one-shot SFX per gesture frame.
 */
export function useSpinSoundIntensity({
  spinRatio,
  isDragging,
  soundEnabled,
}: UseSpinSoundIntensityOptions): void {
  useEffect(() => {
    if (!soundEnabled) {
      soundManager.updateSpinLoop({ intensity: 0, active: false }, false);
      return;
    }

    const normalized = Math.max(0, spinRatio - 1);
    const intensity = Math.min(1, normalized / (SPIN_INTENSITY_CEILING - 1));

    soundManager.updateSpinLoop(
      {
        intensity: isDragging ? intensity : 0,
        active: isDragging,
      },
      true,
    );
  }, [isDragging, soundEnabled, spinRatio]);
}
