import { getPlayablePlanetIds, type PlanetId } from '../../src/config/planets';
import { createInitialState } from '../../src/game/planetLogic';
import { applyPlanetUnlocks, isPlanetUnlocked } from '../../src/game/planetProgression';
import {
  applyUpgradeUnlocks,
  getPrimaryUpgradeTrack,
  getSecondaryUpgradeTrack,
  isUpgradeUnlocked,
  purchaseUpgrade,
} from '../../src/game/planetUpgrades';
import {
  canPrestige,
  getPrestigeUpgradeLevel,
  performPrestige,
  type PrestigeUpgradeId,
} from '../../src/game/prestige';
import { purchaseRotationSpeedUpgrade } from '../../src/game/rotationSpeedUpgrade';
import {
  getPlanetProgress,
  type GameState,
} from '../../src/game/types';
import {
  PLAYER_PROFILES,
  WARNING_THRESHOLDS,
  type PlayerProfileConfig,
  type PlayerProfileId,
  type StardustStrategyId,
} from './config';
import {
  cloneState,
  enumeratePurchaseOptions,
  getFrontierPlanetId,
  getPassivePlanetEpsMap,
  getSystemEps,
  runComplete,
} from './metrics';
import { allocateStardust } from './prestigeStrategies';
import { pickPurchase, trackLevels } from './purchasePolicy';
import type {
  PlanetMilestoneTimes,
  PlanetShareSnapshot,
  PrestigeCampaignResult,
  PurchaseOption,
  RunResult,
} from './types';

function applyUnlocks(state: GameState): GameState {
  let next = state;

  for (const planetId of next.unlockedPlanets) {
    next = applyUpgradeUnlocks(next, planetId);
  }

  return applyPlanetUnlocks(next);
}

function buyRotation(state: GameState, planetId: PlanetId): GameState | null {
  const purchased = purchaseRotationSpeedUpgrade(state, planetId);
  if (!purchased) {
    return null;
  }
  return applyUnlocks(purchased);
}

function buyTrack(
  state: GameState,
  planetId: PlanetId,
  upgradeId: string,
): GameState | null {
  const purchased = purchaseUpgrade(state, planetId, upgradeId);
  if (!purchased) {
    return null;
  }
  return applyUnlocks(purchased);
}

function applyPurchase(state: GameState, option: PurchaseOption): GameState | null {
  if (option.kind === 'rotationSpeed') {
    return buyRotation(state, option.planetId);
  }
  if (option.upgradeId) {
    return buyTrack(state, option.planetId, option.upgradeId);
  }
  return null;
}

function emptyMilestones(planetId: PlanetId): PlanetMilestoneTimes {
  return {
    planetId,
    rotationLv10: null,
    track1Unlock: null,
    track1Lv5: null,
    track2Unlock: null,
    track2Lv10: null,
    nextPlanetUnlock: null,
    segmentSeconds: null,
  };
}

function readPrestigeLevels(
  state: GameState,
): Record<PrestigeUpgradeId, number> {
  return {
    cosmicMomentum: getPrestigeUpgradeLevel(state, 'cosmicMomentum'),
    orbitalKnowledge: getPrestigeUpgradeLevel(state, 'orbitalKnowledge'),
    deepSpaceReserves: getPrestigeUpgradeLevel(state, 'deepSpaceReserves'),
  };
}

function recordShare(
  snapshots: PlanetShareSnapshot[],
  state: GameState,
  atSeconds: number,
  label: string,
  frontier: PlanetId,
  spin: number,
): void {
  const planetEps = getPassivePlanetEpsMap(state);
  const totalEps = getSystemEps(state, frontier, spin);
  const shares: Partial<Record<PlanetId, number>> = {};

  for (const [planetId, eps] of Object.entries(planetEps) as Array<
    [PlanetId, number]
  >) {
    shares[planetId] = totalEps > 0 ? eps / totalEps : 0;
  }

  snapshots.push({
    atSeconds,
    label,
    totalEps,
    shares,
    planetEps,
  });
}

interface MilestoneTracker {
  byPlanet: Map<PlanetId, PlanetMilestoneTimes>;
  segmentStart: Map<PlanetId, number>;
  neptuneUnlockSeconds: number | null;
  prestigeReadySeconds: number | null;
  shares: PlanetShareSnapshot[];
  pendingWeakPlanetChecks: Array<{
    planetId: PlanetId;
    unlockSeconds: number;
  }>;
}

function createTracker(): MilestoneTracker {
  const byPlanet = new Map<PlanetId, PlanetMilestoneTimes>();
  for (const planetId of getPlayablePlanetIds()) {
    byPlanet.set(planetId, emptyMilestones(planetId));
  }

  return {
    byPlanet,
    segmentStart: new Map(),
    neptuneUnlockSeconds: null,
    prestigeReadySeconds: null,
    shares: [],
    pendingWeakPlanetChecks: [],
  };
}

function ensureSegmentStart(
  tracker: MilestoneTracker,
  planetId: PlanetId,
  now: number,
): void {
  if (!tracker.segmentStart.has(planetId)) {
    tracker.segmentStart.set(planetId, now);
  }
}

