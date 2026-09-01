/**
 * Orbit balance harness — full progression + prestige simulation.
 *
 * Does not modify game economy / prestige / UI.
 *
 *   npx tsx scripts/balance/run.ts
 *   npm run balance
 */
import {
  DEFAULT_STARDUST_STRATEGY,
  PLAYER_PROFILES,
  PRESTIGE_CYCLES_TO_SIMULATE,
  type PlayerProfileId,
  type StardustStrategyId,
} from './config';
import { simulatePrestigeCampaign, simulateRun } from './engine';
import {
  printComparisonTable,
  printConfigSummary,
  printPrestigeCampaign,
  printProfileBanner,
  printRunReport,
  printStrategyComparison,
  printWarnings,
} from './report';
import type { BalanceWarning, RunResult } from './types';
import {
  buildProfileComparison,
  collectComparisonWarnings,
  collectPrestigeWarnings,
  collectRunWarnings,
} from './warnings';

const PROFILE_ORDER: PlayerProfileId[] = [
  'idle',
  'casual',
  'active',
  'optimizer',
];

/** Strategies compared on Idle + Active multi-prestige campaigns. */
const STRATEGY_COMPARE_IDS: StardustStrategyId[] = [
  'balanced_cheapest',
  'cosmic_only',
  'orbital_only',
  'cosmic_then_orbital',
  'equalize_levels',
  'reserves_only',
];

function main(): void {
  const started = Date.now();
  printConfigSummary(STRATEGY_COMPARE_IDS);

  const warnings: BalanceWarning[] = [];
  const firstRuns: Partial<Record<PlayerProfileId, RunResult>> = {};

  // --- Run 1 detailed reports for every profile ---
  for (const profileId of PROFILE_ORDER) {
    printProfileBanner(profileId);
    const { result } = simulateRun({
      profileId,
      strategyId: null,
      runNumber: 1,
    });
    firstRuns[profileId] = result;
    printRunReport(result);
    warnings.push(...collectRunWarnings(result));
  }

  // --- Active vs Idle comparison ---
  const comparison = buildProfileComparison(firstRuns);
  printComparisonTable(comparison);
  warnings.push(...collectComparisonWarnings(comparison));

  // --- Prestige campaigns (default strategy) for all profiles ---
  console.log('\n' + '='.repeat(96));
  console.log(
    `PRESTIGE CAMPAIGNS — default strategy: ${DEFAULT_STARDUST_STRATEGY} (${PRESTIGE_CYCLES_TO_SIMULATE} cycles)`,
  );
  console.log('='.repeat(96));

  for (const profileId of PROFILE_ORDER) {
    const campaign = simulatePrestigeCampaign(
      profileId,
      DEFAULT_STARDUST_STRATEGY,
      PRESTIGE_CYCLES_TO_SIMULATE,
    );
    printPrestigeCampaign(campaign);
    warnings.push(...collectPrestigeWarnings(campaign));
  }

  // --- Strategy comparison on Idle + Active ---
  for (const profileId of ['idle', 'active'] as PlayerProfileId[]) {
    console.log('\n' + '='.repeat(96));
    console.log(
      `STRATEGY SWEEP — ${PLAYER_PROFILES[profileId].label} (${PRESTIGE_CYCLES_TO_SIMULATE} cycles each)`,
    );
    console.log('='.repeat(96));

    const campaigns = STRATEGY_COMPARE_IDS.map((strategyId) =>
      simulatePrestigeCampaign(
        profileId,
        strategyId,
        PRESTIGE_CYCLES_TO_SIMULATE,
      ),
    );

    printStrategyComparison(campaigns);
    for (const campaign of campaigns) {
      warnings.push(...collectPrestigeWarnings(campaign));
    }
  }

  printWarnings(warnings);

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nHarness finished in ${seconds}s.`);
}

main();
