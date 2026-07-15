#!/usr/bin/env node
/** Validate ageNFT manifest JSON against provisional schema (minimal checks). */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = process.argv[2];
if (!path) {
  console.error('Usage: node validate-manifest.mjs <manifest.json>');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];

function req(field, pred, msg) {
  if (!pred) errors.push(`${field}: ${msg}`);
}

req('type', manifest.type === 'ageNFT/v1', 'must be ageNFT/v1');
req('name', typeof manifest.name === 'string' && manifest.name.length > 0, 'required string');
req('identity.chain', /^eip155:\d+$/.test(manifest.identity?.chain ?? ''), 'CAIP-2 chain id');
req('identity.agentId', Number.isFinite(manifest.identity?.agentId), 'numeric agentId');
req('identity.nft.contract', /^0x[a-fA-F0-9]{40}$/.test(manifest.identity?.nft?.contract ?? ''), 'valid contract');
req('treasury.address', /^0x[a-fA-F0-9]{40}$/.test(manifest.treasury?.address ?? ''), 'valid TBA address');
req('organs.brain.primary.endpoint', typeof manifest.organs?.brain?.primary?.endpoint === 'string', 'brain endpoint required');
req('budget.global.perDayUsdHardCap', manifest.budget?.global?.perDayUsdHardCap != null, 'budget cap required');

if (errors.length) {
  console.error('INVALID manifest:', path);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('OK', path);
console.log(JSON.stringify({
  name: manifest.name,
  agentId: manifest.identity.agentId,
  tba: manifest.treasury.address,
  brain: manifest.organs.brain.primary.provider,
}, null, 2));
