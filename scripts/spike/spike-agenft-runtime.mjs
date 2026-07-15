#!/usr/bin/env node
/** Spike: ageNFT run-once + budget + memory vs baselines */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const RUNTIME = join(REPO, 'runtime');
const OUT = join(REPO, 'docs/research/lab/spike-web3-runtime.json');

function run(cmd, cwd = REPO) {
  const t0 = Date.now();
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, ms: Date.now() - t0, out: out.slice(0, 2000) };
  } catch (e) {
    return {
      ok: false,
      ms: Date.now() - t0,
      out: (e.stdout ?? '').slice(0, 1000),
      err: (e.stderr ?? e.message ?? '').slice(0, 1000),
      code: e.status,
    };
  }
}

const pay = process.argv.includes('--pay');
const results = { at: new Date().toISOString(), pay, tracks: {} };

console.log('=== spike: ageNFT runtime baseline ===');

results.tracks.manifest = run('node scripts/validate-manifest.mjs docs/manifest/examples/unit-1-lab.json');
results.tracks.budget = run('npm run budget', RUNTIME);
results.tracks.runway = run('npm run budget:runway', RUNTIME);
results.tracks.dormant = run('npm run budget:dormant-test', RUNTIME);
results.tracks.memoryRestart = run('npm run memory:restart-test -- --skip-upload', RUNTIME);
results.tracks.transferDry = run('node transfer-checklist.mjs 115 --dry-run', join(REPO, 'scripts/onchain'));
results.tracks.runOnceProbe = run('npm run once', RUNTIME);

if (pay) {
  results.tracks.runOncePay = run('npm run once:pay', RUNTIME);
}

// Hermes info
results.tracks.hermes = run('hermes --version && hermes skills list 2>&1 | rg -i "evm|x402|payment|blockchain" || true');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(results, null, 2)}\n`);

console.log('\n--- summary ---');
for (const [k, v] of Object.entries(results.tracks)) {
  console.log(k, v.ok ? '✅' : '❌', `${v.ms}ms`, v.code != null ? `(exit ${v.code})` : '');
}
console.log('Report:', OUT);

process.exit(Object.values(results.tracks).some((v) => !v.ok) ? 1 : 0);
