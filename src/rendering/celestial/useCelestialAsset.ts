import type { CelestialAssetPath } from '../../config/celestial';

/**
 * Loads a celestial texture when asset paths are wired up.
 * Returns null while placeholders are in use.
 */
export function useCelestialAsset(_path: CelestialAssetPath): null {
  // Future: return useImage(require(path)) or expo-asset resolved URI.
  return null;
}
