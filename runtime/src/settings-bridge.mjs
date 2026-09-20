#!/usr/bin/env node
/**
 * Settings bridge — API de producto (Dashboard owner).
 * Escribe el mismo runtime/wiring/{packId}.json que Lab, sin inbox Cursor.
 *
 *   npm run settings:bridge
 *   GET  /v1/health
 *   GET  /v1/wiring?packId=unit-mainnet
 *   POST /v1/wiring   { wiring, packId?, apply?: true }
 *   GET  /v1/host-prefs?packId=unit-mainnet
 *   POST /v1/host-prefs { packId?, mode, bridgeUrl?, mobilityPack?, notes? }
 *
 * Auth: token opcional AGENFT_SETTINGS_TOKEN → header X-Settings-Token.
 * Bind default 127.0.0.1 (host local/VPS del owner). Puerto 8800.
 */
import { createServer } from 'node:http';
import { resolveAgentEnv } from './agenft-env.mjs';
import { loadWiring, saveWiring, validateWiring } from './wiring-loader.mjs';
import { loadHostPrefs, saveHostPrefs } from './host-prefs.mjs';

const PORT = Number(process.env.AGENFT_SETTINGS_BRIDGE_PORT ?? 8800);
const HOST = process.env.AGENFT_SETTINGS_BRIDGE_HOST ?? '127.0.0.1';
const CORS = process.env.AGENFT_SETTINGS_BRIDGE_CORS ?? '*';
const TOKEN = process.env.AGENFT_SETTINGS_TOKEN ?? '';

function corsHeaders() {
  return {
    'access-control-allow-origin': CORS,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-settings-token, x-owner-address',
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function checkToken(req, res) {
  if (TOKEN && req.headers['x-settings-token'] !== TOKEN) {
    json(res, 401, { ok: false, error: 'Invalid X-Settings-Token' });
    return false;
  }
  return true;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/v1/health')) {
    json(res, 200, {
      ok: true,
      service: 'agenft-settings-bridge',
      version: 1,
      host: HOST,
      port: PORT,
      features: ['wiring', 'host-prefs'],
      note: 'Producto Dashboard — no es lab-bridge (8799)',
    });
    return;
  }

  if (req.method === 'GET' && req.url?.startsWith('/v1/wiring')) {
    if (!checkToken(req, res)) return;
    try {
      const url = new URL(req.url, `http://${HOST}`);
      const ctx = resolveAgentEnv();
      const packId = url.searchParams.get('packId') ?? ctx.packId;
      const { wiring, path, missing } = loadWiring(packId);
      json(res, 200, { ok: true, packId, wiring, path, missing });
    } catch (e) {
      json(res, 500, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  if (req.method === 'POST' && (req.url === '/v1/wiring' || req.url?.startsWith('/v1/wiring'))) {
    if (!checkToken(req, res)) return;
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const ctx = resolveAgentEnv();
      const wiring = body.wiring ?? body;
      const packId = body.packId ?? wiring.packId ?? ctx.packId;
      validateWiring(wiring, { packId });
      const apply = body.apply !== false;
      if (!apply) {
        json(res, 400, {
          ok: false,
          error: 'settings-bridge siempre aplica; usa apply:true o lab-bridge para drafts',
        });
        return;
      }
      const path = saveWiring(packId, wiring);
      const owner = req.headers['x-owner-address'] || body.owner || null;
      json(res, 200, {
        ok: true,
        packId,
        applied: true,
        path,
        owner,
        hint: 'Wiring guardado en este host. Reinicia bots/API si hace falta.',
      });
    } catch (e) {
      json(res, 400, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  if (req.method === 'GET' && req.url?.startsWith('/v1/host-prefs')) {
    if (!checkToken(req, res)) return;
    try {
      const url = new URL(req.url, `http://${HOST}`);
      const ctx = resolveAgentEnv();
      const packId = url.searchParams.get('packId') ?? ctx.packId;
      const { prefs, path, missing } = loadHostPrefs(packId);
      json(res, 200, { ok: true, packId, prefs, path, missing });
    } catch (e) {
      json(res, 500, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  if (req.method === 'POST' && req.url?.startsWith('/v1/host-prefs')) {
    if (!checkToken(req, res)) return;
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const ctx = resolveAgentEnv();
      const packId = body.packId ?? ctx.packId;
      const { prefs, path } = saveHostPrefs(packId, body);
      json(res, 200, {
        ok: true,
        packId,
        prefs,
        path,
        hint: 'Preferencias de host en runtime/data (no viajan con el NFT).',
      });
    } catch (e) {
      json(res, 400, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`agenft-settings-bridge http://${HOST}:${PORT} (wiring + host-prefs)`);
});
