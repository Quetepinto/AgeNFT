import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { loadManifest, REPO_ROOT } from './manifest-loader.mjs';

const MANIFEST_BY_TOKEN = {
  114: 'docs/manifest/examples/unit-0-lab.json',
  115: 'docs/manifest/examples/unit-1-lab.json',
};

/**
 * Resuelve agente lab desde env (AGENFT_TOKEN_ID, AGENFT_MANIFEST_PATH).
 */
export function resolveAgentEnv() {
  const tokenId = String(process.env.AGENFT_TOKEN_ID ?? '115');
  const manifestPath =
    process.env.AGENFT_MANIFEST_PATH ??
    MANIFEST_BY_TOKEN[tokenId] ??
    'docs/manifest/examples/unit-1-lab.json';

  const absManifest = manifestPath.startsWith('/')
    ? manifestPath
    : join(REPO_ROOT, manifestPath);

  if (!existsSync(absManifest)) {
    throw new Error(`Manifiesto no encontrado: ${absManifest}`);
  }

  const loaded = loadManifest(absManifest);
  return { tokenId, manifestPath: absManifest, ...loaded };
}
