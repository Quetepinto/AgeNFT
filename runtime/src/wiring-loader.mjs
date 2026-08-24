import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './manifest-loader.mjs';

export const WIRING_TYPE = 'agenft-wiring/v1';
const WIRING_DIR = join(REPO_ROOT, 'runtime/wiring');

const MEMORY_OPTION_TO_PROVIDER = {
  'lab-local': 'lab-remote',
  'toju-ipfs': 'toju',
  'kubo-ipfs': 'auto',
  'w3stor-ipfs': 'w3stor',
  'export-only': 'lab-remote',
  arweave: 'lab-remote',
};

export function wiringPathForPack(packId) {
  return join(WIRING_DIR, `${packId}.json`);
}

export function loadWiring(packId) {
  const path = wiringPathForPack(packId);
  if (!existsSync(path)) {
    return { wiring: null, path, missing: true };
  }
  const wiring = JSON.parse(readFileSync(path, 'utf8'));
  validateWiring(wiring, { packId });
  return { wiring, path, missing: false };
}

export function validateWiring(w, { packId } = {}) {
  const errors = [];
  if (w.type !== WIRING_TYPE) errors.push(`type must be ${WIRING_TYPE}`);
  if (packId && w.packId && w.packId !== packId) {
    errors.push(`packId mismatch: file ${w.packId} vs ${packId}`);
  }
  if (!Array.isArray(w.nodes) || w.nodes.length === 0) errors.push('nodes required');
  if (!Array.isArray(w.edges)) errors.push('edges required');

  for (const n of w.nodes ?? []) {
    if (!n.id || !n.category || !n.option) {
      errors.push(`node invalid: ${JSON.stringify(n?.id ?? n)}`);
    }
  }

  for (const e of w.edges ?? []) {
    if (!e.from || !e.to) errors.push(`edge invalid: ${JSON.stringify(e)}`);
  }

  if (errors.length) {
    throw new Error(`Invalid wiring:\n${errors.map((e) => ` - ${e}`).join('\n')}`);
  }
}

export function saveWiring(packId, wiring) {
  const payload = {
    ...wiring,
    type: WIRING_TYPE,
    packId,
    updatedAt: new Date().toISOString(),
  };
  validateWiring(payload, { packId });
  mkdirSync(WIRING_DIR, { recursive: true });
  const path = wiringPathForPack(packId);
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
  return path;
}

export function getNode(wiring, nodeId) {
  if (!wiring) return null;
  return wiring.nodes.find((n) => n.id === nodeId) ?? null;
}

export function isCategoryActive(category) {
  return category && category !== 'off';
}

export function hasEdge(wiring, from, to) {
  if (!wiring) return true;
  return wiring.edges.some((e) => e.from === from && e.to === to);
}

export function isConnectedToRuntime(wiring, nodeId) {
  if (!wiring) return true;
  if (nodeId === 'runtime') return true;
  const node = getNode(wiring, nodeId);
  if (!node || !isCategoryActive(node.category)) return false;
  return hasEdge(wiring, 'runtime', nodeId);
}

export function canRunTurn(wiring) {
  if (!wiring) return { ok: true, legacy: true };

  const runtime = getNode(wiring, 'runtime');
  const brain = getNode(wiring, 'brain');
  if (!runtime || !isCategoryActive(runtime.category)) {
    return { ok: false, reason: 'Motor apagado o ausente en wiring' };
  }
  if (!brain || !isCategoryActive(brain.category)) {
    return { ok: false, reason: 'Cerebro apagado en wiring' };
  }
  if (!hasEdge(wiring, 'runtime', 'brain')) {
    return { ok: false, reason: 'Sin cable Motor → Cerebro' };
  }
  if (!hasEdge(wiring, 'nft', 'runtime')) {
    return { ok: false, reason: 'Sin cable NFT → Motor' };
  }
  return { ok: true };
}

export function memoryProviderFromWiring(wiring) {
  if (!wiring) return 'auto';
  const mem = getNode(wiring, 'memory');
  if (!mem || !isCategoryActive(mem.category)) return null;
  return MEMORY_OPTION_TO_PROVIDER[mem.option] ?? 'auto';
}

export function shouldSyncMemoryFromWiring(wiring, { pay = false } = {}) {
  if (!pay || !wiring) return false;
  const mem = getNode(wiring, 'memory');
  if (!mem || !isCategoryActive(mem.category)) return false;
  if (mem.option === 'export-only') return false;
  return hasEdge(wiring, 'brain', 'memory');
}

export function gatewayEnabled(wiring) {
  if (!wiring) return true;
  return isConnectedToRuntime(wiring, 'gateway');
}

export function chatWebEnabled(wiring) {
  if (!wiring) return true;
  return isConnectedToRuntime(wiring, 'chatweb');
}

export function doctorEnabled(wiring) {
  if (!wiring) return true;
  const doc = getNode(wiring, 'doctor');
  if (!doc || !isCategoryActive(doc.category)) return false;
  return hasEdge(wiring, 'runtime', 'doctor');
}
