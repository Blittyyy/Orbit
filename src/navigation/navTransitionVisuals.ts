import type { PlanetId } from '../config/planets';

import type { NavTransitionState } from './navTransition';

export const PLANET_OUT_SCALE = 0.72;
export const PLANET_IN_SCALE = 1.16;
export const SOLAR_OUT_SCALE = 1.04;
export const SOLAR_IN_SCALE = 0.9;

export interface PlanetTransitionVisuals {
  planetScale: number;
  sceneOpacity: number;
  chromeOpacity: number;
  hudOpacity: number;
}

export interface SolarTransitionVisuals {
  mapScale: number;
  mapOpacity: number;
  chromeOpacity: number;
  panelOpacity: number;
}

const PLANET_VISIBLE: PlanetTransitionVisuals = {
  planetScale: 1,
  sceneOpacity: 1,
  chromeOpacity: 1,
  hudOpacity: 1,
};

const SOLAR_VISIBLE: SolarTransitionVisuals = {
  mapScale: 1,
  mapOpacity: 1,
  chromeOpacity: 1,
  panelOpacity: 1,
};

export function isLeavingPlanetLayer(
  navTransition: NavTransitionState,
  planetId: PlanetId,
  route: string,
  leavingRoute: string | null,
): boolean {
  return (
    leavingRoute === planetId &&
    route !== planetId &&
    navTransition.kind === 'planet-to-solar' &&
    navTransition.focusPlanetId === planetId
  );
}

export function isLeavingSolarLayer(
  navTransition: NavTransitionState,
  route: string,
  leavingRoute: string | null,
): boolean {
  return (
    leavingRoute === 'solarSystem' &&
    route !== 'solarSystem' &&
    navTransition.kind === 'solar-to-planet'
  );
}

export function getPlanetTransitionVisuals(
  navTransition: NavTransitionState,
  planetId: PlanetId,
  options: {
    route: string;
    leavingRoute: string | null;
  },
): PlanetTransitionVisuals {
  const { phase, kind, focusPlanetId } = navTransition;
  const isFocus = focusPlanetId === planetId;
  const isLeaving = isLeavingPlanetLayer(
    navTransition,
    planetId,
    options.route,
    options.leavingRoute,
  );

  if (phase === 'in' && kind === 'solar-to-planet' && isFocus) {
    return {
      planetScale: PLANET_IN_SCALE,
      sceneOpacity: 0,
      chromeOpacity: 0,
      hudOpacity: 0,
    };
  }

  if (isLeaving) {
    return {
      planetScale: PLANET_OUT_SCALE,
      sceneOpacity: 0,
      chromeOpacity: 0,
      hudOpacity: 0,
    };
  }

  return PLANET_VISIBLE;
}

export function getSolarTransitionVisuals(
  navTransition: NavTransitionState,
  options: {
    route: string;
    leavingRoute: string | null;
  },
): SolarTransitionVisuals {
  const { phase, kind } = navTransition;
  const isLeaving = isLeavingSolarLayer(
    navTransition,
    options.route,
    options.leavingRoute,
  );

  if (phase === 'in' && kind === 'planet-to-solar') {
    return {
      mapScale: SOLAR_IN_SCALE,
      mapOpacity: 0,
      chromeOpacity: 0,
      panelOpacity: 0,
    };
  }

  if (isLeaving) {
    return {
      mapScale: SOLAR_OUT_SCALE,
      mapOpacity: 0,
      chromeOpacity: 0,
      panelOpacity: 0,
    };
  }

  return SOLAR_VISIBLE;
}
