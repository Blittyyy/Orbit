import { useEffect, useRef, useState } from 'react';

import {
  getSolarOrbitPosition,
  SOLAR_EARTH_ANGULAR_SPEED,
  SOLAR_JUPITER_ANGULAR_SPEED,
  SOLAR_MARS_ANGULAR_SPEED,
  SOLAR_MERCURY_ANGULAR_SPEED,
  SOLAR_NEPTUNE_ANGULAR_SPEED,
  SOLAR_SATURN_ANGULAR_SPEED,
  SOLAR_URANUS_ANGULAR_SPEED,
  SOLAR_VENUS_ANGULAR_SPEED,
  type SolarOrbitPosition,
} from '../visual/solarSystemOrbit';

interface UseSolarSystemOrbitOptions {
  centerX: number;
  centerY: number;
  mercuryOrbitRadiusX: number;
  mercuryOrbitRadiusY: number;
  venusOrbitRadiusX: number;
  venusOrbitRadiusY: number;
  earthOrbitRadiusX: number;
  earthOrbitRadiusY: number;
  marsOrbitRadiusX: number;
  marsOrbitRadiusY: number;
  jupiterOrbitRadiusX: number;
  jupiterOrbitRadiusY: number;
  saturnOrbitRadiusX: number;
  saturnOrbitRadiusY: number;
  uranusOrbitRadiusX: number;
  uranusOrbitRadiusY: number;
  neptuneOrbitRadiusX: number;
  neptuneOrbitRadiusY: number;
}

export interface SolarSystemOrbitState {
  mercury: SolarOrbitPosition;
  venus: SolarOrbitPosition;
  earth: SolarOrbitPosition;
  mars: SolarOrbitPosition;
  jupiter: SolarOrbitPosition;
  saturn: SolarOrbitPosition;
  uranus: SolarOrbitPosition;
  neptune: SolarOrbitPosition;
}

