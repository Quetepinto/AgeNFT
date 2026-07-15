#!/usr/bin/env node
/**
 * Exporta JSON público para la dApp (sin secrets).
 * Uso: node scripts/dapp/export-public-data.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DAPP_ASSETS = join(ROOT, 'dapp/assets');
const manifestPath = join(ROOT, 'docs/manifest/examples/unit-1-lab.json');

const { loadManifest } = await import(join(ROOT, 'runtime/src/manifest-loader.mjs'));
const { getBudgetStatus, loadLedger } = await import(join(ROOT, 'runtime/src/budget-tracker.mjs'));

const { manifest, dataDir } = loadManifest(manifestPath);
const tokenId = manifest.identity.agentId;

mkdirSync(join(DAPP_ASSETS, 'agents'), { recursive: true });

const agent = {
  tokenId,
  name: manifest.name,
  description: manifest.description,
  image: manifest.image,
  status: 'beta-lab',
  chain: { id: 84532, name: 'Base Sepolia', rpc: 'https://sepolia.base.org' },
  nft: manifest.identity.nft,
  tba: manifest.treasury.address,
  budgetProfile: manifest.budget?.profile,
  globalCapPerDayUsd: manifest.budget?.global?.perDayUsdHardCap,
  brainCaps: manifest.budget?.organs?.brain?.limits,
  chat: {
    telegram: manifest.gateways?.chat?.find((c) => c.platform === 'telegram' && c.enabled)?.handle ?? null,
  },
  updatedAt: new Date().toISOString(),
};

writeFileSync(join(DAPP_ASSETS, `agents/${tokenId}.json`), `${JSON.stringify(agent, null, 2)}\n`);

let budgetSnapshot = {
  tokenId,
  agent: manifest.name,
  exportedAt: new Date().toISOString(),
  note: 'Snapshot estático — actualizar con npm run dapp:export',
  budget: null,
  recentEvents: [],
};

const ledgerPath = join(dataDir, 'budget/ledger.json');
if (existsSync(ledgerPath)) {
  const status = getBudgetStatus(manifest, dataDir);
  const ledger = loadLedger(dataDir);
  budgetSnapshot = {
    tokenId,
    agent: manifest.name,
    exportedAt: new Date().toISOString(),
    budget: status,
    recentEvents: (ledger.events ?? []).slice(0, 8),
    manifestCaps: {
      brain: manifest.budget?.organs?.brain?.limits,
      globalPerDay: manifest.budget?.global?.perDayUsdHardCap,
    },
  };
}

writeFileSync(
  join(DAPP_ASSETS, `budget-${tokenId}.json`),
  `${JSON.stringify(budgetSnapshot, null, 2)}\n`,
);

console.log('✓', join(DAPP_ASSETS, `agents/${tokenId}.json`));
console.log('✓', join(DAPP_ASSETS, `budget-${tokenId}.json`));
