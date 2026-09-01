import type { PlanetId } from '../config/planets';

export type OverlayRoute = 'prestige' | 'achievements' | 'settings';

export type AppRoute = 'solarSystem' | OverlayRoute | PlanetId;
