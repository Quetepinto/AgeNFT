#!/usr/bin/env node
/**
 * Entrada Hermes — un mensaje → manifiesto + budget + cerebro ageNFT.
 *
 * Uso:
 *   node src/hermes-turn.mjs "¿Quién eres?"
 *   echo "hola" | node src/hermes-turn.mjs
 *   AGENFT_USER_MESSAGE="hola" node src/hermes-turn.mjs --pay --plain
 */
import { resolveAgentEnv } from './agenft-env.mjs';
import { runTurn } from './run-turn.mjs';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));

const pay = flags.includes('--pay');
const force = flags.includes('--force');
const syncMemory = flags.includes('--sync-memory');
const plain = flags.includes('--plain');
const quiet = flags.includes('--quiet') || plain;

const userMessage =
  process.env.AGENFT_USER_MESSAGE?.trim() ||
  positional.join(' ').trim() ||
  (await readStdin());

if (!userMessage) {
  console.error('Uso: hermes-turn.mjs [--pay] [--plain] "mensaje"');
  process.exit(1);
}

const ctx = resolveAgentEnv();
const out = await runTurn({
  ...ctx,
  userMessage,
  pay,
  force,
  syncMemory,
  quiet,
});

if (plain) {
  if (out.ok) {
    console.log(out.assistantText);
    process.exit(0);
  }
  console.error(out.dormant ? `DORMANT: ${out.reason}` : out.reason);
  process.exit(out.exitCode ?? 1);
}

console.log(JSON.stringify(out, null, 2));
process.exit(out.exitCode ?? (out.ok ? 0 : 1));

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}
