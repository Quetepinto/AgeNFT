#!/usr/bin/env node
/** Spike: Hermes EVM skill + hub x402 landscape */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const evmSkill = join(homedir(), '.hermes/skills/blockchain/evm/SKILL.md');

console.log('=== spike: Hermes Web3 ===');
console.log(execSync('hermes --version', { encoding: 'utf8' }).trim());

console.log('\n--- EVM skill installed ---');
if (existsSync(evmSkill)) {
  const md = readFileSync(evmSkill, 'utf8');
  console.log('path:', evmSkill);
  console.log('lines:', md.split('\n').length);
  console.log('preview:', md.slice(0, 400).replace(/\n/g, ' '));
} else {
  console.log('MISSING — run: hermes skills install official/blockchain/evm --yes');
}

for (const q of ['x402', 'blockchain', 'payment']) {
  console.log(`\n--- hub search: ${q} ---`);
  try {
    const out = execSync(`hermes skills search ${q} 2>&1 | head -12`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    console.log(out);
  } catch (e) {
    console.log(String(e.message ?? e).slice(0, 300));
  }
}

console.log('\n--- official payment skills ---');
try {
  console.log(execSync('hermes skills search official/payments 2>&1 | head -8', { encoding: 'utf8' }));
} catch {
  console.log('(none or search failed)');
}

console.log('\n--- note ---');
console.log('Hermes local v0.14.0 — latest hub has x402/awal in newer releases');
console.log('Upgrade: pip install --upgrade hermes-agent');
