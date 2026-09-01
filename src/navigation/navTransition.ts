import type { PlanetId } from '../config/planets';
import type { AppRoute } from './types';

export const NAV_TRANSITION_OUT_MS = 200;
export const NAV_TRANSITION_IN_MS = 280;

export type NavTransitionKind = 'planet-to-solar' | 'solar-to-planet' | 'default';
export type NavTransitionPhase = 'idle' | 'out' | 'in';

export interface NavTransitionState {
  phase: NavTransitionPhase;
  kind: NavTransitionKind | null;
  focusPlanetId: PlanetId | null;
}

export const IDLE_NAV_TRANSITION: NavTransitionState = {
  phase: 'idle',
  kind: null,
  focusPlanetId: null,
};

export function isPlanetRoute(route: AppRoute): route is PlanetId {
  return (
    route !== 'solarSystem' &&
    route !== 'prestige' &&
    route !== 'achievements'
  );
}
