#!/usr/bin/env node
/**
 * Exporta JSON público para la dApp (sin secrets).
 *
 * Uso:
 *   node scripts/dapp/export-public-data.mjs                    # Unit-Mainnet (default)
 *   node scripts/dapp/export-public-data.mjs unit-mainnet.json
 *   node scripts/dapp/export-public-data.mjs unit-1-lab.json    # legacy Sepolia
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DAPP_ASSETS = join(ROOT, 'dapp/assets');

const manifestArg = process.argv[2] ?? 'unit-mainnet.json';
const manifestPath = join(ROOT, 'docs/manifest/examples', manifestArg);

const { loadManifest } = await import(join(ROOT, 'runtime/src/manifest-loader.mjs'));
const { getBudgetStatus, loadLedger } = await import(join(ROOT, 'runtime/src/budget-tracker.mjs'));
const mintMainnet = join(ROOT, 'docs/research/lab/unit-mainnet-mint.json');

const { manifest, dataDir } = loadManifest(manifestPath);
const tokenId = String(manifest.identity.agentId);

const isMainnet = manifest.identity.chain === 'eip155:8453';
const chain = isMainnet
  ? {
      id: 8453,
      name: 'Base mainnet',
      rpc: 'https://mainnet.base.org',
      explorer: 'https://basescan.org',
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    }
  : {
      id: 84532,
      name: 'Base Sepolia',
      rpc: 'https://sepolia.base.org',
      explorer: 'https://sepolia.basescan.org',
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    };

mkdirSync(join(DAPP_ASSETS, 'agents'), { recursive: true });

const tgEntry = manifest.gateways?.chat?.find((c) => c.platform === 'telegram' && c.enabled);
const telegramHandle = tgEntry?.handle ?? (isMainnet ? 'Unit1_agent_bot' : null);

const agent = {
  tokenId,
  name: manifest.name,
  description: manifest.description,
  image: manifest.image,
  status: isMainnet ? 'mvp-mainnet' : 'beta-lab',
  chain,
  nft: manifest.identity.nft,
  registry: manifest.identity.registry,
  tba: manifest.treasury.address,
  budgetProfile: manifest.budget?.profile,
  globalCapPerDayUsd: manifest.budget?.global?.perDayUsdHardCap,
  brainCaps: manifest.budget?.organs?.brain?.limits,
  payerMode: isMainnet ? 'tba-sovereign' : 'eoa-lab',
  chat: { telegram: telegramHandle },
  links: isMainnet
    ? {
        nft: `${chain.explorer}/token/${manifest.identity.nft.contract}?a=${tokenId}`,
        tba: `${chain.explorer}/address/${manifest.treasury.address}`,
      }
    : {},
  updatedAt: new Date().toISOString(),
};

if (isMainnet && existsSync(mintMainnet)) {
  const mint = JSON.parse(readFileSync(mintMainnet, 'utf8'));
  agent.mintTx = mint.txHash;
}

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

// Índice público para la home
const index = {
  defaultAgentId: isMainnet ? tokenId : '1',
  agents: [
    {
      tokenId,
      name: manifest.name,
      status: agent.status,
      chain: chain.name,
      path: `/agent/${tokenId}/`,
    },
  ],
  updatedAt: new Date().toISOString(),
};

if (tokenId !== '1' && existsSync(join(DAPP_ASSETS, 'agents/1.json'))) {
  const main = JSON.parse(readFileSync(join(DAPP_ASSETS, 'agents/1.json'), 'utf8'));
  index.agents.unshift({
    tokenId: '1',
    name: main.name,
    status: main.status,
    chain: main.chain?.name,
    path: '/agent/1/',
  });
  index.defaultAgentId = '1';
}

writeFileSync(join(DAPP_ASSETS, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);

console.log('✓', join(DAPP_ASSETS, `agents/${tokenId}.json`));
console.log('✓', join(DAPP_ASSETS, `budget-${tokenId}.json`));
console.log('✓', join(DAPP_ASSETS, 'index.json'));
