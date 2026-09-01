import type { CelestialAssetPath } from '../../config/celestial';

/** True when a non-null asset path is configured (loading handled separately). */
export function hasAssetPath(path: CelestialAssetPath): path is string {
  return path !== null && path.length > 0;
}