function updateMilestones(
  tracker: MilestoneTracker,
  prev: GameState,
  next: GameState,
  now: number,
  frontier: PlanetId,
  spin: number,
): void {
  for (const planetId of getPlayablePlanetIds()) {
    if (!next.unlockedPlanets.includes(planetId)) {
      continue;
    }

    ensureSegmentStart(tracker, planetId, now);
    const row = tracker.byPlanet.get(planetId)!;
    const levels = trackLevels(next, planetId);
    const primary = getPrimaryUpgradeTrack(planetId);
    const secondary = getSecondaryUpgradeTrack(planetId);

    if (row.rotationLv10 == null && levels.rotation >= 10) {
      row.rotationLv10 = now;
    }

    if (
      row.track1Unlock == null &&
      primary &&
      isUpgradeUnlocked(getPlanetProgress(next, planetId), primary.id)
    ) {
      row.track1Unlock = now;
    }

    if (
      row.track1Lv5 == null &&
      levels.track1Unlocked &&
      levels.track1Level >= 5
    ) {
      row.track1Lv5 = now;
    }

    if (
      row.track2Unlock == null &&
      secondary &&
      isUpgradeUnlocked(getPlanetProgress(next, planetId), secondary.id)
    ) {
      row.track2Unlock = now;
    }

    if (
      row.track2Lv10 == null &&
      levels.track2Unlocked &&
      levels.track2Level >= 10
    ) {
      row.track2Lv10 = now;
      const start = tracker.segmentStart.get(planetId) ?? 0;
      row.segmentSeconds = now - start;
      recordShare(
        tracker.shares,
        next,
        now,
        `${planetId} track2 Lv.10`,
        frontier,
        spin,
      );
    }
  }

  for (const planetId of getPlayablePlanetIds()) {
    if (!isPlanetUnlocked(prev, planetId) && isPlanetUnlocked(next, planetId)) {
      const playable = getPlayablePlanetIds();
      const index = playable.indexOf(planetId);
      const previous = index > 0 ? playable[index - 1] : null;

      if (previous) {
        const prevRow = tracker.byPlanet.get(previous)!;
        if (prevRow.nextPlanetUnlock == null) {
          prevRow.nextPlanetUnlock = now;
        }
      }

      ensureSegmentStart(tracker, planetId, now);
      tracker.pendingWeakPlanetChecks.push({
        planetId,
        unlockSeconds: now,
      });
      recordShare(
        tracker.shares,
        next,
        now,
        `Unlock ${planetId}`,
        frontier,
        spin,
      );

      if (planetId === 'neptune' && tracker.neptuneUnlockSeconds == null) {
        tracker.neptuneUnlockSeconds = now;
      }
    }
  }

  if (canPrestige(next) && tracker.prestigeReadySeconds == null) {
    tracker.prestigeReadySeconds = now;
    const neptune = tracker.byPlanet.get('neptune');
    if (neptune && neptune.segmentSeconds == null) {
      const start = tracker.segmentStart.get('neptune') ?? 0;
      neptune.segmentSeconds = now - start;
    }
    recordShare(
      tracker.shares,
      next,
      now,
      'Prestige ready',
      frontier,
      spin,
    );
  }

  const due = tracker.pendingWeakPlanetChecks.filter(
    (check) =>
      now >= check.unlockSeconds + WARNING_THRESHOLDS.weakNewPlanetSampleSeconds,
  );

  for (const check of due) {
    recordShare(
      tracker.shares,
      next,
      now,
      `${check.planetId} +${WARNING_THRESHOLDS.weakNewPlanetSampleSeconds}s`,
      frontier,
      spin,
    );
  }

  if (due.length > 0) {
    tracker.pendingWeakPlanetChecks = tracker.pendingWeakPlanetChecks.filter(
      (check) => !due.includes(check),
    );
  }
}

export interface SimulateRunOptions {
  profileId: PlayerProfileId;
  strategyId?: StardustStrategyId | null;
  startingState?: GameState;
  runNumber?: number;
  maxSeconds?: number;
  maxPurchases?: number;
}

export interface SimulateRunOutput {
  result: RunResult;
  finalState: GameState;
}

/**
 * Simulate one full Solar System run until prestige-ready.
 * Uses real purchase / production / unlock helpers from src/game.
 */
