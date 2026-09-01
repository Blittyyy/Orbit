import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { PlanetId } from '../config/planets';
import {
  getCometReward,
  getEventProductionMultiplier,
  getMeteorReward,
  getSpaceEventDefinition,
  IDLE_PLANET_EVENT_EFFECT,
  pickRandomSpaceEvent,
  randomCooldownMs,
  randomFirstSpawnDelayMs,
  startSpaceEvent,
  type ActiveSpaceEvent,
  type MeteorRuntimeState,
  type PlanetEventEffect,
  type SpaceEventId,
} from '../events';
import type { GameState } from '../game/types';

const METEOR_SPAWN_INTERVAL_MS = 1_400;
const METEOR_FLIGHT_MS = 1_100;
const TICK_MS = 100;

interface DevEventRequest {
  id: SpaceEventId;
  nonce: number;
}

interface UsePlanetSpaceEventsOptions {
  planetId: PlanetId;
  state: GameState;
  route: string;
  isNavigating: boolean;
  celebrationActive: boolean;
  offlineModalOpen: boolean;
  creditEnergy: (amount: number) => void;
  setPlanetEventEffect: (effect: PlanetEventEffect) => void;
  onEventReward: () => void;
  devEventRequest?: DevEventRequest | null;
}

function createMeteor(
  width: number,
  height: number,
  now: number,
): MeteorRuntimeState {
  const margin = 24;
  const startX = -margin;
  const startY = Math.random() * height * 0.45;
  const endX = width * (0.55 + Math.random() * 0.4);
  const endY = startY + height * (0.18 + Math.random() * 0.2);

  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    startX,
    startY,
    endX,
    endY,
    spawnAt: now,
    durationMs: METEOR_FLIGHT_MS,
    tapped: false,
  };
}

function applyProductionEffect(
  definitionId: SpaceEventId,
  planetId: PlanetId,
  setPlanetEventEffect: (effect: PlanetEventEffect) => void,
) {
  const definition = getSpaceEventDefinition(definitionId);
  if (definition?.effect.type === 'productionBoost') {
    setPlanetEventEffect({
      planetId,
      productionMultiplier: getEventProductionMultiplier(definition),
    });
    return;
  }

  setPlanetEventEffect(IDLE_PLANET_EVENT_EFFECT);
}

