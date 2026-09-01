import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const JUPITER_IO: MoonVisualConfig = {
  id: 'io',
  name: 'Io',
  placeholderColor: '#eab308',
  placeholderGlowColor: 'rgba(234, 179, 8, 0.2)',
  placeholderRadiusScale: 0.82,
  assets: { texture: null },
};

export const JUPITER_EUROPA: MoonVisualConfig = {
  id: 'europa',
  name: 'Europa',
  placeholderColor: '#e7e5e4',
  placeholderGlowColor: 'rgba(231, 229, 228, 0.18)',
  placeholderRadiusScale: 0.78,
  assets: { texture: null },
};

export const JUPITER_GANYMEDE: MoonVisualConfig = {
  id: 'ganymede',
  name: 'Ganymede',
  placeholderColor: '#a8a29e',
  placeholderGlowColor: 'rgba(168, 162, 158, 0.18)',
  placeholderRadiusScale: 1.12,
  assets: { texture: null },
};

export const JUPITER_CALLISTO: MoonVisualConfig = {
  id: 'callisto',
  name: 'Callisto',
  placeholderColor: '#78716c',
  placeholderGlowColor: 'rgba(120, 113, 108, 0.18)',
  placeholderRadiusScale: 0.95,
  assets: { texture: null },
};

export const JUPITER_STORM_RESEARCH: OrbitingObjectVisualConfig = {
  id: 'storm-research',
  name: 'Storm Research',
  placeholderColor: '#fdba74',
  placeholderAccentColor: '#f97316',
  placeholderGlowColor: 'rgba(249, 115, 22, 0.28)',
  asset: null,
};

export const JUPITER_PLANET: PlanetVisualConfig = {
  id: 'jupiter',
  name: 'Jupiter',
  placeholderColor: '#c4a574',
  placeholderAccentColor: '#d97706',
  placeholderAtmosphereColor: 'rgba(251, 146, 60, 0.2)',
  placeholderStyle: 'gasGiant',
  gameplaySizeScale: 1.32,
  solarSystemSizeScale: 1.65,
  gasGiantBands: [
    { color: '#e8d4a8', yOffset: -0.62, height: 0.22 },
    { color: '#c9954a', yOffset: -0.38, height: 0.2 },
    { color: '#f5e6c8', yOffset: -0.14, height: 0.18 },
    { color: '#b45309', yOffset: 0.08, height: 0.2 },
    { color: '#e7c27d', yOffset: 0.32, height: 0.18 },
    { color: '#92400e', yOffset: 0.54, height: 0.22 },
  ],
  gasGiantSpot: {
    color: '#b91c1c',
    xOffset: 0.32,
    yOffset: 0.22,
    radiusScale: 0.22,
  },
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [JUPITER_IO, JUPITER_EUROPA, JUPITER_GANYMEDE, JUPITER_CALLISTO],
  satellites: [],
  stations: [JUPITER_STORM_RESEARCH],
  asteroids: [],
  comets: [],
};