export function simulateRun(options: SimulateRunOptions): SimulateRunOutput {
  const profile: PlayerProfileConfig = PLAYER_PROFILES[options.profileId];
  const spin = profile.frontierSpinMultiplier;
  let state = applyUnlocks(
    options.startingState
      ? cloneState(options.startingState)
      : createInitialState(),
  );

  const initialFrontier = getFrontierPlanetId(state);
  state = { ...state, selectedPlanetId: initialFrontier };

  let elapsed = 0;
  let totalEnergyEarned = 0;
  let purchases = 0;
  const tracker = createTracker();
  ensureSegmentStart(tracker, 'earth', 0);
  recordShare(tracker.shares, state, 0, 'Run start', initialFrontier, spin);

  const poorPaybackPurchases: RunResult['poorPaybackPurchases'] = [];
  const maxSeconds = options.maxSeconds ?? 365 * 24 * 3600;
  const maxPurchases = options.maxPurchases ?? 100_000;
  let steps = 0;

  updateMilestones(tracker, state, state, elapsed, initialFrontier, spin);

  while (
    !runComplete(state) &&
    elapsed < maxSeconds &&
    purchases < maxPurchases
  ) {
    steps += 1;
    if (steps > 500_000) {
      throw new Error(
        `Simulation stuck (${profile.id} run ${options.runNumber ?? 1})`,
      );
    }

    const frontier = getFrontierPlanetId(state);
    if (state.selectedPlanetId !== frontier) {
      state = { ...state, selectedPlanetId: frontier };
    }

    const beforeUnlock = state;
    state = applyUnlocks(state);
    updateMilestones(tracker, beforeUnlock, state, elapsed, frontier, spin);

    if (runComplete(state)) {
      break;
    }

    const optionsList = enumeratePurchaseOptions(
      state,
      frontier,
      spin,
      buyRotation,
      buyTrack,
    );
    const choice = pickPurchase(profile, state, optionsList);

    if (!choice) {
      const eps = getSystemEps(state, frontier, spin);
      if (eps <= 0) {
        throw new Error(`Zero EPS with no purchases (${profile.id})`);
      }
      const wait = 1;
      elapsed += wait;
      const gained = eps * wait;
      state = { ...state, energy: state.energy + gained };
      totalEnergyEarned += gained;
      updateMilestones(tracker, state, state, elapsed, frontier, spin);
      continue;
    }

    const eps = getSystemEps(state, frontier, spin);
    if (eps <= 0) {
      throw new Error(`Zero EPS before purchase (${choice.displayName})`);
    }

    if (state.energy < choice.cost) {
      const deficit = choice.cost - state.energy;
      const wait = deficit / eps;
      elapsed += wait;
      totalEnergyEarned += deficit;
      state = { ...state, energy: choice.cost };
      updateMilestones(tracker, state, state, elapsed, frontier, spin);
    }

    const purchased = applyPurchase(state, choice);
    if (!purchased) {
      elapsed += 0.01;
      continue;
    }

    if (
      Number.isFinite(choice.paybackSeconds) &&
      choice.paybackSeconds >= WARNING_THRESHOLDS.poorPaybackSeconds
    ) {
      poorPaybackPurchases.push({
        name: choice.displayName,
        paybackSeconds: choice.paybackSeconds,
        atSeconds: elapsed,
      });
    }

    purchases += 1;
    const prev = state;
    state = purchased;
    updateMilestones(tracker, prev, state, elapsed, frontier, spin);
  }

  if (tracker.prestigeReadySeconds == null) {
    tracker.prestigeReadySeconds = elapsed;
  }

  const endFrontier = getFrontierPlanetId(state);

  const result: RunResult = {
    profileId: profile.id,
    strategyId: options.strategyId ?? null,
    runNumber: options.runNumber ?? 1,
    elapsedSeconds: tracker.prestigeReadySeconds,
    neptuneUnlockSeconds: tracker.neptuneUnlockSeconds,
    prestigeReadySeconds: tracker.prestigeReadySeconds,
    totalEnergyEarned,
    endingEnergy: state.energy,
    endingSystemEps: getSystemEps(state, endFrontier, spin),
    endingPlanetEps: getPassivePlanetEpsMap(state),
    planetMilestones: getPlayablePlanetIds().map(
      (planetId) => tracker.byPlanet.get(planetId)!,
    ),
    productionShares: tracker.shares,
    prestigeLevels: readPrestigeLevels(state),
    stardustSpentThisBreak: 0,
    stardustRemaining: state.stardust,
    prestigeCountAtStart: state.prestigeCount,
    purchases,
    poorPaybackPurchases,
  };

  return { result, finalState: state };
}

/**
 * Simulate multiple prestige cycles with a Stardust allocation strategy.
 */
export function simulatePrestigeCampaign(
  profileId: PlayerProfileId,
  strategyId: StardustStrategyId,
  cycles: number,
): PrestigeCampaignResult {
  let state = createInitialState();
  const runs: RunResult[] = [];

  for (let runNumber = 1; runNumber <= cycles; runNumber += 1) {
    const { result, finalState } = simulateRun({
      profileId,
      strategyId,
      startingState: state,
      runNumber,
    });

    const prestiged = performPrestige(finalState);
    if (!prestiged) {
      throw new Error(
        `Cannot prestige at end of run ${runNumber} (${profileId}/${strategyId})`,
      );
    }

    const allocated = allocateStardust(prestiged, strategyId);
    result.stardustSpentThisBreak = allocated.spent;
    result.stardustRemaining = allocated.state.stardust;
    result.prestigeLevels = readPrestigeLevels(allocated.state);
    runs.push(result);
    state = allocated.state;
  }

  return { profileId, strategyId, runs };
}
