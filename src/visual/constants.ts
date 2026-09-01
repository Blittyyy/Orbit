/** One full surface loop spans two normalized planet diameters. */
export const SURFACE_PERIOD = 2;

/** Normalized surface units per second for automatic rotation. */
export const BASE_SURFACE_VELOCITY = 0.05;

/**
 * Scales flick gesture velocity into added surface spin.
 * High enough that a solid flick visibly spins the globe (not a nudge).
 */
export const FLICK_VELOCITY_SCALE = 0.07;

/** Scales live drag gesture velocity while the finger is down. */
export const DRAG_VELOCITY_SCALE = 0.07;

/**
 * Technical |ω| / ω_base ceiling only — guards against gesture glitches
 * and numeric runaway. Not a gameplay production "max".
 */
export const MAX_SPIN_RATIO = 12;

/**
 * Friction on EXTRA angular velocity above/below auto spin.
 * Frame-rate independent: extra *= exp(-ANGULAR_FRICTION * dt).
 *
 * ~0.085 → half the extra momentum remains after ~8s; a strong flick
 * keeps spinning for well over 10–15s before blending into auto-spin.
 */
export const ANGULAR_FRICTION = 0.085;

/**
 * How quickly smoothed gesture samples track raw touch velocity (1/seconds).
 * Higher = snappier; lower = more filtering of noisy samples.
 */
export const GESTURE_VELOCITY_SMOOTHING = 20;

/**
 * While dragging, how quickly planet angular velocity tracks the
 * smoothed gesture target (1/seconds).
 */
export const DRAG_VELOCITY_TRACKING = 16;

/**
 * When |extra| falls below this fraction of |base|, treat as settled.
 * Tiny enough that merging into auto-spin is invisible.
 */
export const VELOCITY_SETTLE_EPSILON_RATIO = 0.0004;
