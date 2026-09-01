import type { PlanetId } from '../../src/config/planets';
import {
  PRESTIGE_REPORT_RUNS,
  WARNING_THRESHOLDS,
  type PlayerProfileId,
} from './config';
import type {
  BalanceWarning,
  PlanetShareSnapshot,
  PrestigeCampaignResult,
  ProfileComparisonRow,
  RunResult,
} from './types';

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return '∞';
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

export function collectRunWarnings(run: RunResult): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];

  for (const poor of run.poorPaybackPurchases.slice(0, 12)) {
    warnings.push({
      severity: 'warn',
      code: 'poor_payback',
      message: `${run.profileId} run ${run.runNumber}: ${poor.name} payback ${formatDuration(poor.paybackSeconds)} at t=${formatDuration(poor.atSeconds)}`,
    });
  }

  if (run.poorPaybackPurchases.length > 12) {
    warnings.push({
      severity: 'info',
      code: 'poor_payback_more',
      message: `${run.profileId} run ${run.runNumber}: ${run.poorPaybackPurchases.length - 12} additional poor-payback purchases omitted`,
    });
  }

  const segments = run.planetMilestones
    .map((row) => row.segmentSeconds)
    .filter((value): value is number => value != null && value > 0);

  if (segments.length >= 3) {
    const sorted = [...segments].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)]!;

    for (const row of run.planetMilestones) {
      if (row.segmentSeconds == null) {
        continue;
      }

      if (row.segmentSeconds >= median * WARNING_THRESHOLDS.longSegmentFactor) {
        warnings.push({
          severity: 'warn',
          code: 'long_segment',
          message: `${run.profileId}: ${row.planetId} segment ${formatDuration(row.segmentSeconds)} is much longer than median ${formatDuration(median)}`,
        });
      }

      if (
        row.segmentSeconds <= median * WARNING_THRESHOLDS.shortSegmentFactor ||
        row.segmentSeconds <= WARNING_THRESHOLDS.instantSegmentSeconds
      ) {
        warnings.push({
          severity: 'warn',
          code: 'instant_segment',
          message: `${run.profileId}: ${row.planetId} segment ${formatDuration(row.segmentSeconds)} is nearly instant vs median ${formatDuration(median)}`,
        });
      }
    }
  }

  for (const snap of run.productionShares) {
    analyzeShareSnapshot(warnings, run, snap);
  }

  return warnings;
}

function analyzeShareSnapshot(
  warnings: BalanceWarning[],
  run: RunResult,
  snap: PlanetShareSnapshot,
): void {
  const matchPlus = /^(\w+) \+\d+s$/.exec(snap.label);
  if (matchPlus) {
    const planetId = matchPlus[1] as PlanetId;
    const share = snap.shares[planetId] ?? 0;
    if (share < WARNING_THRESHOLDS.weakNewPlanetShare) {
      warnings.push({
        severity: 'warn',
        code: 'weak_new_planet',
        message: `${run.profileId}: ${planetId} only ${(share * 100).toFixed(1)}% of system EPS shortly after unlock (${snap.label})`,
      });
    }
  }

  const matchUnlock = /^Unlock (\w+)$/.exec(snap.label);
  if (matchUnlock) {
    // Check whether previous planet still dominates at the unlock moment.
    const planetId = matchUnlock[1] as PlanetId;
    let dominantId: PlanetId | null = null;
    let dominantShare = 0;

    for (const [id, share] of Object.entries(snap.shares) as Array<
      [PlanetId, number]
    >) {
      if (id === planetId) {
        continue;
      }
      if (share > dominantShare) {
        dominantShare = share;
        dominantId = id;
      }
    }

    if (
      dominantId &&
      dominantShare >= WARNING_THRESHOLDS.dominantOldPlanetShare
    ) {
      warnings.push({
        severity: 'info',
        code: 'old_planet_dominates_at_unlock',
        message: `${run.profileId}: at unlock ${planetId}, ${dominantId} still ${(dominantShare * 100).toFixed(0)}% of EPS`,
      });
    }
  }

  const matchTrack = /^(\w+) track2 Lv\.10$/.exec(snap.label);
  if (matchTrack) {
    const planetId = matchTrack[1] as PlanetId;
    // If an older planet still dominates when this planet finishes, new planet may be irrelevant.
    let maxOther = 0;
    let maxOtherId: PlanetId | null = null;
    for (const [id, share] of Object.entries(snap.shares) as Array<
      [PlanetId, number]
    >) {
      if (id === planetId) {
        continue;
      }
      if (share > maxOther) {
        maxOther = share;
        maxOtherId = id;
      }
    }

    const selfShare = snap.shares[planetId] ?? 0;
    if (
      maxOtherId &&
      maxOther >= WARNING_THRESHOLDS.dominantOldPlanetShare &&
      selfShare < 0.15
    ) {
      warnings.push({
        severity: 'critical',
        code: 'new_planet_irrelevant',
        message: `${run.profileId}: at ${planetId} track2 Lv.10, ${maxOtherId} still ${(maxOther * 100).toFixed(0)}% EPS while ${planetId} is only ${(selfShare * 100).toFixed(0)}%`,
      });
    }
  }
}

