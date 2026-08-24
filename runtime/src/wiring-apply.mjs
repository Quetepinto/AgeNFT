#!/usr/bin/env node
/**
 * Aplica wiring desde archivo JSON → runtime/wiring/{packId}.json
 *
 *   npm run wiring:apply
 *   npm run wiring:apply -- .cursor/lab-inbox/wiring-draft.json
 *   npm run wiring:show
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAgentEnv } from './agenft-env.mjs';
import { loadWiring, saveWiring, validateWiring } from './wiring-loader.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const DEFAULT_INBOX = join(REPO, '.cursor/lab-inbox/wiring-draft.json');

const args = process.argv.slice(2);
const showOnly = args.includes('--show');
const filtered = args.filter((a) => !a.startsWith('--'));

async function main() {
  const ctx = resolveAgentEnv();
  const { packId } = ctx;

  if (showOnly) {
    const { wiring, path, missing } = loadWiring(packId);
    if (missing) {
      console.log('No wiring file for', packId);
      process.exit(1);
    }
    console.log(JSON.stringify(wiring, null, 2));
    console.error('---');
    console.error('path:', path);
    return;
  }

  const inputPath = filtered[0] ?? DEFAULT_INBOX;
  if (!existsSync(inputPath)) {
    console.error(`No wiring input: ${inputPath}`);
    console.error('Exporta desde Lab Studio (Inbox) o pasa ruta a JSON.');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(inputPath, 'utf8'));
  const wiring = raw.wiring ?? raw;
  validateWiring(wiring, { packId: wiring.packId ?? packId });
  const targetPack = wiring.packId ?? packId;
  const out = saveWiring(targetPack, wiring);

  console.log('✅ wiring applied');
  console.log('pack:', targetPack);
  console.log('path:', out);
  console.log('nodes:', wiring.nodes.length);
  console.log('edges:', wiring.edges.length);
}

main().catch((e) => {
  console.error('❌', e.message ?? e);
  process.exit(1);
});
