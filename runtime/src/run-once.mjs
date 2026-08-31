#!/usr/bin/env node
/**
 * Un turno ageNFT: manifiesto → budget check → preload memoria → cerebro → autowrite.
 *
 * Sin USDC (default): probe 402 en tx402.ai
 * Con USDC: --pay + wallet con USDC Base mainnet
 * --sync-toju: sube cápsula memoria a toju tras autowrite (requiere --pay)
 */
import { resolveAgentEnv } from './agenft-env.mjs';
import { runTurn } from './run-turn.mjs';

const args = process.argv.slice(2);
const pay = args.includes('--pay');
const force = args.includes('--force');
const hose = args.includes('--hose') || process.env.AGENFT_BRAIN_MODE === 'hose';
const syncToju = args.includes('--sync-toju');
const positional = args.filter((a) => !a.startsWith('--'));
const manifestArg = positional.find((a) => a.endsWith('.json'));

if (manifestArg) {
  process.env.AGENFT_MANIFEST_PATH = manifestArg.startsWith('/')
    ? manifestArg
    : manifestArg;
}

const userMessage =
  process.env.AGENFT_USER_MESSAGE?.trim() ||
  positional.filter((a) => a !== manifestArg).join(' ').trim() ||
  'Di en una frase quién eres y qué proyecto representas.';

if (syncToju && !pay) {
  console.error('--sync-toju requiere --pay (toju usa x402 mainnet)');
  process.exit(1);
}
if (hose && pay) {
  console.error('--hose incompatible con --pay');
  process.exit(1);
}

const ctx = resolveAgentEnv();
const out = await runTurn({
  ...ctx,
  userMessage,
  pay,
  force,
  syncMemory: syncToju,
  hose,
  quiet: false,
});

if (!out.ok) {
  console.error('\n🛡️', out.dormant ? 'Reflejos: DORMANT —' : 'Error —', out.reason);
  if (out.budgetStatus) console.error('Caps:', out.budgetStatus);
  process.exit(out.exitCode ?? 1);
}

console.log('User:', userMessage);
console.log('Assistant:', out.assistantText);
if (out.payer) console.log('Payer:', out.payer, out.payerMode ? `(${out.payerMode})` : '');
if (out.costUsd != null) console.log('Cost USD:', out.costUsd.toFixed(6));
console.log('Budget recorded:', out.budget);
console.log('---');
console.log('memory autowrite:', out.memory.latestPath);
console.log('L0:', out.memory.l0Summary);
console.log('experientialHash:', out.memory.experientialHash);
if (out.sync) {
  console.log('memory sync:', out.sync.uri, out.sync.fallback ? '(lab-remote fallback)' : '');
  console.log('sync cost USD:', out.sync.costUsd);
}
