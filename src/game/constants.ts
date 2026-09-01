/** Fixed simulation tick rate — game logic runs on this interval, not per frame. */
export const TICK_INTERVAL_MS = 50;

export const BASE_ENERGY_PER_SECOND = 1;

export const ROTATION_SPEED_BASE_COST = 5;
export const ROTATION_SPEED_COST_MULTIPLIER = 1.55;
export const ROTATION_SPEED_BONUS_PER_LEVEL = 0.08;

export const MOON_UNLOCK_ROTATION_SPEED_LEVEL = 10;
export const MOON_BONUS_PER_LEVEL = 0.25;
export const MOON_BASE_UPGRADE_COST = 30;
export const MOON_COST_MULTIPLIER = 1.65;

export const SATELLITE_UNLOCK_MOON_LEVEL = 5;
export const SATELLITE_BONUS_PER_LEVEL = 0.15;
export const SATELLITE_BASE_UPGRADE_COST = 30;
export const SATELLITE_COST_MULTIPLIER = 1.65;

export const MARS_UNLOCK_SATELLITE_LEVEL = 10;

/** Earth's satellite upgrade track id (Mars unlock gate + save migration). */
export const EARTH_SATELLITES_UPGRADE_ID = 'satellites';

/** Mars Orbiter upgrade track id (Venus unlock gate). */
export const MARS_ORBITER_UPGRADE_ID = 'marsOrbiter';

export const VENUS_UNLOCK_MARS_ORBITER_LEVEL = 10;

/** Venus Cloud Stations upgrade track id (Mercury unlock gate). */
export const VENUS_CLOUD_STATIONS_UPGRADE_ID = 'cloudStations';

export const MERCURY_UNLOCK_CLOUD_STATIONS_LEVEL = 10;

/** Mercury Probe Network upgrade track id (Jupiter unlock gate). */
export const MERCURY_PROBE_NETWORK_UPGRADE_ID = 'probeNetwork';

export const JUPITER_UNLOCK_PROBE_NETWORK_LEVEL = 10;

/** Jupiter Storm Research upgrade track id (Saturn unlock gate). */
export const JUPITER_STORM_RESEARCH_UPGRADE_ID = 'stormResearch';

export const SATURN_UNLOCK_STORM_RESEARCH_LEVEL = 10;

/** Saturn Ring Harvesters upgrade track id (Uranus unlock gate). */
export const SATURN_RING_HARVESTERS_UPGRADE_ID = 'ringHarvesters';

export const URANUS_UNLOCK_RING_HARVESTERS_LEVEL = 10;

/** Uranus Tilt Generators upgrade track id (Neptune unlock gate). */
export const URANUS_TILT_GENERATORS_UPGRADE_ID = 'tiltGenerators';

export const NEPTUNE_UNLOCK_TILT_GENERATORS_LEVEL = 10;

