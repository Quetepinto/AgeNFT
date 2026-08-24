#!/usr/bin/env node
/** Estado de presupuesto + tesoro TBA — default Unit-Mainnet. */
import { resolveAgentEnv } from './agenft-env.mjs';
import { getBudgetStatus, checkPayerBalanceUsdc, loadLedger } from './budget-tracker.mjs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const manifestArg = args.find((a) => !a.startsWith('--'));
if (manifestArg) process.env.AGENFT_MANIFEST_PATH = resolve(manifestArg);

const { manifest, dataDir, tokenId } = resolveAgentEnv();
const status = getBudgetStatus(manifest, dataDir);
const ledger = loadLedger(dataDir);
const tba = manifest.treasury.address;
const tbaBal = await checkPayerBalanceUsdc(tba);

console.log(
  JSON.stringify(
    {
      agent: manifest.name,
      tokenId,
      agentId: manifest.identity.agentId,
      tba,
      tbaUsdc: tbaBal.usdc,
      budget: status,
      recentEvents: (ledger.events ?? []).slice(0, 5),
      manifestCaps: {
        brain: manifest.budget?.organs?.brain?.limits,
        globalPerDay: manifest.budget?.global?.perDayUsdHardCap,
        minOperatingUsdc: manifest.budget?.minOperatingBalanceUsdc,
      },
    },
    null,
    2,
  ),
);
