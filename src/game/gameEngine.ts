import { createInitialState, tickGameState } from './planetLogic';
import {
  claimAchievementReward,
  devCompleteAllAchievements,
  evaluateAchievements,
} from '../achievements/engine';
import type { AchievementDefinition } from '../achievements/types';
import {
  devUnlockJupiter,
  devUnlockMars,
  devUnlockMercury,
  devUnlockNeptune,
  devUnlockSaturn,
  devUnlockUranus,
  devUnlockVenus,
} from './devCheats';
import {
  applyUpgradeUnlocks,
  bumpUpgradeLevel,
  getPrimaryUpgradeTrack,
  getSecondaryUpgradeTrack,
  isUpgradeUnlocked,
  purchaseUpgrade,
} from './planetUpgrades';
import {
  applyPlanetUnlocks,
  setSelectedPlanet,
} from './planetProgression';
import {
  devAddStardust as addStardustForDev,
  performPrestige as applyPrestigeReset,
  purchasePrestigeUpgrade as buyPrestigeUpgrade,
  readyPrestigeForDev,
  type PrestigeUpgradeId,
} from './prestige';
import { purchaseRotationSpeedUpgrade } from './rotationSpeedUpgrade';
import type { PlanetId } from '../config/planets';
import type { MutableRotationSpeedSource } from './rotationSpeedSource';
import type { SpinSpeedSource } from './spinSpeed';
import type { GameSettings } from './settings';
import {
  getPlanetProgress,
  updatePlanetProgress,
  type GameState,
  type PlanetProgressState,
} from './types';

export class GameEngine {
  private state: GameState;
  private readonly listeners = new Set<(state: GameState) => void>();

  constructor(
    private readonly spinSpeedSource: SpinSpeedSource,
    private readonly rotationSpeedSource: MutableRotationSpeedSource,
  ) {
    this.state = createInitialState();
  }

  getState(): GameState {
    return this.state;
  }

