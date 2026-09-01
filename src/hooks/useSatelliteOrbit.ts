import { useEffect, useRef, useState } from 'react';

import type { VisibleCountThreshold } from '../config/planets';
import {
  getSatelliteOrbitPositions,
  getVisibleSatelliteCount,
  SATELLITE_ORBIT_ANGULAR_SPEED,
  SATELLITE_ORBIT_RADIUS_X_FACTOR,
  SATELLITE_ORBIT_RADIUS_Y_FACTOR,
  type SatelliteOrbitPosition,
} from '../visual/satelliteOrbit';

interface UseSatelliteOrbitOptions {
  centerX: number;
  centerY: number;
  earthRadius: number;
  satelliteLevel: number;
  enabled: boolean;
  visibleCountThresholds?: VisibleCountThreshold[];
  radiusXFactor?: number;
  radiusYFactor?: number;
  angularSpeed?: number;
}

export function useSatelliteOrbit({
  centerX,
  centerY,
  earthRadius,
  satelliteLevel,
  enabled,
  visibleCountThresholds,
  radiusXFactor = SATELLITE_ORBIT_RADIUS_X_FACTOR,
  radiusYFactor = SATELLITE_ORBIT_RADIUS_Y_FACTOR,
  angularSpeed = SATELLITE_ORBIT_ANGULAR_SPEED,
}: UseSatelliteOrbitOptions): SatelliteOrbitPosition[] {
  const angleRef = useRef(Math.PI / 5);
  const count = enabled
    ? getVisibleSatelliteCount(satelliteLevel, visibleCountThresholds)
    : 0;
  const [positions, setPositions] = useState<SatelliteOrbitPosition[]>(() =>
    getSatelliteOrbitPositions(
      centerX,
      centerY,
      earthRadius,
      angleRef.current,
      count,
      radiusXFactor,
      radiusYFactor,
    ),
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

      angleRef.current += angularSpeed * dtSeconds;
      setPositions(
        getSatelliteOrbitPositions(
          centerX,
          centerY,
          earthRadius,
          angleRef.current,
          count,
          radiusXFactor,
          radiusYFactor,
        ),
      );

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    centerX,
    centerY,
    earthRadius,
    enabled,
    count,
    radiusXFactor,
    radiusYFactor,
    angularSpeed,
  ]);

  return positions;
}
