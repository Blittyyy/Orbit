import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const EARTH_MOON: MoonVisualConfig = {
  id: 'moon',
  name: 'Moon',
  placeholderColor: '#cbd5e1',
  placeholderGlowColor: 'rgba(191, 219, 254, 0.2)',
  assets: {
    texture: null,
    // texture: 'assets/celestial/moon.webp',
  },
};

export const EARTH_SATELLITE: OrbitingObjectVisualConfig = {
  id: 'satellite',
  name: 'Satellite',
  placeholderColor: '#cbd5e1',
  placeholderAccentColor: '#38bdf8',
  placeholderGlowColor: 'rgba(125, 211, 252, 0.28)',
  asset: null,
  // asset: 'assets/celestial/satellite.webp',
};

export const EARTH_PLANET: PlanetVisualConfig = {
  id: 'earth',
  name: 'Earth',
  placeholderColor: '#1565c0',
  placeholderAccentColor: '#43a047',
  placeholderAtmosphereColor: 'rgba(59, 130, 246, 0.2)',
  assets: {
    planet: null,
    // planet: 'assets/celestial/earth.webp',
    atmosphere: null,
    // atmosphere: 'assets/celestial/earth-atmosphere.webp',
    ring: null,
  },
  moons: [EARTH_MOON],
  satellites: [EARTH_SATELLITE],
  stations: [],
  asteroids: [],
  comets: [],
};
