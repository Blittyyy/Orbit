import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const NEPTUNE_TRITON: MoonVisualConfig = {
  id: 'triton',
  name: 'Triton',
  placeholderColor: '#e2e8f0',
  placeholderGlowColor: 'rgba(186, 230, 253, 0.28)',
  placeholderRadiusScale: 1.08,
  assets: { texture: null },
};

export const NEPTUNE_STORM_HARVESTER: OrbitingObjectVisualConfig = {
  id: 'storm-harvester',
  name: 'Storm Harvester',
  placeholderColor: '#60a5fa',
  placeholderAccentColor: '#2563eb',
  placeholderGlowColor: 'rgba(37, 99, 235, 0.32)',
  asset: null,
};

export const NEPTUNE_PLANET: PlanetVisualConfig = {
  id: 'neptune',
  name: 'Neptune',
  placeholderColor: '#2563eb',
  placeholderAccentColor: '#1d4ed8',
  placeholderAtmosphereColor: 'rgba(59, 130, 246, 0.28)',
  placeholderStyle: 'iceGiant',
  gameplaySizeScale: 1.1,
  solarSystemSizeScale: 1.2,
  gasGiantBands: [
    { color: '#3b82f6', yOffset: -0.55, height: 0.2 },
    { color: '#1e40af', yOffset: -0.32, height: 0.18 },
    { color: '#60a5fa', yOffset: -0.1, height: 0.16 },
    { color: '#1e3a8a', yOffset: 0.12, height: 0.18 },
    { color: '#3b82f6', yOffset: 0.34, height: 0.16 },
    { color: '#172554', yOffset: 0.55, height: 0.2 },
  ],
  gasGiantSpot: {
    color: '#0f172a',
    xOffset: 0.28,
    yOffset: 0.18,
    radiusScale: 0.2,
  },
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [NEPTUNE_TRITON],
  satellites: [],
  stations: [NEPTUNE_STORM_HARVESTER],
  asteroids: [],
  comets: [],
};