  getPlanetProgress(planetId: PlanetId): PlanetProgressState {
    return getPlanetProgress(this.state, planetId);
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private syncActivePlanetSpin(): void {
    const active = getPlanetProgress(this.state, this.state.selectedPlanetId);
    this.rotationSpeedSource.setLevel(active.rotationSpeedLevel);
  }

  hydrate(saved: GameState): void {
    let next: GameState = {
      ...createInitialState(),
      energy: saved.energy,
      planetStates: saved.planetStates,
      unlockedPlanets: saved.unlockedPlanets,
      selectedPlanetId: saved.selectedPlanetId,
      stardust: saved.stardust,
      prestigeCount: saved.prestigeCount,
      prestigeUpgrades: saved.prestigeUpgrades,
      settings: saved.settings,
      achievements: saved.achievements,
    };

    for (const planetId of saved.unlockedPlanets) {
      next = applyUpgradeUnlocks(next, planetId);
    }

    this.state = applyPlanetUnlocks(next);
    this.syncActivePlanetSpin();
    this.notify();
  }

  resetToInitial(): void {
    this.state = createInitialState();
    this.syncActivePlanetSpin();
    this.notify();
  }

  selectPlanet(planetId: PlanetId): void {
    this.state = setSelectedPlanet(this.state, planetId);
    this.syncActivePlanetSpin();
    this.notify();
  }

  updateSettings(partial: Partial<GameSettings>): void {
    this.state = {
      ...this.state,
      settings: {
        ...this.state.settings,
        ...partial,
      },
    };
    this.notify();
  }

  creditEnergy(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    this.state = {
      ...this.state,
      energy: this.state.energy + amount,
    };
    this.notify();
  }

  tick(dtSeconds: number, activeEventMultiplier = 1): void {
    const spinRatio = this.spinSpeedSource.getSpinRatio();
    this.state = tickGameState(
      this.state,
      dtSeconds,
      spinRatio,
      activeEventMultiplier,
    );
    this.notify();
  }

  syncAchievements(spinRatio: number): AchievementDefinition[] {
    const result = evaluateAchievements(this.state, spinRatio);

    if (result.state !== this.state) {
      this.state = result.state;
      this.notify();
    }

    return result.newlyCompleted;
  }

  claimAchievement(achievementId: string): boolean {
    const next = claimAchievementReward(this.state, achievementId);

    if (!next) {
      return false;
    }

    this.state = next;
    this.notify();
    return true;
  }

  devCompleteAllAchievements(): void {
    this.state = devCompleteAllAchievements(this.state);
    this.notify();
  }

  purchaseRotationSpeedUpgrade(planetId?: PlanetId): boolean {
    const target = planetId ?? this.state.selectedPlanetId;
    const purchased = purchaseRotationSpeedUpgrade(this.state, target);

    if (!purchased) {
      return false;
    }

    this.state = applyPlanetUnlocks(applyUpgradeUnlocks(purchased, target));
    if (target === this.state.selectedPlanetId) {
      this.syncActivePlanetSpin();
    }
    this.notify();
    return true;
  }

  purchaseUpgrade(upgradeId: string, planetId?: PlanetId): boolean {
    const target = planetId ?? this.state.selectedPlanetId;
    const purchased = purchaseUpgrade(this.state, target, upgradeId);

    if (!purchased) {
      return false;
    }

    this.state = applyPlanetUnlocks(applyUpgradeUnlocks(purchased, target));
    this.notify();
    return true;
  }

  purchasePrestigeUpgrade(upgradeId: PrestigeUpgradeId): boolean {
    const purchased = buyPrestigeUpgrade(this.state, upgradeId);

    if (!purchased) {
      return false;
    }

    this.state = purchased;
    this.notify();
    return true;
  }

  /** Reset run progression and grant prestige reward. Returns false if locked. */
  performPrestige(): boolean {
    const next = applyPrestigeReset(this.state);

    if (!next) {
      return false;
    }

    this.state = next;
    this.syncActivePlanetSpin();
    this.notify();
    return true;
  }

  /** DEV progression for a specific planet (defaults to selected). */
  devLevelUpPlanet(planetId?: PlanetId): void {
    const target = planetId ?? this.state.selectedPlanetId;
    const progress = getPlanetProgress(this.state, target);
    const primary = getPrimaryUpgradeTrack(target);

    if (primary && isUpgradeUnlocked(progress, primary.id)) {
      this.state = applyPlanetUnlocks(
        applyUpgradeUnlocks(
          updatePlanetProgress(this.state, target, (current) =>
            bumpUpgradeLevel(current, target, primary.id),
          ),
          target,
        ),
      );
    } else {
      this.state = applyPlanetUnlocks(
        applyUpgradeUnlocks(
          updatePlanetProgress(this.state, target, (current) => ({
            ...current,
            rotationSpeedLevel: current.rotationSpeedLevel + 1,
          })),
          target,
        ),
      );
    }

    if (target === this.state.selectedPlanetId) {
      this.syncActivePlanetSpin();
    }
    this.notify();
  }

  /** DEV +1 on the planet's secondary upgrade track (Satellite / Orbiter). */
  devLevelUpSatellite(planetId?: PlanetId): void {
    const target = planetId ?? this.state.selectedPlanetId;
    const secondary = getSecondaryUpgradeTrack(target);

    if (!secondary) {
      return;
    }

    this.state = applyPlanetUnlocks(
      applyUpgradeUnlocks(
        updatePlanetProgress(this.state, target, (current) =>
          bumpUpgradeLevel(current, target, secondary.id),
        ),
        target,
      ),
    );

    this.notify();
  }

  /** Legacy Earth-targeted DEV helper. */
  devLevelUp(): void {
    this.devLevelUpPlanet('earth');
  }

  devUnlockMars(): void {
    this.state = devUnlockMars(this.state);
    this.notify();
  }

  devUnlockVenus(): void {
    this.state = devUnlockVenus(this.state);
    this.notify();
  }

  devUnlockMercury(): void {
    this.state = devUnlockMercury(this.state);
    this.notify();
  }

  devUnlockJupiter(): void {
    this.state = devUnlockJupiter(this.state);
    this.notify();
  }

  devUnlockSaturn(): void {
    this.state = devUnlockSaturn(this.state);
    this.notify();
  }

  devUnlockUranus(): void {
    this.state = devUnlockUranus(this.state);
    this.notify();
  }

  devUnlockNeptune(): void {
    this.state = devUnlockNeptune(this.state);
    this.notify();
  }

  devReadyPrestige(): void {
    this.state = readyPrestigeForDev(this.state);
    this.syncActivePlanetSpin();
    this.notify();
  }

  devAddStardust(amount?: number): void {
    this.state = addStardustForDev(this.state, amount);
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
