/**
 * Visual-only config for celestial bodies.
 * Game logic must never import from this module.
 */

/** Asset path for a future PNG/WebP/SVG. Null renders the placeholder shape. */
export type CelestialAssetPath = string | null;

export type PlanetPlaceholderStyle = 'rocky' | 'gasGiant' | 'iceGiant';

export interface CelestialBodyAssets {
  texture: CelestialAssetPath;
  atmosphere?: CelestialAssetPath;
  ring?: CelestialAssetPath;
}

export interface MoonVisualConfig {
  id: string;
  name: string;
  placeholderColor: string;
  placeholderGlowColor?: string;
  /** Relative moon size vs default (1 = Earth Moon scale). */
  placeholderRadiusScale?: number;
  assets: CelestialBodyAssets;
}

export interface OrbitingObjectVisualConfig {
  id: string;
  name: string;
  placeholderColor: string;
  placeholderAccentColor?: string;
  placeholderGlowColor?: string;
  asset: CelestialAssetPath;
}

export interface GasGiantBandConfig {
  color: string;
  /** Vertical offset as a fraction of planet radius (-1..1). */
  yOffset: number;
  /** Band thickness as a fraction of planet radius. */
  height: number;
}

export interface GasGiantSpotConfig {
  color: string;
  xOffset: number;
  yOffset: number;
  radiusScale: number;
}

/** One elliptical ring band around a planet (placeholder / final-asset ready). */
export interface PlanetRingBandConfig {
  color: string;
  /** Ellipse mid-radius as a multiple of planet radius (along X). */
  radiusScale: number;
  /** Stroke thickness as a fraction of planet radius. */
  strokeWidthScale: number;
  opacity: number;
}

/** Base planetary ring system — always visible when configured (e.g. Saturn). */
export interface PlanetRingSystemConfig {
  bands: PlanetRingBandConfig[];
  /** Ellipse vertical squash (ry = rx * aspect). */
  aspect: number;
}

export interface PlanetVisualConfig {
  id: string;
  name: string;
  placeholderColor: string;
  placeholderAccentColor?: string;
  placeholderAtmosphereColor?: string;
  placeholderStyle?: PlanetPlaceholderStyle;
  gasGiantBands?: GasGiantBandConfig[];
  gasGiantSpot?: GasGiantSpotConfig;
  /** Base rings (Saturn / Uranus) — separate from upgrade enhancements. */
  ringSystem?: PlanetRingSystemConfig;
  /**
   * Visual axial tilt in radians (e.g. ~π/2 for Uranus).
   * Affects placeholder planet surface, rings, and orbit presentation only.
   */
  axialTiltRadians?: number;
  /** Gameplay body size vs terrestrial default (1 = Earth). */
  gameplaySizeScale?: number;
  /** Solar system map size multiplier vs base terrestrial dot. */
  solarSystemSizeScale?: number;
  assets: {
    planet: CelestialAssetPath;
    atmosphere?: CelestialAssetPath;
    ring?: CelestialAssetPath;
  };
  moons: MoonVisualConfig[];
  satellites: OrbitingObjectVisualConfig[];
  /** Floating station / harvester placeholders. */
  stations: OrbitingObjectVisualConfig[];
  asteroids: OrbitingObjectVisualConfig[];
  comets: OrbitingObjectVisualConfig[];
}
