import type { PlanetId } from '../config/planets';
import type { AppRoute, OverlayRoute } from './types';

export const NAV_TRANSITION_OUT_MS = 200;
export const NAV_TRANSITION_IN_MS = 280;

export type NavTransitionKind =
  | 'planet-to-solar'
  | 'solar-to-planet'
  | 'solar-to-overlay'
  | 'overlay-to-solar'
  | 'default';
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

const OVERLAY_ROUTES: OverlayRoute[] = ['prestige', 'achievements', 'settings'];

export function isOverlayRoute(route: AppRoute): route is OverlayRoute {
  return OVERLAY_ROUTES.includes(route as OverlayRoute);
}

export function isPlanetRoute(route: AppRoute): route is PlanetId {
  return route !== 'solarSystem' && !isOverlayRoute(route);
}
