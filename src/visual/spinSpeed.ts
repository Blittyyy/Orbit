import { BASE_SURFACE_VELOCITY } from './constants';
import type { RotationSpeedSource } from '../game/rotationSpeedSource';
import type { SpinSpeedSource } from '../game/spinSpeed';

export interface MutableSpinSpeedSource extends SpinSpeedSource {
  setAngularVelocity(velocity: number): void;
}

export function getBaseAngularVelocity(
  rotationSpeedSource: RotationSpeedSource,
): number {
  return BASE_SURFACE_VELOCITY * rotationSpeedSource.getMultiplier();
}

export function createSpinSpeedSource(
  rotationSpeedSource: RotationSpeedSource,
): MutableSpinSpeedSource {
  let angularVelocity = getBaseAngularVelocity(rotationSpeedSource);

  return {
    getAngularVelocity: () => angularVelocity,
    getSpinRatio: () =>
      Math.abs(angularVelocity) / getBaseAngularVelocity(rotationSpeedSource),
    setAngularVelocity: (velocity: number) => {
      angularVelocity = velocity;
    },
  };
}
