import type { PlanetId } from '../config/planets';

export type SpaceEventId = 'comet-pass' | 'solar-flare' | 'meteor-shower';

export type SpaceEventVisualType = 'comet' | 'solarFlare' | 'meteorShower';

export type SpaceEventEffect =
  | { type: 'cometTap'; passiveSeconds: number }
  | { type: 'productionBoost'; multiplier: number }
  | { type: 'meteorTap'; passiveSecondsPerTap: number; maxTaps: number };

export interface SpaceEventDefinition {
  id: SpaceEventId;
  displayName: string;
  durationMs: number;
  spawnWeight: number;
  visualType: SpaceEventVisualType;
  effect: SpaceEventEffect;
  /** All playable planets when omitted. */
  planetIds?: PlanetId[];
}

export interface CometRuntimeState {
  caught: boolean;
}

export interface MeteorRuntimeState {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  spawnAt: number;
  durationMs: number;
  tapped: boolean;
}

export interface ActiveSpaceEvent {
  instanceId: string;
  definitionId: SpaceEventId;
  planetId: PlanetId;
  startedAt: number;
  endsAt: number;
  comet?: CometRuntimeState;
  meteorTaps: number;
  meteors: MeteorRuntimeState[];
}

export interface PlanetEventEffect {
  planetId: PlanetId | null;
  productionMultiplier: number;
}

export const IDLE_PLANET_EVENT_EFFECT: PlanetEventEffect = {
  planetId: null,
  productionMultiplier: 1,
};
