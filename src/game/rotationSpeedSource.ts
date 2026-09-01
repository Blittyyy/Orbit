import { getRotationSpeedMultiplier } from './rotationSpeedUpgrade';

export interface RotationSpeedSource {
  getLevel(): number;
  getMultiplier(): number;
}

export interface MutableRotationSpeedSource extends RotationSpeedSource {
  setLevel(level: number): void;
}

export function createRotationSpeedSource(): MutableRotationSpeedSource {
  let level = 0;

  return {
    getLevel: () => level,
    getMultiplier: () => getRotationSpeedMultiplier(level),
    setLevel: (nextLevel: number) => {
      level = nextLevel;
    },
  };
}
