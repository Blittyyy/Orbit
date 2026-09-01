import type { SpaceEventDefinition } from './types';

export const SPACE_EVENT_DEFINITIONS: SpaceEventDefinition[] = [
  {
    id: 'comet-pass',
    displayName: 'Comet Pass',
    durationMs: 5_000,
    spawnWeight: 1,
    visualType: 'comet',
    effect: { type: 'cometTap', passiveSeconds: 30 },
  },
  {
    id: 'solar-flare',
    displayName: 'Solar Flare',
    durationMs: 20_000,
    spawnWeight: 1,
    visualType: 'solarFlare',
    effect: { type: 'productionBoost', multiplier: 1.5 },
  },
  {
    id: 'meteor-shower',
    displayName: 'Meteor Shower',
    durationMs: 15_000,
    spawnWeight: 1,
    visualType: 'meteorShower',
    effect: { type: 'meteorTap', passiveSecondsPerTap: 5, maxTaps: 10 },
  },
];

const definitionMap = new Map(
  SPACE_EVENT_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getSpaceEventDefinition(id: string): SpaceEventDefinition | undefined {
  return definitionMap.get(id as SpaceEventDefinition['id']);
}
