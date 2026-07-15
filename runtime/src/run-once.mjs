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
const syncToju = args.includes('--sync-toju');
const manifestArg = args.find((a) => !a.startsWith('--'));

if (syncToju && !pay) {
  console.error('--sync-toju requiere --pay (toju usa x402 mainnet)');
  process.exit(1);
}

if (manifestArg) {
  process.env.AGENFT_MANIFEST_PATH = manifestArg.startsWith('/')
    ? manifestArg
    : undefined;
}

const userMessage =
  process.env.AGENFT_USER_MESSAGE ??
  'Di en una frase quién eres y qué proyecto representas.';

const ctx = resolveAgentEnv();
const out = await runTurn({
  ...ctx,
  userMessage,
  pay,
  force,
  syncMemory: syncToju,
  quiet: false,
});

if (!out.ok) {
  console.error('\n🛡️', out.dormant ? 'Reflejos: DORMANT —' : 'Error —', out.reason);
  if (out.budgetStatus) console.error('Caps:', out.budgetStatus);
  process.exit(out.exitCode ?? 1);
}

console.log('User:', userMessage);
console.log('Assistant:', out.assistantText);
if (out.payer) console.log('Payer:', out.payer);
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
