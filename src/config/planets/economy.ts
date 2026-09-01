import {
  BASE_ENERGY_PER_SECOND,
  MOON_BASE_UPGRADE_COST,
  MOON_BONUS_PER_LEVEL,
  MOON_COST_MULTIPLIER,
  MOON_UNLOCK_ROTATION_SPEED_LEVEL,
  ROTATION_SPEED_BASE_COST,
  ROTATION_SPEED_BONUS_PER_LEVEL,
  ROTATION_SPEED_COST_MULTIPLIER,
  SATELLITE_BASE_UPGRADE_COST,
  SATELLITE_BONUS_PER_LEVEL,
  SATELLITE_COST_MULTIPLIER,
  SATELLITE_UNLOCK_MOON_LEVEL,
} from '../../game/constants';
import type { PlanetId } from './planetIds';
import {
  DEFAULT_SATELLITE_VISIBLE_COUNTS,
  GALILEAN_MOON_VISIBLE_COUNTS,
  URANUS_MOON_NETWORK_VISIBLE_COUNTS,
  type PlanetUpgradeConfig,
  type UpgradeVisualType,
} from './upgrades';

export type {
  PlanetUpgradeConfig,
  UpgradeCardAccent,
  UpgradeUnlockRequirement,
  UpgradeVisualType,
  VisibleCountThreshold,
} from './upgrades';
export {
  DEFAULT_SATELLITE_VISIBLE_COUNTS,
  GALILEAN_MOON_VISIBLE_COUNTS,
  getVisibleObjectCount,
  URANUS_MOON_NETWORK_VISIBLE_COUNTS,
} from './upgrades';

export interface RotationSpeedEconomyConfig {
  baseCost: number;
  costMultiplier: number;
  bonusPerLevel: number;
}

export interface PlanetEconomyConfig {
  baseEnergyPerSecond: number;
  rotationSpeed: RotationSpeedEconomyConfig;
  /** Ordered production upgrade tracks for this planet. */
  upgrades: PlanetUpgradeConfig[];
}