export function usePlanetSpaceEvents({
  planetId,
  state,
  route,
  isNavigating,
  celebrationActive,
  offlineModalOpen,
  creditEnergy,
  setPlanetEventEffect,
  onEventReward,
  devEventRequest,
}: UsePlanetSpaceEventsOptions) {
  const [activeEvent, setActiveEvent] = useState<ActiveSpaceEvent | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [rewardPop, setRewardPop] = useState<string | null>(null);
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });

  const readyAtRef = useRef(Date.now() + randomFirstSpawnDelayMs());
  const lastMeteorSpawnRef = useRef(0);
  const appActiveRef = useRef(AppState.currentState === 'active');
  const activeEventRef = useRef<ActiveSpaceEvent | null>(null);

  useEffect(() => {
    activeEventRef.current = activeEvent;
  }, [activeEvent]);

  const endEvent = useCallback(() => {
    setActiveEvent(null);
    activeEventRef.current = null;
    setPlanetEventEffect(IDLE_PLANET_EVENT_EFFECT);
    readyAtRef.current = Date.now() + randomCooldownMs();
    lastMeteorSpawnRef.current = 0;
  }, [setPlanetEventEffect]);

  const beginEvent = useCallback(
    (definitionId?: SpaceEventId) => {
      const definition = definitionId
        ? getSpaceEventDefinition(definitionId)
        : pickRandomSpaceEvent(planetId);

      if (!definition) {
        return;
      }

      const event = startSpaceEvent(definition, planetId);
      activeEventRef.current = event;
      setActiveEvent(event);
      lastMeteorSpawnRef.current = event.startedAt;
      applyProductionEffect(definition.id, planetId, setPlanetEventEffect);
    },
    [planetId, setPlanetEventEffect],
  );

  const showRewardPop = useCallback((amount: number) => {
    setRewardPop(`+${Math.max(0, Math.floor(amount)).toLocaleString('en-US')} Energy`);
    setTimeout(() => setRewardPop(null), 900);
  }, []);

  const handleCometTap = useCallback(() => {
    const current = activeEventRef.current;
    if (!current || current.definitionId !== 'comet-pass' || current.comet?.caught) {
      return;
    }

    const definition = getSpaceEventDefinition('comet-pass');
    if (!definition) {
      return;
    }

    const reward = getCometReward(state, planetId, definition);
    if (reward > 0) {
      creditEnergy(reward);
      onEventReward();
      showRewardPop(reward);
    }

    const next = { ...current, comet: { caught: true } };
    activeEventRef.current = next;
    setActiveEvent(next);
  }, [creditEnergy, onEventReward, planetId, showRewardPop, state]);

  const handleMeteorTap = useCallback(
    (meteorId: string) => {
      const current = activeEventRef.current;
      if (!current || current.definitionId !== 'meteor-shower') {
        return;
      }

      const definition = getSpaceEventDefinition('meteor-shower');
      if (!definition || definition.effect.type !== 'meteorTap') {
        return;
      }

      const meteor = current.meteors.find((entry) => entry.id === meteorId);
      if (!meteor || meteor.tapped) {
        return;
      }

      let nextMeteorTaps = current.meteorTaps;
      if (current.meteorTaps < definition.effect.maxTaps) {
        const reward = getMeteorReward(state, planetId, definition);
        if (reward > 0) {
          creditEnergy(reward);
          onEventReward();
          showRewardPop(reward);
        }
        nextMeteorTaps += 1;
      }

      const next = {
        ...current,
        meteorTaps: nextMeteorTaps,
        meteors: current.meteors.map((entry) =>
          entry.id === meteorId ? { ...entry, tapped: true } : entry,
        ),
      };
      activeEventRef.current = next;
      setActiveEvent(next);
    },
    [creditEnergy, onEventReward, planetId, showRewardPop, state],
  );

  useEffect(() => {
    if (!devEventRequest?.nonce) {
      return;
    }

    endEvent();
    beginEvent(devEventRequest.id);
  }, [beginEvent, devEventRequest, endEvent]);

  useEffect(() => {
    endEvent();
    readyAtRef.current = Date.now() + randomFirstSpawnDelayMs();
  }, [endEvent, planetId]);

  useEffect(() => {
    return () => {
      setPlanetEventEffect(IDLE_PLANET_EVENT_EFFECT);
    };
  }, [planetId, setPlanetEventEffect]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      appActiveRef.current = nextState === 'active';
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!appActiveRef.current) {
        return;
      }

      const currentNow = Date.now();
      setNow(currentNow);

      const current = activeEventRef.current;
      if (current) {
        if (currentNow >= current.endsAt) {
          endEvent();
          return;
        }

        if (current.definitionId === 'meteor-shower') {
          const definition = getSpaceEventDefinition('meteor-shower');
          const maxTaps =
            definition?.effect.type === 'meteorTap'
              ? definition.effect.maxTaps
              : 10;
          const activeMeteors = current.meteors.filter(
            (meteor) => currentNow - meteor.spawnAt < meteor.durationMs + 200,
          );
          const shouldSpawn =
            current.meteorTaps < maxTaps &&
            layoutSize.width > 0 &&
            currentNow - lastMeteorSpawnRef.current >= METEOR_SPAWN_INTERVAL_MS;

          if (shouldSpawn) {
            lastMeteorSpawnRef.current = currentNow;
            const next = {
              ...current,
              meteors: [
                ...activeMeteors,
                createMeteor(layoutSize.width, layoutSize.height, currentNow),
              ],
            };
            activeEventRef.current = next;
            setActiveEvent(next);
          } else if (activeMeteors.length !== current.meteors.length) {
            const next = { ...current, meteors: activeMeteors };
            activeEventRef.current = next;
            setActiveEvent(next);
          }
        }

        return;
      }

      const blocked =
        celebrationActive ||
        offlineModalOpen ||
        isNavigating ||
        route !== planetId;

      if (blocked || currentNow < readyAtRef.current) {
        return;
      }

      beginEvent();
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [
    beginEvent,
    celebrationActive,
    endEvent,
    isNavigating,
    layoutSize.height,
    layoutSize.width,
    offlineModalOpen,
    planetId,
    route,
  ]);

  return {
    activeEvent,
    now,
    rewardPop,
    layoutSize,
    setLayoutSize,
    handleCometTap,
    handleMeteorTap,
  };
}
