#!/usr/bin/env node
/**
 * Convierte wiring Lab Studio + preset manifiesto → borrador ageNFT/v1 listo para mint.
 *
 * Uso:
 *   node scripts/mint/wiring-to-manifest.mjs \
 *     --wiring runtime/wiring/unit-mainnet.json \
 *     --preset docs/manifest/presets/uruiru-prototype.json \
 *     --out docs/manifest/examples/uruiru-prototype-draft.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const MAP_PATH = join(ROOT, 'docs/manifest/wiring-option-map.json');

function parseArgs(argv) {
  const opts = {
    wiring: join(ROOT, 'runtime/wiring/unit-mainnet.json'),
    preset: join(ROOT, 'docs/manifest/presets/uruiru-prototype.json'),
    out: null,
    stdout: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--wiring' && argv[i + 1]) opts.wiring = resolve(argv[++i]);
    else if (a === '--preset' && argv[i + 1]) opts.preset = resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = resolve(argv[++i]);
    else if (a === '--stdout') opts.stdout = true;
    else if (a === '--help' || a === '-h') {
      console.log(`Uso: node wiring-to-manifest.mjs [--wiring PATH] [--preset PATH] [--out PATH] [--stdout]`);
      process.exit(0);
    }
  }
  return opts;
}

function nodeById(wiring, id) {
  return wiring.nodes?.find((n) => n.id === id) ?? null;
}

function enabledGateway(map, option) {
  const g = map.gateway?.[option];
  if (!g) return null;
  return {
    platform: g.platform,
    enabled: true,
    credentials: 'runtime-only',
    sovereign: g.sovereign ?? false,
  };
}

/**
 * @param {object} wiring agenft-wiring/v1
 * @param {object} preset manifiesto base (identidad, visual, budget…)
 * @param {object} map wiring-option-map
 */
export function wiringToManifest(wiring, preset, map) {
  const manifest = structuredClone(preset);
  const now = new Date().toISOString();
  manifest.updatedAt = now;
  if (!manifest.createdAt) manifest.createdAt = now;

  const runtimeNode = nodeById(wiring, 'runtime');
  if (runtimeNode?.option && map.runtime?.[runtimeNode.option]) {
    Object.assign(manifest.runtime, map.runtime[runtimeNode.option]);
  }

  const brainNode = nodeById(wiring, 'brain');
  if (brainNode?.option && map.brain?.[brainNode.option]) {
    manifest.organs.brain.primary = { ...map.brain[brainNode.option] };
  }

  const memoryNode = nodeById(wiring, 'memory');
  if (memoryNode?.option && map.memory?.[memoryNode.option]) {
    const mem = map.memory[memoryNode.option];
    manifest.organs.memory.operational = {
      provider: mem.provider,
      primary: null,
      fallbacks: mem.fallbacks ?? [],
    };
  }

  const nftNode = nodeById(wiring, 'nft');
  if (nftNode?.option && map.nft?.[nftNode.option]) {
    const chainInfo = map.nft[nftNode.option];
    if (chainInfo.chain) manifest.identity.chain = chainInfo.chain;
    if (chainInfo.registry) {
      manifest.identity.registry = chainInfo.registry;
      manifest.identity.nft.contract = chainInfo.registry;
    }
  }

  const presenceNode = nodeById(wiring, 'presence');
  if (presenceNode?.option && map.presence?.[presenceNode.option]) {
    const p = map.presence[presenceNode.option];
    if (p.asset) {
      if (p.format === 'svg') manifest.imageFallback = p.asset;
      else manifest.image = p.asset;
    }
  }

  const chat = [];
  const gatewayNode = nodeById(wiring, 'gateway');
  if (gatewayNode?.option && gatewayNode.option !== 'off') {
    const g = enabledGateway(map, gatewayNode.option);
    if (g) chat.push(g);
  }
  const matrixNode = nodeById(wiring, 'matrix');
  if (matrixNode?.option && map.matrixNode?.[matrixNode.option]) {
    const m = map.matrixNode[matrixNode.option];
    if (m && !chat.some((c) => c.platform === m.platform)) {
      chat.push({
        platform: m.platform,
        enabled: true,
        credentials: 'runtime-only',
        sovereign: m.sovereign ?? true,
      });
    }
  }
  if (chat.length) manifest.gateways.chat = chat;

  manifest._wiringSource = {
    packId: wiring.packId,
    updatedAt: wiring.updatedAt,
    exportedAt: now,
  };

  return manifest;
}

function main() {
  const opts = parseArgs(process.argv);
  const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
  const wiring = JSON.parse(readFileSync(opts.wiring, 'utf8'));
  const preset = JSON.parse(readFileSync(opts.preset, 'utf8'));
  const manifest = wiringToManifest(wiring, preset, map);
  const json = `${JSON.stringify(manifest, null, 2)}\n`;

  if (opts.stdout) {
    process.stdout.write(json);
    return;
  }

  const outPath = opts.out ?? join(ROOT, 'docs/manifest/examples/uruiru-prototype-draft.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json);
  console.log('Manifiesto borrador:', outPath);
  console.log('Siguiente: node scripts/onchain/mint-mainnet.mjs --manifest', outPath);
}

const isMain =
  process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) main();
