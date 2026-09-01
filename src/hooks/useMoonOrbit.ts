import { useEffect, useRef, useState } from 'react';

import type { VisibleCountThreshold } from '../config/planets';
import { getVisibleObjectCount } from '../config/planets';
import {
  getMoonOrbitPositions,
  MOON_ORBIT_ANGULAR_SPEED,
  type MoonOrbitPosition,
} from '../visual/moonOrbit';

interface UseMoonOrbitOptions {
  centerX: number;
  centerY: number;
  earthRadius: number;
  enabled: boolean;
  /** Moon upgrade level — used with thresholds for multi-moon planets. */
  moonLevel?: number;
  visibleCountThresholds?: VisibleCountThreshold[];
}

export function useMoonOrbit({
  centerX,
  centerY,
  earthRadius,
  enabled,
  moonLevel = 1,
  visibleCountThresholds,
}: UseMoonOrbitOptions): MoonOrbitPosition[] {
  const angleRef = useRef(0);
  const count = enabled
    ? getVisibleObjectCount(Math.max(1, moonLevel), visibleCountThresholds)
    : 0;
  const [positions, setPositions] = useState<MoonOrbitPosition[]>(() =>
    getMoonOrbitPositions(centerX, centerY, earthRadius, 0, count),
  );

  useEffect(() => {
    if (!enabled || count <= 0) {
      setPositions([]);
      return;
    }

    let frameId = 0;
    let lastTimestamp = performance.now();

    const tick = (timestamp: number) => {
      const dtSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      angleRef.current += MOON_ORBIT_ANGULAR_SPEED * dtSeconds;
      setPositions(
        getMoonOrbitPositions(
          centerX,
          centerY,
          earthRadius,
          angleRef.current,
          count,
        ),
      );

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [centerX, centerY, earthRadius, enabled, count]);

  return positions;
}