export function collectComparisonWarnings(
  rows: ProfileComparisonRow[],
): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];

  for (const row of rows) {
    if (
      row.activeIdleRatio != null &&
      row.activeIdleRatio > WARNING_THRESHOLDS.activeIdleRatioWarn
    ) {
      warnings.push({
        severity: 'warn',
        code: 'active_too_fast',
        message: `Active is ${row.activeIdleRatio.toFixed(2)}x faster than Idle at "${row.milestone}" (threshold ${WARNING_THRESHOLDS.activeIdleRatioWarn}x)`,
      });
    }
  }

  return warnings;
}

export function collectPrestigeWarnings(
  campaign: PrestigeCampaignResult,
): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];
  const byRun = new Map(campaign.runs.map((run) => [run.runNumber, run]));

  for (let i = 0; i < PRESTIGE_REPORT_RUNS.length; i += 1) {
    const runNumber = PRESTIGE_REPORT_RUNS[i]!;
    const prevNumber = i > 0 ? PRESTIGE_REPORT_RUNS[i - 1]! : null;
    if (prevNumber == null) {
      continue;
    }

    const current = byRun.get(runNumber);
    const previous = byRun.get(prevNumber);
    if (!current || !previous) {
      continue;
    }

    const prevTime = previous.prestigeReadySeconds ?? previous.elapsedSeconds;
    const curTime = current.prestigeReadySeconds ?? current.elapsedSeconds;
    if (prevTime <= 0) {
      continue;
    }

    const improvement = (prevTime - curTime) / prevTime;
    if (improvement < WARNING_THRESHOLDS.weakPrestigeImprovement) {
      warnings.push({
        severity: 'warn',
        code: 'weak_prestige_gain',
        message: `${campaign.profileId}/${campaign.strategyId}: Run ${runNumber} only ${(improvement * 100).toFixed(1)}% faster than Run ${prevNumber} (${formatDuration(curTime)} vs ${formatDuration(prevTime)})`,
      });
    }
  }

  return warnings;
}

export function buildProfileComparison(
  runsByProfile: Partial<Record<PlayerProfileId, RunResult>>,
): ProfileComparisonRow[] {
  const idle = runsByProfile.idle;
  if (!idle) {
    return [];
  }

  const rows: ProfileComparisonRow[] = [];

  const push = (
    milestone: string,
    pick: (run: RunResult) => number | null,
  ) => {
    const idleSeconds = pick(idle);
    const casualSeconds = runsByProfile.casual
      ? pick(runsByProfile.casual)
      : null;
    const activeSeconds = runsByProfile.active
      ? pick(runsByProfile.active)
      : null;
    const optimizerSeconds = runsByProfile.optimizer
      ? pick(runsByProfile.optimizer)
      : null;

    rows.push({
      milestone,
      idleSeconds,
      casualSeconds,
      activeSeconds,
      optimizerSeconds,
      activeIdleRatio:
        idleSeconds && activeSeconds && idleSeconds > 0
          ? idleSeconds / activeSeconds
          : null,
      casualIdleRatio:
        idleSeconds && casualSeconds && idleSeconds > 0
          ? idleSeconds / casualSeconds
          : null,
    });
  };

  for (const planet of idle.planetMilestones) {
    const id = planet.planetId;
    push(`${id} Rotation Lv.10`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.rotationLv10 ??
      null,
    );
    push(`${id} Track1 unlock`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.track1Unlock ??
      null,
    );
    push(`${id} Track1 Lv.5`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.track1Lv5 ?? null,
    );
    push(`${id} Track2 unlock`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.track2Unlock ??
      null,
    );
    push(`${id} Track2 Lv.10`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.track2Lv10 ?? null,
    );
    push(`${id} next planet unlock`, (run) =>
      run.planetMilestones.find((row) => row.planetId === id)?.nextPlanetUnlock ??
      null,
    );
  }

  push('Neptune unlock', (run) => run.neptuneUnlockSeconds);
  push('Prestige ready', (run) => run.prestigeReadySeconds);

  return rows;
}
