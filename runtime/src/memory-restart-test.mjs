#!/usr/bin/env node
/**
 * Restart test: sync offchain → borrar local → restaurar → verificar preload.
 */
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadManifest } from './manifest-loader.mjs';
import { loadPayerKey, loadPayerAccount } from './payer-key.mjs';
import { preloadContext } from './memory-local.mjs';
import {
  syncMemoryRemote,
  hydrateLocalFromPointer,
  loadPointer,
  resolveRemotePointer,
} from './memory-toju.mjs';

const args = process.argv.slice(2);
const skipUpload = args.includes('--skip-upload');
const provider = args.find((a) => a.startsWith('--provider='))?.split('=')[1] ?? 'auto';
const manifestPath =
  args.find((a) => !a.startsWith('--')) ??
  '../docs/manifest/examples/unit-1-lab.json';

const { manifest, packDir, dataDir, packId } = loadManifest(manifestPath);
const memDir = join(dataDir, 'memory');
const POINTER_REL = 'memory/remote-pointer.json';

function pointerPath(d) {
  return join(d, POINTER_REL);
}

console.log('=== ageNFT memory:restart-test ===');
console.log('agent:', manifest.name, `#${manifest.identity.agentId}`);
console.log('pack:', packId);
console.log('provider:', provider);

let pointer = resolveRemotePointer(manifest, dataDir);

if (!skipUpload) {
  const pk = loadPayerKey();
  if (provider === 'toju' && !pk) {
    console.error('toju provider requires payer key');
    process.exit(1);
  }
  if (pk) console.log('payer:', loadPayerAccount().address);
  console.log('1/4 sync local → offchain...');
  const uploaded = await syncMemoryRemote({
    manifest,
    dataDir,
    privateKey: pk,
    provider,
  });
  pointer = uploaded.pointer;
  console.log(
    '   ',
    uploaded.fallback ? 'lab-remote' : pointer.provider,
    pointer.uri,
    uploaded.costUsdMicro ? `($${uploaded.costUsdMicro / 1_000_000})` : '',
  );
} else {
  console.log('1/4 skip upload (--skip-upload)');
  if (!pointer) {
    console.error('No remote pointer — run sync first');
    process.exit(1);
  }
  console.log('   using:', pointer.uri);
}

const latestPath = join(memDir, 'latest.json');
const expected = existsSync(latestPath) ? JSON.parse(readFileSync(latestPath, 'utf8')) : null;
const hashBefore = expected?.experientialHash ?? pointer.experientialHash;
const l0Before = expected?.l0Summary ?? null;

console.log('2/4 wipe local memory (keep offchain pointer)...');
const ptr = loadPointer(dataDir);
const remoteCapsule = join(dataDir, 'memory-remote/capsule.json');
const remoteBackup = existsSync(remoteCapsule)
  ? readFileSync(remoteCapsule, 'utf8')
  : null;

rmSync(memDir, { recursive: true, force: true });
mkdirSync(memDir, { recursive: true });
if (ptr) writeFileSync(pointerPath(dataDir), `${JSON.stringify(ptr, null, 2)}\n`);
if (remoteBackup) {
  mkdirSync(join(dataDir, 'memory-remote'), { recursive: true });
  writeFileSync(remoteCapsule, remoteBackup);
}

console.log('   local latest.json removed');

console.log('3/4 hydrate from offchain...');
const hydrated = await hydrateLocalFromPointer({ dataDir, pointer: loadPointer(dataDir) });
console.log('   fetched:', hydrated.fetchedFrom);

console.log('4/4 preload verify...');
const ctx = preloadContext({ packDir, dataDir });

const hashOk = hashBefore && hydrated.experientialHash && hashBefore === hydrated.experientialHash;
const l0Ok = l0Before && hydrated.l0Summary && l0Before === hydrated.l0Summary;
const preloadOk = ctx.systemPrompt.includes('Memory L0') && !ctx.systemPrompt.includes('sin memoria previa');

console.log('---');
console.log('experientialHash match:', hashOk ? '✅' : '❌');
console.log('L0 match:', l0Ok ? '✅' : '❌');
console.log('preload has memory:', preloadOk ? '✅' : '❌');
console.log('L0 preview:', (hydrated.l0Summary ?? '').slice(0, 120), '…');

if (hashOk && l0Ok && preloadOk) {
  console.log('\n✅ RESTART TEST PASSED — memoria sobrevive offchain');
  process.exit(0);
}

console.error('\n❌ RESTART TEST FAILED');
process.exit(1);
