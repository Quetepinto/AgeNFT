#!/usr/bin/env node
/**
 * Smoke offline Bloque 3.2 — sin USDC, sin toju, sin kubo, sin red (salvo nada).
 *
 * Corre:
 *   1) applyMemoryTransferPolicy unit checks
 *   2) transfer-sim full (isolated+seed)
 *   3) transfer-sim reset-total (isolated+seed)
 *   4) sync lab-remote → wipe → hydrate → preload (restart-style)
 *
 * Usage: npm run memory:smoke
 */
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  existsSync,
  readFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const runtimeDir = join(__dirname, '..');

function runNode(script, args = [], env = {}) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: runtimeDir,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status ?? 1;
}

console.log('=== ageNFT memory:smoke (Bloque 3.2) ===\n');

// 1) unit: applyMemoryTransferPolicy
console.log('1/4 applyMemoryTransferPolicy…');
const {
  applyMemoryTransferPolicy,
  buildCapsule,
  syncCapsuleToLabRemote,
  hydrateLocalFromPointer,
  loadPointer,
} = await import('./memory-toju.mjs');
const { preloadContext } = await import('./memory-local.mjs');

const iso = mkdtempSync(join(tmpdir(), 'agenft-smoke-'));
const dataDir = join(iso, 'data');
mkdirSync(join(dataDir, 'memory/deltas'), { recursive: true });
const facts = ['Usuario: smoke', 'Agente: ok'];
const l0 = 'Unit-Mainnet: smoke; ok';
const latest = {
  updatedAt: new Date().toISOString(),
  l0Summary: l0,
  recentFacts: facts,
  experientialHash: `0x${createHash('sha256')
    .update(JSON.stringify({ recentFacts: facts, l0Summary: l0 }))
    .digest('hex')}`,
  deltaCount: 1,
};
writeFileSync(join(dataDir, 'memory/latest.json'), `${JSON.stringify(latest, null, 2)}\n`);

const fakeManifest = {
  name: 'Unit-Mainnet',
  identity: { agentId: 1 },
  organs: { memory: { transferPolicy: 'owner-choice-at-transfer' } },
};
const cap = buildCapsule({ manifest: fakeManifest, dataDir });
const full = applyMemoryTransferPolicy(cap, 'full');
const reset = applyMemoryTransferPolicy(cap, 'reset-total', {
  agentName: 'Unit-Mainnet',
});
if (full.transferApplied !== 'full' || full.latest.experientialHash !== latest.experientialHash) {
  console.error('❌ full policy failed');
  process.exit(1);
}
if (
  reset.transferApplied !== 'reset-total' ||
  reset.latest.recentFacts.length !== 0 ||
  reset.vault0Excluded !== true
) {
  console.error('❌ reset-total policy failed');
  process.exit(1);
}
console.log('   ✅ policy helpers OK\n');

// 2–3) transfer-sim both policies (isolated)
console.log('2/4 transfer-sim --policy=full…');
let code = runNode('src/memory-transfer-sim.mjs', [
  '--seed',
  '--isolated',
  '--policy=full',
]);
if (code !== 0) process.exit(code);

console.log('\n3/4 transfer-sim --policy=reset-total…');
code = runNode('src/memory-transfer-sim.mjs', [
  '--seed',
  '--isolated',
  '--policy=reset-total',
]);
if (code !== 0) process.exit(code);

// 4) restart-style: sync → wipe → hydrate
console.log('\n4/4 restart-style lab-remote…');
const packDir = join(runtimeDir, 'pack/unit-mainnet');
if (!existsSync(join(packDir, 'soul.md'))) {
  console.error('❌ pack unit-mainnet missing');
  process.exit(1);
}
const synced = syncCapsuleToLabRemote({
  manifest: fakeManifest,
  dataDir,
  capsule: full,
});
const ptr = loadPointer(dataDir);
rmSync(join(dataDir, 'memory'), { recursive: true, force: true });
mkdirSync(join(dataDir, 'memory'), { recursive: true });
writeFileSync(
  join(dataDir, 'memory/remote-pointer.json'),
  `${JSON.stringify(ptr, null, 2)}\n`,
);
const hydrated = await hydrateLocalFromPointer({ dataDir, pointer: ptr });
const ctx = preloadContext({ packDir, dataDir });
const ok =
  hydrated.experientialHash === latest.experientialHash &&
  ctx.systemPrompt.includes('Memory L0') &&
  !ctx.systemPrompt.includes('sin memoria previa') &&
  synced.pointer.provider === 'lab-remote';

try {
  rmSync(iso, { recursive: true, force: true });
} catch {
  /* ignore */
}

if (!ok) {
  console.error('❌ restart-style hydrate failed');
  process.exit(1);
}
console.log('   ✅ sync → wipe → hydrate → preload\n');
console.log('✅ MEMORY SMOKE PASSED — Bloque 3.2 offline OK');
process.exit(0);
