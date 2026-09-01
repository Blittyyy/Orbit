import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const SATURN_TITAN: MoonVisualConfig = {
  id: 'titan',
  name: 'Titan',
  placeholderColor: '#d4a574',
  placeholderGlowColor: 'rgba(251, 191, 36, 0.22)',
  placeholderRadiusScale: 1.05,
  assets: { texture: null },
};

export const SATURN_RING_HARVESTER: OrbitingObjectVisualConfig = {
  id: 'ring-harvester',
  name: 'Ring Harvester',
  placeholderColor: '#fde68a',
  placeholderAccentColor: '#f59e0b',
  placeholderGlowColor: 'rgba(245, 158, 11, 0.28)',
  asset: null,
};

export const SATURN_PLANET: PlanetVisualConfig = {
  id: 'saturn',
  name: 'Saturn',
  placeholderColor: '#e8d9a8',
  placeholderAccentColor: '#d4b483',
  placeholderAtmosphereColor: 'rgba(251, 191, 36, 0.18)',
  placeholderStyle: 'gasGiant',
  gameplaySizeScale: 1.18,
  solarSystemSizeScale: 1.45,
  gasGiantBands: [
    { color: '#f5ecd0', yOffset: -0.58, height: 0.2 },
    { color: '#e2c98a', yOffset: -0.34, height: 0.18 },
    { color: '#faf3e0', yOffset: -0.12, height: 0.16 },
    { color: '#d4b06a', yOffset: 0.1, height: 0.18 },
    { color: '#f0e2b8', yOffset: 0.34, height: 0.16 },
    { color: '#c9a55a', yOffset: 0.56, height: 0.2 },
  ],
  ringSystem: {
    aspect: 0.28,
    bands: [
      {
        color: '#f5e6c4',
        radiusScale: 1.55,
        strokeWidthScale: 0.08,
        opacity: 0.55,
      },
      {
        color: '#e8d4a0',
        radiusScale: 1.72,
        strokeWidthScale: 0.12,
        opacity: 0.48,
      },
      {
        color: '#d4b878',
        radiusScale: 1.92,
        strokeWidthScale: 0.07,
        opacity: 0.4,
      },
    ],
  },
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [SATURN_TITAN],
  satellites: [],
  stations: [SATURN_RING_HARVESTER],
  asteroids: [],
  comets: [],
};
