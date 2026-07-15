import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '../..');

export function loadManifest(manifestPath) {
  const abs = manifestPath.startsWith('/')
    ? manifestPath
    : join(process.cwd(), manifestPath);
  const manifest = JSON.parse(readFileSync(abs, 'utf8'));
  validateManifest(manifest);
  const packId = slugFromName(manifest.name);
  const packDir = join(REPO_ROOT, 'runtime/pack', packId);
  const dataDir = join(REPO_ROOT, 'runtime/data', packId);
  return { manifest, abs, packDir, dataDir, packId };
}

function slugFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateManifest(m) {
  const errors = [];
  const req = (field, pred, msg) => {
    if (!pred) errors.push(`${field}: ${msg}`);
  };

  req('type', m.type === 'ageNFT/v1', 'must be ageNFT/v1');
  req('name', typeof m.name === 'string' && m.name.length > 0, 'required');
  req('identity.chain', /^eip155:\d+$/.test(m.identity?.chain ?? ''), 'CAIP-2');
  req('identity.agentId', Number.isFinite(m.identity?.agentId), 'agentId');
  req('treasury.address', /^0x[a-fA-F0-9]{40}$/.test(m.treasury?.address ?? ''), 'TBA');
  req(
    'organs.brain.primary',
    typeof m.organs?.brain?.primary?.endpoint === 'string',
    'brain endpoint',
  );

  if (errors.length) {
    throw new Error(`Invalid manifest:\n${errors.map((e) => ` - ${e}`).join('\n')}`);
  }
}

export function resolveBrain(manifest) {
  const brain = manifest.organs?.brain;
  if (!brain?.primary) throw new Error('No brain.primary in manifest');
  return {
    primary: brain.primary,
    fallbacks: brain.fallbacks ?? [],
    routing: brain.routing?.priority ?? [],
  };
}
