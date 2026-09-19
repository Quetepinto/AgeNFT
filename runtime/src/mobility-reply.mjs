/**
 * Helper compartido: TranXp / mobility reply sin LLM.
 * Usado por telegram-tranxp-bot y por el bot Unit-Mainnet (/tranx).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const MOBILITY_PY = join(REPO, 'pieces/mobility/tools/mobility.py');
const UNIT_MANIFEST = join(REPO, 'docs/manifest/examples/unit-mainnet.json');

/**
 * @param {string} pack
 * @param {string} text
 * @returns {string}
 */
export function mobilityReply(pack, text) {
  if (!existsSync(MOBILITY_PY)) {
    return `No encuentro mobility.py (${MOBILITY_PY}).`;
  }
  const r = spawnSync('python3', [MOBILITY_PY, 'reply', pack, text], {
    encoding: 'utf8',
    timeout: 45_000,
    env: process.env,
  });
  if (r.error) return `Error al consultar transporte: ${r.error.message}`;
  if (r.status !== 0 && !(r.stdout || '').trim()) {
    return `Error mobility (${r.status}): ${(r.stderr || '').slice(0, 300)}`;
  }
  return (r.stdout || '').trim() || '(sin respuesta del pack)';
}

/**
 * Pack activo para Unit-Mainnet: env > primer capability mobility > valencia-es.
 * @returns {{ pack: string, enabled: boolean }}
 */
export function resolveMobilityFromManifest() {
  const fromEnv = process.env.AGENFT_MOBILITY_PACK?.trim();
  if (fromEnv) return { pack: fromEnv, enabled: true };

  try {
    if (!existsSync(UNIT_MANIFEST)) {
      return { pack: 'valencia-es', enabled: false };
    }
    const man = JSON.parse(readFileSync(UNIT_MANIFEST, 'utf8'));
    const caps = man.capabilities || [];
    const mob = caps.find(
      (c) => c && (c.id === 'mobility/v0' || c.id === 'mobility') && c.enabled !== false,
    );
    if (!mob) return { pack: 'valencia-es', enabled: false };
    const pack = (mob.packs && mob.packs[0]) || 'valencia-es';
    return { pack, enabled: true };
  } catch {
    return { pack: 'valencia-es', enabled: false };
  }
}

/**
 * Si el mensaje es /tranx … o "tranx …", extrae el resto.
 * @param {string} text
 * @returns {string|null} pregunta o null si no es comando TranXp
 */
export function parseTranxCommand(text) {
  const t = (text || '').trim();
  const m = t.match(/^\/?tranx(?:@\w+)?(?:\s+|$)(.*)$/i);
  if (!m) return null;
  return (m[1] || '').trim() || null;
}
