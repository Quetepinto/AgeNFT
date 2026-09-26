#!/usr/bin/env node
/**
 * Smoke lab Pi — sin gastar USDC.
 * Valida preset + skill + SYSTEM; opcionalmente corre hermes:turn probe.
 *
 * Uso:
 *   node scripts/pi/smoke-lab.mjs
 *   cd runtime && npm run pi:smoke
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RUNTIME = join(REPO, 'runtime');
const PRESET = join(REPO, 'docs/backups/pi-custom.json');
const SKILL = join(REPO, 'runtime/pack/lab-pi/skills/agenft-core/SKILL.md');
const SYSTEM = join(REPO, 'runtime/pack/lab-pi/SYSTEM.md');
const README = join(REPO, 'runtime/pack/lab-pi/README.md');

const checks = [];
let failed = false;

function ok(label, detail = '') {
  checks.push({ ok: true, label, detail });
  console.log(`✅ ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail = '') {
  failed = true;
  checks.push({ ok: false, label, detail });
  console.log(`❌ ${label}${detail ? ` — ${detail}` : ''}`);
}

console.log('=== Pi lab smoke (dry-run / no --pay) ===\n');

for (const [label, path] of [
  ['preset pi-custom.json', PRESET],
  ['skill agenft-core', SKILL],
  ['SYSTEM.md', SYSTEM],
  ['README lab-pi', README],
]) {
  if (existsSync(path)) ok(label, path.replace(REPO + '/', ''));
  else fail(label, `missing: ${path}`);
}

if (existsSync(PRESET)) {
  try {
    const preset = JSON.parse(readFileSync(PRESET, 'utf8'));
    if (preset?.type === 'ageNFT/v1') ok('preset type', 'ageNFT/v1');
    else fail('preset type', String(preset?.type));
    if (preset?.runtime?.engine === 'custom') ok('preset engine', 'custom');
    else fail('preset engine', `expected custom, got ${preset?.runtime?.engine}`);
    if (preset?.runtime?.engineVersion === 'pi-lab') ok('preset engineVersion', 'pi-lab');
    else fail('preset engineVersion', String(preset?.runtime?.engineVersion));
    if (preset?.runtime?.adapter === 'agenft-run-turn/v1') ok('preset adapter', 'agenft-run-turn/v1');
    else fail('preset adapter', String(preset?.runtime?.adapter));
    const tg = preset?.gateways?.chat?.find((c) => c.platform === 'telegram');
    if (tg && tg.enabled === false) ok('telegram disabled in lab preset');
    else fail('telegram disabled in lab preset', JSON.stringify(tg));
  } catch (e) {
    fail('preset JSON parse', e.message);
  }
}

if (existsSync(SKILL)) {
  const skill = readFileSync(SKILL, 'utf8');
  if (skill.includes('hermes:turn:pay')) ok('skill mandates hermes:turn:pay');
  else fail('skill mandates hermes:turn:pay');
  if (/Never answer using Pi/i.test(skill) || /Never answer using/i.test(skill)) {
    ok('skill forbids host LLM as NFT voice');
  } else {
    fail('skill forbids host LLM as NFT voice');
  }
  if (skill.includes('Do NOT') && skill.toLowerCase().includes('memory')) {
    ok('skill forbids native Pi memory');
  } else {
    fail('skill forbids native Pi memory');
  }
}

const skipProbe = process.env.AGENFT_PI_SMOKE_SKIP_PROBE === '1';
if (skipProbe) {
  ok('probe turn', 'skipped (AGENFT_PI_SMOKE_SKIP_PROBE=1)');
} else {
  const r = spawnSync(
    'npm',
    ['run', 'hermes:turn', '--', '--plain', '--quiet', 'ping'],
    {
      cwd: RUNTIME,
      encoding: 'utf8',
      env: { ...process.env, AGENFT_TOKEN_ID: process.env.AGENFT_TOKEN_ID || '1' },
    },
  );
  // Protocol: 0 OK, 1 error, 2 DORMANT — any of these proves the CLI contract exists.
  if (r.status === 0 || r.status === 1 || r.status === 2) {
    ok(
      'probe turn (no --pay)',
      `exit ${r.status}` +
        (r.stdout?.trim() ? `; stdout: ${r.stdout.trim().slice(0, 120)}` : '') +
        (r.status !== 0 && r.stderr?.trim()
          ? `; stderr: ${r.stderr.trim().slice(0, 80)}`
          : ''),
    );
  } else {
    fail(
      'probe turn (no --pay)',
      `unexpected status ${r.status}: ${(r.stderr || r.stdout || '').toString().slice(0, 200)}`,
    );
  }
}

const passed = checks.filter((c) => c.ok).length;
console.log(`\n${passed}/${checks.length} OK`);
if (failed) {
  console.log('\nSmoke failed. Fix pack/preset before a paid lab turn.');
  process.exit(1);
}
console.log('\nPi lab spike files OK. Paid turn is optional and out of this smoke.');
process.exit(0);
