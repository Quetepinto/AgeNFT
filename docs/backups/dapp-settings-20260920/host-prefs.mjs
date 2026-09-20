/**
 * Preferencias de hosting del owner — offchain, por pack.
 * No viajan con el NFT (operación local/VPS/nube).
 *
 * runtime/data/{packId}/host-prefs.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './manifest-loader.mjs';

export const HOST_PREFS_TYPE = 'agenft-host-prefs/v1';

/** @typedef {'browser' | 'local' | 'vps' | 'custom'} HostMode */

/**
 * @typedef {{
 *   type: string,
 *   packId: string,
 *   mode: HostMode,
 *   bridgeUrl?: string,
 *   mobilityPack?: string,
 *   notes?: string,
 *   updatedAt?: string,
 * }} HostPrefs
 */

function prefsPath(packId) {
  return join(REPO_ROOT, 'runtime/data', packId, 'host-prefs.json');
}

/** @returns {HostPrefs} */
export function defaultHostPrefs(packId) {
  return {
    type: HOST_PREFS_TYPE,
    packId,
    mode: 'local',
    bridgeUrl: 'http://127.0.0.1:8800',
    mobilityPack: '',
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}

export function loadHostPrefs(packId) {
  const path = prefsPath(packId);
  if (!existsSync(path)) {
    return { prefs: defaultHostPrefs(packId), path, missing: true };
  }
  try {
    const prefs = JSON.parse(readFileSync(path, 'utf8'));
    return {
      prefs: { ...defaultHostPrefs(packId), ...prefs, packId, type: HOST_PREFS_TYPE },
      path,
      missing: false,
    };
  } catch (e) {
    throw new Error(`host-prefs corrupt: ${e.message}`);
  }
}

/** @param {string} packId @param {Partial<HostPrefs>} patch */
export function saveHostPrefs(packId, patch) {
  const { prefs: cur } = loadHostPrefs(packId);
  const mode = patch.mode ?? cur.mode;
  if (!['browser', 'local', 'vps', 'custom'].includes(mode)) {
    throw new Error(`host mode inválido: ${mode}`);
  }
  /** @type {HostPrefs} */
  const next = {
    type: HOST_PREFS_TYPE,
    packId,
    mode,
    bridgeUrl: String(patch.bridgeUrl ?? cur.bridgeUrl ?? '').trim() || undefined,
    mobilityPack: String(patch.mobilityPack ?? cur.mobilityPack ?? '').trim() || '',
    notes: String(patch.notes ?? cur.notes ?? ''),
    updatedAt: new Date().toISOString(),
  };
  const path = prefsPath(packId);
  mkdirSync(join(REPO_ROOT, 'runtime/data', packId), { recursive: true });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  return { prefs: next, path };
}

export function hostPrefsPath(packId) {
  return prefsPath(packId);
}
