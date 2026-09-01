import type {
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const MERCURY_SOLAR_COLLECTOR: OrbitingObjectVisualConfig = {
  id: 'solar-collector',
  name: 'Solar Collector',
  placeholderColor: '#94a3b8',
  placeholderAccentColor: '#fbbf24',
  placeholderGlowColor: 'rgba(251, 191, 36, 0.22)',
  asset: null,
};

export const MERCURY_PROBE: OrbitingObjectVisualConfig = {
  id: 'probe',
  name: 'Probe',
  placeholderColor: '#cbd5e1',
  placeholderAccentColor: '#f59e0b',
  placeholderGlowColor: 'rgba(245, 158, 11, 0.22)',
  asset: null,
};

export const MERCURY_PLANET: PlanetVisualConfig = {
  id: 'mercury',
  name: 'Mercury',
  placeholderColor: '#3f3b38',
  placeholderAccentColor: '#6b5f52',
  /** Very subtle warm rim — not a strong atmosphere glow. */
  placeholderAtmosphereColor: 'rgba(251, 191, 36, 0.08)',
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [],
  satellites: [MERCURY_PROBE],
  stations: [MERCURY_SOLAR_COLLECTOR],
  asteroids: [],
  comets: [],
};