export function useSolarSystemOrbit({
  centerX,
  centerY,
  mercuryOrbitRadiusX,
  mercuryOrbitRadiusY,
  venusOrbitRadiusX,
  venusOrbitRadiusY,
  earthOrbitRadiusX,
  earthOrbitRadiusY,
  marsOrbitRadiusX,
  marsOrbitRadiusY,
  jupiterOrbitRadiusX,
  jupiterOrbitRadiusY,
  saturnOrbitRadiusX,
  saturnOrbitRadiusY,
  uranusOrbitRadiusX,
  uranusOrbitRadiusY,
  neptuneOrbitRadiusX,
  neptuneOrbitRadiusY,
}: UseSolarSystemOrbitOptions): SolarSystemOrbitState {
  const mercuryAngleRef = useRef(Math.PI * 0.2);
  const venusAngleRef = useRef(Math.PI * 1.1);
  const earthAngleRef = useRef(0);
  const marsAngleRef = useRef(Math.PI * 0.65);
  const jupiterAngleRef = useRef(Math.PI * 1.4);
  const saturnAngleRef = useRef(Math.PI * 0.35);
  const uranusAngleRef = useRef(Math.PI * 1.75);
  const neptuneAngleRef = useRef(Math.PI * 0.9);
  const [positions, setPositions] = useState<SolarSystemOrbitState>(() => ({
    mercury: getSolarOrbitPosition(
      centerX,
      centerY,
      mercuryOrbitRadiusX,
      mercuryOrbitRadiusY,
      mercuryAngleRef.current,
    ),
    venus: getSolarOrbitPosition(
      centerX,
      centerY,
      venusOrbitRadiusX,
      venusOrbitRadiusY,
      venusAngleRef.current,
    ),
    earth: getSolarOrbitPosition(
      centerX,
      centerY,
      earthOrbitRadiusX,
      earthOrbitRadiusY,
      0,
    ),
    mars: getSolarOrbitPosition(
      centerX,
      centerY,
      marsOrbitRadiusX,
      marsOrbitRadiusY,
      marsAngleRef.current,
    ),
    jupiter: getSolarOrbitPosition(
      centerX,
      centerY,
      jupiterOrbitRadiusX,
      jupiterOrbitRadiusY,
      jupiterAngleRef.current,
    ),
    saturn: getSolarOrbitPosition(
      centerX,
      centerY,
      saturnOrbitRadiusX,
      saturnOrbitRadiusY,
      saturnAngleRef.current,
    ),
    uranus: getSolarOrbitPosition(
      centerX,
      centerY,
      uranusOrbitRadiusX,
      uranusOrbitRadiusY,
      uranusAngleRef.current,
    ),
    neptune: getSolarOrbitPosition(
      centerX,
      centerY,
      neptuneOrbitRadiusX,
      neptuneOrbitRadiusY,
      neptuneAngleRef.current,
    ),
  }));

  useEffect(() => {
    let frameId = 0;
    let lastTimestamp = performance.now();

    const tick = (timestamp: number) => {
      const dtSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      mercuryAngleRef.current += SOLAR_MERCURY_ANGULAR_SPEED * dtSeconds;
      venusAngleRef.current += SOLAR_VENUS_ANGULAR_SPEED * dtSeconds;
      earthAngleRef.current += SOLAR_EARTH_ANGULAR_SPEED * dtSeconds;
      marsAngleRef.current += SOLAR_MARS_ANGULAR_SPEED * dtSeconds;
      jupiterAngleRef.current += SOLAR_JUPITER_ANGULAR_SPEED * dtSeconds;
      saturnAngleRef.current += SOLAR_SATURN_ANGULAR_SPEED * dtSeconds;
      uranusAngleRef.current += SOLAR_URANUS_ANGULAR_SPEED * dtSeconds;
      neptuneAngleRef.current += SOLAR_NEPTUNE_ANGULAR_SPEED * dtSeconds;

      setPositions({
        mercury: getSolarOrbitPosition(
          centerX,
          centerY,
          mercuryOrbitRadiusX,
          mercuryOrbitRadiusY,
          mercuryAngleRef.current,
        ),
        venus: getSolarOrbitPosition(
          centerX,
          centerY,
          venusOrbitRadiusX,
          venusOrbitRadiusY,
          venusAngleRef.current,
        ),
        earth: getSolarOrbitPosition(
          centerX,
          centerY,
          earthOrbitRadiusX,
          earthOrbitRadiusY,
          earthAngleRef.current,
        ),
        mars: getSolarOrbitPosition(
          centerX,
          centerY,
          marsOrbitRadiusX,
          marsOrbitRadiusY,
          marsAngleRef.current,
        ),
        jupiter: getSolarOrbitPosition(
          centerX,
          centerY,
          jupiterOrbitRadiusX,
          jupiterOrbitRadiusY,
          jupiterAngleRef.current,
        ),
        saturn: getSolarOrbitPosition(
          centerX,
          centerY,
          saturnOrbitRadiusX,
          saturnOrbitRadiusY,
          saturnAngleRef.current,
        ),
        uranus: getSolarOrbitPosition(
          centerX,
          centerY,
          uranusOrbitRadiusX,
          uranusOrbitRadiusY,
          uranusAngleRef.current,
        ),
        neptune: getSolarOrbitPosition(
          centerX,
          centerY,
          neptuneOrbitRadiusX,
          neptuneOrbitRadiusY,
          neptuneAngleRef.current,
        ),
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    centerX,
    centerY,
    mercuryOrbitRadiusX,
    mercuryOrbitRadiusY,
    venusOrbitRadiusX,
    venusOrbitRadiusY,
    earthOrbitRadiusX,
    earthOrbitRadiusY,
    marsOrbitRadiusX,
    marsOrbitRadiusY,
    jupiterOrbitRadiusX,
    jupiterOrbitRadiusY,
    saturnOrbitRadiusX,
    saturnOrbitRadiusY,
    uranusOrbitRadiusX,
    uranusOrbitRadiusY,
    neptuneOrbitRadiusX,
    neptuneOrbitRadiusY,
  ]);

  return positions;
}
