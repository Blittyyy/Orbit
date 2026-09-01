import type {
  MoonVisualConfig,
  OrbitingObjectVisualConfig,
  PlanetVisualConfig,
} from './types';

export const URANUS_MIRANDA: MoonVisualConfig = {
  id: 'miranda',
  name: 'Miranda',
  placeholderColor: '#cbd5e1',
  placeholderGlowColor: 'rgba(165, 243, 252, 0.2)',
  placeholderRadiusScale: 0.72,
  assets: { texture: null },
};

export const URANUS_ARIEL: MoonVisualConfig = {
  id: 'ariel',
  name: 'Ariel',
  placeholderColor: '#a5f3fc',
  placeholderGlowColor: 'rgba(103, 232, 249, 0.2)',
  placeholderRadiusScale: 0.85,
  assets: { texture: null },
};

export const URANUS_UMBRIEL: MoonVisualConfig = {
  id: 'umbriel',
  name: 'Umbriel',
  placeholderColor: '#64748b',
  placeholderGlowColor: 'rgba(100, 116, 139, 0.22)',
  placeholderRadiusScale: 0.88,
  assets: { texture: null },
};

export const URANUS_TITANIA: MoonVisualConfig = {
  id: 'titania',
  name: 'Titania',
  placeholderColor: '#99f6e4',
  placeholderGlowColor: 'rgba(45, 212, 191, 0.22)',
  placeholderRadiusScale: 1.05,
  assets: { texture: null },
};

export const URANUS_OBERON: MoonVisualConfig = {
  id: 'oberon',
  name: 'Oberon',
  placeholderColor: '#67e8f9',
  placeholderGlowColor: 'rgba(34, 211, 238, 0.2)',
  placeholderRadiusScale: 0.98,
  assets: { texture: null },
};

export const URANUS_TILT_GENERATOR: OrbitingObjectVisualConfig = {
  id: 'tilt-generator',
  name: 'Tilt Generator',
  placeholderColor: '#a5f3fc',
  placeholderAccentColor: '#22d3ee',
  placeholderGlowColor: 'rgba(34, 211, 238, 0.3)',
  asset: null,
};

/** ~98° axial tilt — dramatic sideways presentation. */
export const URANUS_AXIAL_TILT_RADIANS = (98 * Math.PI) / 180;

export const URANUS_PLANET: PlanetVisualConfig = {
  id: 'uranus',
  name: 'Uranus',
  placeholderColor: '#7dd3c7',
  placeholderAccentColor: '#5eead4',
  placeholderAtmosphereColor: 'rgba(34, 211, 238, 0.2)',
  placeholderStyle: 'iceGiant',
  axialTiltRadians: URANUS_AXIAL_TILT_RADIANS,
  gameplaySizeScale: 1.08,
  solarSystemSizeScale: 1.22,
  gasGiantBands: [
    { color: '#a8e6dc', yOffset: -0.52, height: 0.22 },
    { color: '#6ec8bc', yOffset: -0.28, height: 0.2 },
    { color: '#b8f0e8', yOffset: -0.06, height: 0.18 },
    { color: '#5bb8ae', yOffset: 0.16, height: 0.2 },
    { color: '#9fddd4', yOffset: 0.4, height: 0.22 },
  ],
  ringSystem: {
    aspect: 0.22,
    bands: [
      {
        color: '#a5f3fc',
        radiusScale: 1.48,
        strokeWidthScale: 0.035,
        opacity: 0.28,
      },
      {
        color: '#67e8f9',
        radiusScale: 1.62,
        strokeWidthScale: 0.028,
        opacity: 0.22,
      },
    ],
  },
  assets: {
    planet: null,
    atmosphere: null,
    ring: null,
  },
  moons: [
    URANUS_MIRANDA,
    URANUS_ARIEL,
    URANUS_UMBRIEL,
    URANUS_TITANIA,
    URANUS_OBERON,
  ],
  satellites: [],
  stations: [URANUS_TILT_GENERATOR],
  asteroids: [],
  comets: [],
};
