#!/usr/bin/env node
/** Sube cápsula de memoria → toju (x402) o lab-remote fallback. */
import { loadManifest } from './manifest-loader.mjs';
import { loadPayerKey, loadPayerAccount } from './payer-key.mjs';
import { syncMemoryRemote, loadPointer, buildCapsule } from './memory-toju.mjs';

const args = process.argv.slice(2);
const providerArg = args.find((a) => a.startsWith('--provider='))?.split('=')[1] ?? 'auto';
const durationDays = Number(args.find((a) => a.startsWith('--days='))?.split('=')[1] ?? 7);
const manifestPath =
  args.find((a) => !a.startsWith('--')) ??
  '../docs/manifest/examples/unit-1-lab.json';

const pk = loadPayerKey();
const { manifest, dataDir, packId } = loadManifest(manifestPath);

console.log('=== ageNFT memory:sync ===');
console.log('agent:', manifest.name, `#${manifest.identity.agentId}`);
console.log('pack:', packId);
console.log('provider:', providerArg);
if (pk) console.log('payer:', loadPayerAccount()?.address);

const preview = buildCapsule({ manifest, dataDir });
console.log('local experientialHash:', preview.latest.experientialHash);

const prev = loadPointer(dataDir);
if (prev?.uri) console.log('previous:', prev.uri);

const result = await syncMemoryRemote({
  manifest,
  dataDir,
  privateKey: pk,
  durationDays,
  provider: providerArg,
});

console.log('---');
console.log(result.fallback ? '✅ synced (lab-remote fallback)' : '✅ synced');
console.log('provider:', result.pointer.provider);
console.log('uri:', result.pointer.uri);
if (result.pointer.cid) console.log('cid:', result.pointer.cid);
console.log('cost USD:', (result.costUsdMicro / 1_000_000).toFixed(6));
console.log('pointer:', result.path);