export const EARTH_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: BASE_ENERGY_PER_SECOND,
  rotationSpeed: {
    baseCost: ROTATION_SPEED_BASE_COST,
    costMultiplier: ROTATION_SPEED_COST_MULTIPLIER,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'moon',
      displayName: 'Moon',
      unlock: {
        type: 'rotationSpeed',
        level: MOON_UNLOCK_ROTATION_SPEED_LEVEL,
      },
      startingLevel: 1,
      bonusPerLevel: MOON_BONUS_PER_LEVEL,
      baseUpgradeCost: MOON_BASE_UPGRADE_COST,
      costMultiplier: MOON_COST_MULTIPLIER,
      visualType: 'moon',
      visualId: 'moon',
      cardAccent: 'moon',
    },
    {
      id: 'satellites',
      displayName: 'Satellite',
      unlock: {
        type: 'upgrade',
        upgradeId: 'moon',
        level: SATELLITE_UNLOCK_MOON_LEVEL,
      },
      startingLevel: 1,
      bonusPerLevel: SATELLITE_BONUS_PER_LEVEL,
      baseUpgradeCost: SATELLITE_BASE_UPGRADE_COST,
      costMultiplier: SATELLITE_COST_MULTIPLIER,
      visualType: 'satellite',
      visualId: 'satellite',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const MARS_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 5,
  rotationSpeed: {
    baseCost: 18,
    costMultiplier: 1.6,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'phobos',
      displayName: 'Phobos',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.3,
      baseUpgradeCost: 90,
      costMultiplier: 1.7,
      visualType: 'moon',
      visualId: 'phobos',
      cardAccent: 'moon',
    },
    {
      id: 'marsOrbiter',
      displayName: 'Mars Orbiter',
      unlock: {
        type: 'upgrade',
        upgradeId: 'phobos',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.2,
      baseUpgradeCost: 420,
      costMultiplier: 1.75,
      visualType: 'satellite',
      visualId: 'mars-orbiter',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const VENUS_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 25,
  rotationSpeed: {
    baseCost: 110,
    costMultiplier: 1.62,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'atmosphericHarvesters',
      displayName: 'Atmospheric Harvesters',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.35,
      baseUpgradeCost: 550,
      costMultiplier: 1.7,
      visualType: 'station',
      visualId: 'atmospheric-harvester',
      cardAccent: 'moon',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
    {
      id: 'cloudStations',
      displayName: 'Cloud Stations',
      unlock: {
        type: 'upgrade',
        upgradeId: 'atmosphericHarvesters',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.25,
      baseUpgradeCost: 3200,
      costMultiplier: 1.75,
      visualType: 'satellite',
      visualId: 'cloud-station',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const MERCURY_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 100,
  rotationSpeed: {
    baseCost: 750,
    costMultiplier: 1.65,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'solarCollectors',
      displayName: 'Solar Collectors',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.4,
      baseUpgradeCost: 3800,
      costMultiplier: 1.7,
      visualType: 'station',
      visualId: 'solar-collector',
      cardAccent: 'moon',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
    {
      id: 'probeNetwork',
      displayName: 'Probe Network',
      unlock: {
        type: 'upgrade',
        upgradeId: 'solarCollectors',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.3,
      baseUpgradeCost: 21_000,
      costMultiplier: 1.75,
      visualType: 'satellite',
      visualId: 'probe',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const JUPITER_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 400,
  rotationSpeed: {
    baseCost: 3800,
    costMultiplier: 1.68,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'galileanMoons',
      displayName: 'Galilean Moons',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.45,
      baseUpgradeCost: 19_000,
      costMultiplier: 1.72,
      visualType: 'moon',
      cardAccent: 'moon',
      visibleCountThresholds: GALILEAN_MOON_VISIBLE_COUNTS,
    },
    {
      id: 'stormResearch',
      displayName: 'Storm Research',
      unlock: {
        type: 'upgrade',
        upgradeId: 'galileanMoons',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.35,
      baseUpgradeCost: 110_000,
      costMultiplier: 1.78,
      visualType: 'station',
      visualId: 'storm-research',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const SATURN_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 1500,
  rotationSpeed: {
    baseCost: 20_000,
    costMultiplier: 1.7,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'titan',
      displayName: 'Titan',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.5,
      baseUpgradeCost: 100_000,
      costMultiplier: 1.72,
      visualType: 'moon',
      visualId: 'titan',
      cardAccent: 'moon',
    },
    {
      id: 'ringHarvesters',
      displayName: 'Ring Harvesters',
      unlock: {
        type: 'upgrade',
        upgradeId: 'titan',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.4,
      baseUpgradeCost: 600_000,
      costMultiplier: 1.78,
      visualType: 'ring',
      visualId: 'ring-harvester',
      cardAccent: 'satellite',
    },
  ],
};

export const URANUS_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 5500,
  rotationSpeed: {
    baseCost: 100_000,
    costMultiplier: 1.7,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'moonNetwork',
      displayName: 'Moon Network',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.55,
      baseUpgradeCost: 500_000,
      costMultiplier: 1.72,
      visualType: 'moon',
      cardAccent: 'moon',
      visibleCountThresholds: URANUS_MOON_NETWORK_VISIBLE_COUNTS,
    },
    {
      id: 'tiltGenerators',
      displayName: 'Tilt Generators',
      unlock: {
        type: 'upgrade',
        upgradeId: 'moonNetwork',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.45,
      baseUpgradeCost: 3_000_000,
      costMultiplier: 1.78,
      visualType: 'station',
      visualId: 'tilt-generator',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

export const NEPTUNE_ECONOMY: PlanetEconomyConfig = {
  baseEnergyPerSecond: 20_000,
  rotationSpeed: {
    baseCost: 450_000,
    costMultiplier: 1.7,
    bonusPerLevel: ROTATION_SPEED_BONUS_PER_LEVEL,
  },
  upgrades: [
    {
      id: 'triton',
      displayName: 'Triton',
      unlock: {
        type: 'rotationSpeed',
        level: 10,
      },
      startingLevel: 1,
      bonusPerLevel: 0.6,
      baseUpgradeCost: 2_200_000,
      costMultiplier: 1.72,
      visualType: 'moon',
      visualId: 'triton',
      cardAccent: 'moon',
    },
    {
      id: 'stormHarvesters',
      displayName: 'Storm Harvesters',
      unlock: {
        type: 'upgrade',
        upgradeId: 'triton',
        level: 5,
      },
      startingLevel: 1,
      bonusPerLevel: 0.5,
      baseUpgradeCost: 13_000_000,
      costMultiplier: 1.78,
      visualType: 'station',
      visualId: 'storm-harvester',
      cardAccent: 'satellite',
      visibleCountThresholds: DEFAULT_SATELLITE_VISIBLE_COUNTS,
    },
  ],
};

const PLAYABLE_ECONOMY: Partial<Record<PlanetId, PlanetEconomyConfig>> = {
  earth: EARTH_ECONOMY,
  mars: MARS_ECONOMY,
  venus: VENUS_ECONOMY,
  mercury: MERCURY_ECONOMY,
  jupiter: JUPITER_ECONOMY,
  saturn: SATURN_ECONOMY,
  uranus: URANUS_ECONOMY,
  neptune: NEPTUNE_ECONOMY,
};

export function getPlanetEconomy(planetId: PlanetId): PlanetEconomyConfig {
  return PLAYABLE_ECONOMY[planetId] ?? EARTH_ECONOMY;
}

export function getPlanetUpgradeTracks(planetId: PlanetId): PlanetUpgradeConfig[] {
  return PLAYABLE_ECONOMY[planetId]?.upgrades ?? [];
}

export function getPlanetUpgradeConfig(
  planetId: PlanetId,
  upgradeId: string,
): PlanetUpgradeConfig | undefined {
  return getPlanetUpgradeTracks(planetId).find((track) => track.id === upgradeId);
}

export function findPlanetUpgradeByVisualType(
  planetId: PlanetId,
  visualType: UpgradeVisualType,
): PlanetUpgradeConfig | undefined {
  return getPlanetUpgradeTracks(planetId).find(
    (track) => track.visualType === visualType,
  );
}

export function getUpgradeUnlockRequirementLabel(
  planetId: PlanetId,
  upgradeId: string,
): string {
  const track = getPlanetUpgradeConfig(planetId, upgradeId);

  if (!track) {
    return 'Locked';
  }

  if (track.unlock.type === 'rotationSpeed') {
    return `Unlocks at Rotation Speed Lv. ${track.unlock.level}`;
  }

  const dependency = getPlanetUpgradeConfig(planetId, track.unlock.upgradeId);
  const dependencyName = dependency?.displayName ?? track.unlock.upgradeId;
  return `Unlocks at ${dependencyName} Lv. ${track.unlock.level}`;
}
