import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const MARS_PHOBOS: MoonVisualConfig = {
  id: 'phobos',
  name: 'Phobos',
  placeholderColor: '#d6a07a',
  placeholderGlowColor: 'rgba(251, 146, 60, 0.22)',
  assets: {
    texture: null,
  },
};

export const MARS_ORBITER: OrbitingObjectVisualConfig = {
  id: 'mars-orbiter',
  name: 'Mars Orbiter',
  placeholderColor: '#e2e8f0',
  placeholderAccentColor: '#fb923c',
  placeholderGlowColor: 'rgba(251, 146, 60, 0.28)',
  asset: null,
};

export const MARS_PLANET: PlanetVisualConfig = {
  id: 'mars',
  name: 'Mars',
  placeholderColor: '#c1440e',
  placeholderAccentColor: '#e85d4c',
  placeholderAtmosphereColor: 'rgba(248, 113, 113, 0.22)',
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [MARS_PHOBOS],
  satellites: [MARS_ORBITER],
  stations: [],
  asteroids: [],
  comets: [],
};
