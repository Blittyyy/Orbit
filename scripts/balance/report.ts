import { formatNumber } from '../../src/utils/formatNumber';
import {
  PLAYER_PROFILES,
  PRESTIGE_REPORT_RUNS,
  STARDUST_STRATEGIES,
  type PlayerProfileId,
  type StardustStrategyId,
} from './config';
import type {
  BalanceWarning,
  PlanetShareSnapshot,
  PrestigeCampaignResult,
  ProfileComparisonRow,
  RunResult,
} from './types';

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) {
    return '—';
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  let totalMinutes = seconds / 60;
  if (totalMinutes < 60) {
    return `${totalMinutes.toFixed(1)}m`;
  }

  let hours = Math.floor(totalMinutes / 60);
  let rem = Math.round(totalMinutes - hours * 60);
  if (rem === 60) {
    hours += 1;
    rem = 0;
  }
  return `${hours}h ${rem}m`;
}

function formatRatio(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(2)}x`;
}

function pad(value: string, width: number): string {
  if (value.length >= width) {
    return value;
  }
  return value + ' '.repeat(width - value.length);
}

function padStart(value: string, width: number): string {
  if (value.length >= width) {
    return value;
  }
  return ' '.repeat(width - value.length) + value;
}

export function printProfileBanner(profileId: PlayerProfileId): void {
  const profile = PLAYER_PROFILES[profileId];
  console.log('\n' + '='.repeat(96));
  console.log(`${profile.label} — ${profile.description}`);
  console.log(
    `Frontier spin multiplier: ${profile.frontierSpinMultiplier}x | Policy: ${profile.purchasePolicy}`,
  );
  console.log('='.repeat(96));
}

export function printRunReport(run: RunResult): void {
  console.log(
    `\nRun ${run.runNumber} | Prestige ready: ${formatDuration(run.prestigeReadySeconds)} | Neptune unlock: ${formatDuration(run.neptuneUnlockSeconds)}`,
  );
  console.log(
    `Purchases: ${run.purchases} | Energy earned: ${formatNumber(run.totalEnergyEarned)} | Ending system EPS: ${formatNumber(run.endingSystemEps)}/s`,
  );
  console.log(
    `Prestige levels @ end (pre-spend unless campaign): Cosmic ${run.prestigeLevels.cosmicMomentum} | Orbital ${run.prestigeLevels.orbitalKnowledge} | Reserves ${run.prestigeLevels.deepSpaceReserves}`,
  );

  console.log(
    '\nPlanet     | Rot10   | T1 Unlk | T1 Lv5  | T2 Unlk | T2 Lv10 | NextUnlk | Segment',
  );
  console.log('-'.repeat(96));

  for (const row of run.planetMilestones) {
    console.log(
      [
        pad(row.planetId, 10),
        padStart(formatDuration(row.rotationLv10), 7),
        padStart(formatDuration(row.track1Unlock), 7),
        padStart(formatDuration(row.track1Lv5), 7),
        padStart(formatDuration(row.track2Unlock), 7),
        padStart(formatDuration(row.track2Lv10), 7),
        padStart(formatDuration(row.nextPlanetUnlock), 8),
        padStart(formatDuration(row.segmentSeconds), 7),
      ].join(' | '),
    );
  }

  console.log('\nEnding EPS by planet (passive):');
  const passiveTotal = Object.values(run.endingPlanetEps).reduce(
    (sum, eps) => sum + (eps ?? 0),
    0,
  );
  for (const [planetId, eps] of Object.entries(run.endingPlanetEps)) {
    const share = passiveTotal > 0 ? ((eps ?? 0) / passiveTotal) * 100 : 0;
    console.log(
      `  ${pad(planetId, 8)} ${padStart(formatNumber(eps ?? 0), 10)}/s  (${share.toFixed(1)}%)`,
    );
  }
  console.log(
    `  ${pad('system*', 8)} ${padStart(formatNumber(run.endingSystemEps), 10)}/s  (includes frontier spin)`,
  );

  printShareTable(run.productionShares);
}

function printShareTable(shares: PlanetShareSnapshot[]): void {
  const major = shares.filter(
    (snap) =>
      snap.label === 'Run start' ||
      snap.label.startsWith('Unlock ') ||
      snap.label.endsWith('track2 Lv.10') ||
      snap.label === 'Prestige ready' ||
      /\+\d+s$/.test(snap.label),
  );

  if (major.length === 0) {
    return;
  }

  console.log('\nProduction share at major milestones:');
  for (const snap of major) {
    const parts = Object.entries(snap.shares)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .map(
        ([id, share]) => `${id} ${((share ?? 0) * 100).toFixed(0)}%`,
      )
      .join(', ');
    console.log(
      `  t=${padStart(formatDuration(snap.atSeconds), 8)} | ${pad(snap.label, 22)} | EPS ${formatNumber(snap.totalEps)}/s | ${parts}`,
    );
  }
}

export function printComparisonTable(rows: ProfileComparisonRow[]): void {
  console.log('\n' + '='.repeat(96));
  console.log('ACTIVE VS IDLE (and Casual / Optimizer)');
  console.log('='.repeat(96));
  console.log(
    'Milestone                        | Idle     | Casual   | Active   | Optim.   | Act/Idle | Cas/Idle',
  );
  console.log('-'.repeat(110));

  for (const row of rows) {
    console.log(
      [
        pad(row.milestone, 32),
        padStart(formatDuration(row.idleSeconds), 8),
        padStart(formatDuration(row.casualSeconds), 8),
        padStart(formatDuration(row.activeSeconds), 8),
        padStart(formatDuration(row.optimizerSeconds), 8),
        padStart(formatRatio(row.activeIdleRatio), 8),
        padStart(formatRatio(row.casualIdleRatio), 8),
      ].join(' | '),
    );
  }
}

export function printPrestigeCampaign(campaign: PrestigeCampaignResult): void {
  const strategy = STARDUST_STRATEGIES[campaign.strategyId];
  console.log('\n' + '-'.repeat(96));
  console.log(
    `PRESTIGE CYCLES — ${PLAYER_PROFILES[campaign.profileId].label} / ${strategy.label}`,
  );
  console.log(strategy.description);
  console.log(
    'Run | Prestige-ready | Neptune unlock | vs Run1 | Cosmic | Orbital | Reserves | Dust spent',
  );
  console.log('-'.repeat(96));

  const run1 = campaign.runs.find((run) => run.runNumber === 1);
  const run1Time = run1?.prestigeReadySeconds ?? run1?.elapsedSeconds ?? null;

  for (const runNumber of PRESTIGE_REPORT_RUNS) {
    const run = campaign.runs.find((item) => item.runNumber === runNumber);
    if (!run) {
      continue;
    }
    const time = run.prestigeReadySeconds ?? run.elapsedSeconds;
    const vsRun1 =
      run1Time && run1Time > 0 ? `${((time / run1Time) * 100).toFixed(0)}%` : '—';

    console.log(
      [
        padStart(String(run.runNumber), 3),
        padStart(formatDuration(time), 14),
        padStart(formatDuration(run.neptuneUnlockSeconds), 14),
        padStart(vsRun1, 6),
        padStart(String(run.prestigeLevels.cosmicMomentum), 6),
        padStart(String(run.prestigeLevels.orbitalKnowledge), 7),
        padStart(String(run.prestigeLevels.deepSpaceReserves), 8),
        padStart(String(run.stardustSpentThisBreak), 10),
      ].join(' | '),
    );
  }
}

export function printStrategyComparison(
  campaigns: PrestigeCampaignResult[],
): void {
  console.log('\n' + '='.repeat(96));
  console.log('STARDUST STRATEGY COMPARISON (time to prestige-ready)');
  console.log('='.repeat(96));

  const header =
    'Strategy                 | ' +
    PRESTIGE_REPORT_RUNS.map((n) => padStart(`R${n}`, 8)).join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const campaign of campaigns) {
    const label = pad(STARDUST_STRATEGIES[campaign.strategyId].label, 24);
    const cells = PRESTIGE_REPORT_RUNS.map((runNumber) => {
      const run = campaign.runs.find((item) => item.runNumber === runNumber);
      return padStart(
        formatDuration(run?.prestigeReadySeconds ?? run?.elapsedSeconds),
        8,
      );
    });
    console.log([label, ...cells].join(' | '));
  }
}

export function printWarnings(warnings: BalanceWarning[]): void {
  console.log('\n' + '='.repeat(96));
  console.log('BALANCE WARNINGS');
  console.log('='.repeat(96));

  if (warnings.length === 0) {
    console.log('No automatic warnings fired.');
    return;
  }

  const order = { critical: 0, warn: 1, info: 2 } as const;
  const sorted = [...warnings].sort(
    (a, b) => order[a.severity] - order[b.severity],
  );

  for (const warning of sorted) {
    console.log(`[${warning.severity.toUpperCase()}] ${warning.code}: ${warning.message}`);
  }
}

export function printConfigSummary(
  strategyIds: StardustStrategyId[],
): void {
  console.log('Orbit Balance Harness');
  console.log('Simulation only — does not modify game economy values.\n');
  console.log('Profiles:');
  for (const profile of Object.values(PLAYER_PROFILES)) {
    console.log(
      `  - ${profile.label}: spin ${profile.frontierSpinMultiplier}x, policy=${profile.purchasePolicy}`,
    );
  }
  console.log('Stardust strategies:');
  for (const id of strategyIds) {
    const strategy = STARDUST_STRATEGIES[id];
    console.log(`  - ${strategy.label}: ${strategy.description}`);
  }
}
