#!/usr/bin/env node
/**
 * Transfer simulado offchain — Bloque 3.2 (memoria que viaja).
 *
 * Simula vendedor → comprador con política `full` | `reset-total`.
 * Solo `lab-remote` (cero USDC, sin toju, sin onchain).
 *
 * Usage:
 *   npm run memory:transfer-sim
 *   npm run memory:transfer-sim -- --policy=full
 *   npm run memory:transfer-sim -- --policy=reset-total
 *   npm run memory:transfer-sim -- --seed              # fixture si no hay memoria
 *   npm run memory:transfer-sim -- --seed --isolated   # dataDir temporal (default con --seed)
 *   npm run memory:transfer-sim -- --no-isolated       # escribe en runtime/data/<pack>
 */
import {
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdtempSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { resolveAgentEnv } from './agenft-env.mjs';
import { preloadContext } from './memory-local.mjs';
import {
  buildCapsule,
  applyMemoryTransferPolicy,
  syncCapsuleToLabRemote,
  hydrateLocalFromPointer,
  loadPointer,
} from './memory-toju.mjs';

const args = process.argv.slice(2);
const policy =
  args.find((a) => a.startsWith('--policy='))?.split('=')[1] ?? 'full';
const seed = args.includes('--seed');
const noIsolated = args.includes('--no-isolated');
const wantIsolated = args.includes('--isolated') || (seed && !noIsolated);
const manifestArg = args.find((a) => !a.startsWith('--'));
if (manifestArg) {
  process.env.AGENFT_MANIFEST_PATH = resolve(manifestArg);
}

const ALLOWED = new Set(['full', 'reset-total']);
if (!ALLOWED.has(policy)) {
  console.error(`Política inválida: ${policy} (usa full | reset-total)`);
  process.exit(1);
}

let isolatedRoot = null;
if (wantIsolated) {
  isolatedRoot = mkdtempSync(join(tmpdir(), 'agenft-transfer-sim-'));
  process.env.AGENFT_DATA_DIR = join(isolatedRoot, 'data');
  mkdirSync(process.env.AGENFT_DATA_DIR, { recursive: true });
}

const { manifest, packDir, dataDir, packId } = resolveAgentEnv();
const memDir = join(dataDir, 'memory');
const latestPath = join(memDir, 'latest.json');

console.log('=== ageNFT memory:transfer-sim ===');
console.log('agent:', manifest.name, `#${manifest.identity.agentId}`);
console.log('pack:', packId);
console.log('policy:', policy);
console.log('provider: lab-remote (sin pago)');
console.log('dataDir:', wantIsolated ? `${dataDir} (isolated)` : dataDir);

function hashJson(obj) {
  return `0x${createHash('sha256').update(JSON.stringify(obj)).digest('hex')}`;
}

function seedFixtureMemory() {
  mkdirSync(join(memDir, 'deltas'), { recursive: true });
  const ts = new Date().toISOString();
  const recentFacts = [
    'Usuario: transfer-sim seed',
    'Agente: vivencia de laboratorio para Bloque 3.2',
  ];
  const l0Summary = `${manifest.name}: transfer-sim seed; vivencia de laboratorio`;
  const latest = {
    updatedAt: ts,
    l0Summary,
    recentFacts,
    experientialHash: hashJson({ recentFacts, l0Summary }),
    deltaCount: 1,
  };
  writeFileSync(latestPath, `${JSON.stringify(latest, null, 2)}\n`);
  writeFileSync(
    join(memDir, 'deltas', `${ts.replace(/[:.]/g, '-')}.json`),
    `${JSON.stringify(
      {
        ts,
        agent: manifest.name,
        user: 'transfer-sim seed',
        assistant: 'vivencia de laboratorio para Bloque 3.2',
        bullets: recentFacts,
      },
      null,
      2,
    )}\n`,
  );
  return latest;
}

if (!existsSync(latestPath)) {
  if (!seed) {
    console.error(
      'Sin memoria local — corre con --seed o genera un turno/probe antes.',
    );
    process.exit(1);
  }
  console.log('1/5 seed fixture memory…');
  seedFixtureMemory();
} else {
  console.log('1/5 usando memoria local existente');
}

const sellerCapsule = buildCapsule({ manifest, dataDir });
if (sellerCapsule.vault0Excluded !== true) {
  console.error('❌ cápsula vendedor sin vault0Excluded');
  process.exit(1);
}
const hashBefore = sellerCapsule.latest.experientialHash;
console.log('   experientialHash vendedor:', hashBefore?.slice(0, 18) + '…');

console.log('2/5 aplicar política de transfer…');
let outgoingCapsule;
try {
  outgoingCapsule = applyMemoryTransferPolicy(sellerCapsule, policy, {
    agentName: manifest.name,
  });
} catch (e) {
  console.error('❌', e.message ?? e);
  process.exit(1);
}
console.log('   transferApplied:', outgoingCapsule.transferApplied);

console.log('3/5 sync lab-remote (vendedor)…');
const synced = syncCapsuleToLabRemote({
  manifest,
  dataDir,
  capsule: outgoingCapsule,
});
console.log('   uri:', synced.pointer.uri);

console.log('4/5 hydrate comprador (dataDir temporal)…');
const buyerRoot = mkdtempSync(join(tmpdir(), 'agenft-buyer-'));
const buyerData = join(buyerRoot, 'data');
mkdirSync(join(buyerData, 'memory'), { recursive: true });
mkdirSync(join(buyerData, 'memory-remote'), { recursive: true });

const sellerPointer = loadPointer(dataDir);
writeFileSync(
  join(buyerData, 'memory/remote-pointer.json'),
  `${JSON.stringify(sellerPointer, null, 2)}\n`,
);
const capsuleSrc = join(dataDir, 'memory-remote/capsule.json');
writeFileSync(
  join(buyerData, 'memory-remote/capsule.json'),
  readFileSync(capsuleSrc, 'utf8'),
);

const hydrated = await hydrateLocalFromPointer({
  dataDir: buyerData,
  pointer: sellerPointer,
});
const buyerLatest = JSON.parse(
  readFileSync(join(buyerData, 'memory/latest.json'), 'utf8'),
);
const buyerCtx = preloadContext({ packDir, dataDir: buyerData });

console.log('5/5 verificar…');
const vaultOk = outgoingCapsule.vault0Excluded === true;
const hashOk =
  policy === 'full'
    ? hydrated.experientialHash === hashBefore
    : hydrated.experientialHash !== hashBefore &&
      Array.isArray(buyerLatest.recentFacts) &&
      buyerLatest.recentFacts.length === 0;
const preloadOk =
  policy === 'full'
    ? buyerCtx.systemPrompt.includes('Memory L0') &&
      !buyerCtx.systemPrompt.includes('sin memoria previa')
    : buyerCtx.systemPrompt.includes('cuerpo limpio') ||
      buyerLatest.recentFacts.length === 0;

console.log('---');
console.log('vault0Excluded:', vaultOk ? '✅' : '❌');
console.log(
  policy === 'full' ? 'hash viaja intacto:' : 'hash reseteado:',
  hashOk ? '✅' : '❌',
);
console.log('preload comprador:', preloadOk ? '✅' : '❌');
console.log('L0 comprador:', (hydrated.l0Summary ?? '').slice(0, 100));

for (const root of [buyerRoot, isolatedRoot]) {
  if (!root) continue;
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

if (vaultOk && hashOk && preloadOk) {
  console.log(
    `\n✅ TRANSFER SIM PASSED — política ${policy} (lab-remote, sin onchain)`,
  );
  process.exit(0);
}

console.error('\n❌ TRANSFER SIM FAILED');
process.exit(1);
