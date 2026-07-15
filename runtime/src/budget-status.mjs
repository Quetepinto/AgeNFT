#!/usr/bin/env node
/** GET /budget/status equivalent — CLI. */
import { loadManifest } from './manifest-loader.mjs';
import { getBudgetStatus, checkPayerBalanceUsdc, loadLedger } from './budget-tracker.mjs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const manifestPath = process.argv[2] ?? '../docs/manifest/examples/unit-1-lab.json';
const { manifest, dataDir } = loadManifest(manifestPath);

const status = getBudgetStatus(manifest, dataDir);
const ledger = loadLedger(dataDir);

let payer = null;
const cred = join(homedir(), '.credentials/agenft-base-sepolia.json');
if (existsSync(cred)) {
  payer = JSON.parse(readFileSync(cred, 'utf8')).address;
}

const balance = payer ? await checkPayerBalanceUsdc(payer) : null;

console.log(
  JSON.stringify(
    {
      agent: manifest.name,
      agentId: manifest.identity.agentId,
      tba: manifest.treasury.address,
      budget: status,
      payer: payer ? { address: payer, usdcMainnet: balance?.usdc ?? null } : null,
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
