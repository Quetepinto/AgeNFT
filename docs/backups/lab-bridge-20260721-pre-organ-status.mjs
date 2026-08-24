#!/usr/bin/env node
/**
 * Lab bridge — inbox Cursor + wiring operativo.
 *
 *   npm run lab:bridge
 *   POST /v1/send     { markdown, message, wiring? }
 *   POST /v1/wiring   { wiring, packId?, apply? }  — apply=true escribe runtime/wiring/
 *   GET  /v1/wiring?packId=unit-mainnet
 */
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAgentEnv } from './agenft-env.mjs';
import { loadWiring, saveWiring, validateWiring } from './wiring-loader.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const INBOX = join(REPO, '.cursor/lab-inbox');
const PORT = Number(process.env.AGENFT_LAB_BRIDGE_PORT ?? 8799);
const HOST = process.env.AGENFT_LAB_BRIDGE_HOST ?? '127.0.0.1';
const CORS = process.env.AGENFT_LAB_BRIDGE_CORS ?? '*';
const TOKEN = process.env.AGENFT_LAB_BRIDGE_TOKEN ?? '';

function corsHeaders() {
  return {
    'access-control-allow-origin': CORS,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-lab-token',
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
  if (TOKEN && req.headers['x-lab-token'] !== TOKEN) {
    json(res, 401, { ok: false, error: 'Invalid X-Lab-Token' });
    return false;
  }
  return true;
}

function saveInbox({ markdown, message, wiring }) {
  mkdirSync(INBOX, { recursive: true });
  const ts = new Date().toISOString();
  const mdPath = join(INBOX, 'latest.md');
  const jsonPath = join(INBOX, 'latest.json');
  const wiringDraftPath = join(INBOX, 'wiring-draft.json');
  const pointer =
    (message?.trim() ? `${message.trim()}\n\n---\n\n` : '') + String(markdown ?? '');
  writeFileSync(mdPath, `${pointer}\n`);
  writeFileSync(
    jsonPath,
    `${JSON.stringify({ updatedAt: ts, message: message ?? '', markdown: markdown ?? '' }, null, 2)}\n`,
  );
  let wiringSaved = null;
  if (wiring) {
    writeFileSync(wiringDraftPath, `${JSON.stringify({ updatedAt: ts, wiring }, null, 2)}\n`);
    wiringSaved = wiringDraftPath;
  }
  return { mdPath, jsonPath, wiringDraftPath: wiringSaved, updatedAt: ts };
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/v1/health')) {
    json(res, 200, { ok: true, service: 'agenft-lab-bridge', inbox: INBOX });
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

  if (req.method === 'POST' && req.url === '/v1/send') {
    if (!checkToken(req, res)) return;
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const saved = saveInbox({
        markdown: body.markdown ?? body.text ?? '',
        message: body.message ?? '',
        wiring: body.wiring ?? null,
      });
      json(res, 200, {
        ok: true,
        path: '.cursor/lab-inbox/latest.md',
        wiringDraft: saved.wiringDraftPath ? '.cursor/lab-inbox/wiring-draft.json' : null,
        updatedAt: saved.updatedAt,
        hint: 'En Cursor: @.cursor/lab-inbox/latest.md · wiring: npm run wiring:apply',
      });
    } catch (e) {
      json(res, 400, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/v1/wiring') {
    if (!checkToken(req, res)) return;
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const ctx = resolveAgentEnv();
      const wiring = body.wiring ?? body;
      const packId = body.packId ?? wiring.packId ?? ctx.packId;
      validateWiring(wiring, { packId });

      mkdirSync(INBOX, { recursive: true });
      const draftPath = join(INBOX, 'wiring-draft.json');
      writeFileSync(draftPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), wiring }, null, 2)}\n`);

      let appliedPath = null;
      if (body.apply) {
        appliedPath = saveWiring(packId, wiring);
      }

      json(res, 200, {
        ok: true,
        packId,
        draft: '.cursor/lab-inbox/wiring-draft.json',
        applied: Boolean(appliedPath),
        path: appliedPath,
        hint: appliedPath
          ? 'Wiring aplicado al runtime. Reinicia servicios si hace falta.'
          : 'Borrador guardado. Aplica con npm run wiring:apply o apply:true',
      });
    } catch (e) {
      json(res, 400, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`agenft-lab-bridge http://${HOST}:${PORT} → ${INBOX}`);
});
