import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const VENUS_ATMOSPHERIC_HARVESTER: OrbitingObjectVisualConfig = {
  id: 'atmospheric-harvester',
  name: 'Atmospheric Harvester',
  placeholderColor: '#fbbf24',
  placeholderAccentColor: '#f59e0b',
  placeholderGlowColor: 'rgba(251, 191, 36, 0.28)',
  asset: null,
};

export const VENUS_CLOUD_STATION: OrbitingObjectVisualConfig = {
  id: 'cloud-station',
  name: 'Cloud Station',
  placeholderColor: '#fde68a',
  placeholderAccentColor: '#fcd34d',
  placeholderGlowColor: 'rgba(252, 211, 77, 0.3)',
  asset: null,
};

export const VENUS_PLANET: PlanetVisualConfig = {
  id: 'venus',
  name: 'Venus',
  placeholderColor: '#e8a838',
  placeholderAccentColor: '#f5c542',
  placeholderAtmosphereColor: 'rgba(251, 191, 36, 0.28)',
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [],
  satellites: [VENUS_CLOUD_STATION],
  stations: [VENUS_ATMOSPHERIC_HARVESTER],
  asteroids: [],
  comets: [],
};
