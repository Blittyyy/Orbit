import {
  ANGULAR_FRICTION,
  BASE_SURFACE_VELOCITY,
  MAX_SPIN_RATIO,
  SURFACE_PERIOD,
  VELOCITY_SETTLE_EPSILON_RATIO,
} from './constants';

export interface EarthRotationState {
  offset: number;
  /** Absolute angular velocity in surface units / second. */
  velocity: number;
}

export function createInitialEarthRotationState(
  baseVelocity: number,
): EarthRotationState {
  return {
    offset: 0,
    velocity: baseVelocity,
  };
}

export function normalizeSurfaceOffset(offset: number): number {
  return ((offset % SURFACE_PERIOD) + SURFACE_PERIOD) % SURFACE_PERIOD;
}

export function getMaxSpinVelocity(baseVelocity: number): number {
  const scaled = Math.abs(baseVelocity) * MAX_SPIN_RATIO;
  const floor = BASE_SURFACE_VELOCITY * MAX_SPIN_RATIO;
  return Math.max(scaled, floor);
}

export function clampSpinVelocity(
  velocity: number,
  baseVelocity: number,
): number {
  const limit = getMaxSpinVelocity(baseVelocity);
  if (!Number.isFinite(velocity)) {
    return baseVelocity;
  }
  return Math.max(-limit, Math.min(limit, velocity));
}

/**
 * Coast under friction: only EXTRA velocity relative to auto-spin decays.
 * extra *= exp(-friction * dt); velocity = base + extra
 */
export function applyAngularFriction(
  velocity: number,
  dtSeconds: number,
  baseVelocity: number,
  friction = ANGULAR_FRICTION,
): number {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return velocity;
  }

  const extra = velocity - baseVelocity;
  const decayedExtra = extra * Math.exp(-friction * dtSeconds);
  const epsilon =
    Math.abs(baseVelocity) * VELOCITY_SETTLE_EPSILON_RATIO + 1e-10;

  if (Math.abs(decayedExtra) <= epsilon) {
    return baseVelocity;
  }

  return baseVelocity + decayedExtra;
}

export function stepEarthRotation(
  state: EarthRotationState,
  dtSeconds: number,
  baseVelocity: number,
): EarthRotationState {
  const velocity = applyAngularFriction(
    state.velocity,
    dtSeconds,
    baseVelocity,
  );
  const offset = normalizeSurfaceOffset(state.offset + velocity * dtSeconds);

  return { offset, velocity };
}

export function applyDragOffset(
  state: EarthRotationState,
  dragStartOffset: number,
  translationX: number,
  planetDiameter: number,
): EarthRotationState {
  const normalizedDelta = translationX / planetDiameter;

  return {
    ...state,
    offset: normalizeSurfaceOffset(dragStartOffset + normalizedDelta),
  };
}

/** Target angular velocity while dragging (auto base + scaled gesture). */
export function getDragAngularVelocity(
  velocityX: number,
  planetDiameter: number,
  dragScale: number,
  baseVelocity: number,
): number {
  if (planetDiameter <= 0) {
    return baseVelocity;
  }

  const contribution = (velocityX / planetDiameter) * dragScale;
  return clampSpinVelocity(baseVelocity + contribution, baseVelocity);
}

/**
 * Softly move current velocity toward a drag/flick target (frame-rate independent).
 */
export function trackVelocityToward(
  current: number,
  target: number,
  dtSeconds: number,
  trackingRate: number,
  baseVelocity: number,
): number {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return current;
  }

  const alpha = 1 - Math.exp(-trackingRate * dtSeconds);
  const next = current + (target - current) * alpha;
  return clampSpinVelocity(next, baseVelocity);
}

/**
 * On finger lift: keep the stronger same-direction momentum so a slowing
 * release sample cannot kill spin that was already on the globe.
 * Opposite input cancels / reverses via the release target.
 */
export function mergeReleaseVelocity(
  currentVelocity: number,
  releaseVelocity: number,
  baseVelocity: number,
): number {
  const currentExtra = currentVelocity - baseVelocity;
  const releaseExtra = releaseVelocity - baseVelocity;

  if (currentExtra * releaseExtra > 0) {
    return Math.abs(currentExtra) >= Math.abs(releaseExtra)
      ? currentVelocity
      : releaseVelocity;
  }

  return clampSpinVelocity(releaseVelocity, baseVelocity);
}

/**
 * Exponential moving average for noisy gesture velocity samples.
 */
export function smoothGestureVelocity(
  currentSmoothed: number,
  sample: number,
  dtSeconds: number,
  smoothingRate: number,
): number {
  if (!Number.isFinite(sample)) {
    return currentSmoothed;
  }
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return currentSmoothed;
  }

  const alpha = 1 - Math.exp(-smoothingRate * dtSeconds);
  return currentSmoothed + (sample - currentSmoothed) * alpha;
}

/**
 * Release impulse: add flick momentum onto current angular velocity
 * (same-direction repeats stack; opposite input cancels / reverses).
 */
export function applyFlickVelocity(
  state: EarthRotationState,
  velocityX: number,
  planetDiameter: number,
  flickScale: number,
  baseVelocity: number,
): EarthRotationState {
  if (planetDiameter <= 0) {
    return state;
  }

  const flickContribution = (velocityX / planetDiameter) * flickScale;
  const nextVelocity = clampSpinVelocity(
    state.velocity + flickContribution,
    baseVelocity,
  );

  return {
    ...state,
    velocity: nextVelocity,
  };
}

export function applyBaseVelocityChange(
  state: EarthRotationState,
  previousBaseVelocity: number,
  nextBaseVelocity: number,
): EarthRotationState {
  const excess = state.velocity - previousBaseVelocity;

  return {
    ...state,
    velocity: clampSpinVelocity(nextBaseVelocity + excess, nextBaseVelocity),
  };
}
