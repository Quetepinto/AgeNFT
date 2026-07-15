#!/usr/bin/env node
/**
 * Doctor lite — probe tx402 + budget. Para cron Hermes (--no-agent).
 * stdout vacío si healthy; alerta si impaired/dormant.
 */
import { resolveAgentEnv } from './agenft-env.mjs';
import { resolveBrain } from './manifest-loader.mjs';
import { inferBrain } from './brain-tx402.mjs';
import { checkBrainBudget, checkPayerBalanceUsdc } from './budget-tracker.mjs';
import { loadPayerAccount } from './payer-key.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ctx = resolveAgentEnv();
const { manifest, dataDir } = ctx;
const brain = resolveBrain(manifest);

const budget = checkBrainBudget(manifest, dataDir, { pay: true });
const payer = loadPayerAccount();
let payerBal = null;
if (payer) payerBal = await checkPayerBalanceUsdc(payer.address);

const probe = await inferBrain({
  brain,
  systemPrompt: 'Doctor probe — responde OK',
  userMessage: 'ping',
  pay: false,
});

let health = 'healthy';
const issues = [];

if (!budget.allowed) {
  health = 'dormant';
  issues.push(`budget: ${budget.reason}`);
}

if (payer && payerBal && payerBal.usdc < 0.002) {
  health = health === 'dormant' ? 'dormant' : 'impaired';
  issues.push(`payer USDC bajo: ${payerBal.usdc.toFixed(6)}`);
}

if (!probe.ok) {
  health = health === 'dormant' ? 'dormant' : 'impaired';
  issues.push(`brain probe: ${probe.message ?? probe.status}`);
} else if (probe.status === 402) {
  // 402 esperado en probe — cerebro alcanzable
}

const report = {
  at: new Date().toISOString(),
  agent: manifest.name,
  agentId: manifest.identity.agentId,
  tokenId: ctx.tokenId,
  tba: manifest.treasury.address,
  health,
  issues,
  budget: budget.status,
  payer: payer ? { address: payer.address, usdcMainnet: payerBal?.usdc ?? null } : null,
  brainProbe: { ok: probe.ok, status: probe.status },
};

mkdirSync(join(dataDir, 'doctor'), { recursive: true });
writeFileSync(
  join(dataDir, 'doctor/latest-probe.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (health !== 'healthy') {
  console.log(
    `⚠️ ageNFT Doctor [${health}] Unit-1 #${manifest.identity.agentId}\n` +
      issues.map((i) => `• ${i}`).join('\n') +
      `\nTBA: ${manifest.treasury.address}`,
  );
  process.exit(health === 'dormant' ? 2 : 1);
}

process.exit(0);
