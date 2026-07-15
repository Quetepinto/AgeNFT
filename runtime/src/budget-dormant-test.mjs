#!/usr/bin/env node
/** Verifica modo DORMANT cuando caps están agotados. */
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkBrainBudget } from './budget-tracker.mjs';
import { loadManifest } from './manifest-loader.mjs';

const manifestPath = '../docs/manifest/examples/unit-1-lab.json';
const { manifest, dataDir } = loadManifest(manifestPath);

// Simular agotamiento: ledger temporal con requests al cap
const tmp = mkdtempSync(join(tmpdir(), 'agenft-budget-test-'));
const testData = join(tmp, 'unit-1');
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync(join(testData, 'budget'), { recursive: true });
const keys = { hour: new Date().toISOString().slice(0, 13), day: new Date().toISOString().slice(0, 10), month: new Date().toISOString().slice(0, 7) };
writeFileSync(
  join(testData, 'budget/ledger.json'),
  `${JSON.stringify(
    {
      version: 1,
      organs: {
        brain: {
          hour: { windowKey: keys.hour, requests: 999, usdMicro: 0 },
          day: { windowKey: keys.day, requests: 999, usdMicro: 0 },
          month: { windowKey: keys.month, requests: 999, usdMicro: 0 },
        },
      },
      global: { day: { windowKey: keys.day, usdMicro: 0 } },
      events: [],
    },
    null,
    2,
  )}\n`,
);

const blocked = checkBrainBudget(manifest, testData, { pay: false });
rmSync(tmp, { recursive: true, force: true });

console.log('=== budget dormant test ===');
console.log('allowed:', blocked.allowed);
console.log('reason:', blocked.reason ?? '(none)');

if (!blocked.allowed) {
  console.log('✅ DORMANT triggers when perDay requests cap exceeded');
  process.exit(0);
}

console.error('❌ Expected DORMANT block');
process.exit(1);
