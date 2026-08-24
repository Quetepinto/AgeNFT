#!/usr/bin/env node
/**
 * API HTTP mínima — chat web → runTurn.
 *
 * GitHub Pages es estático; el cerebro vive aquí (VPS local del operador).
 *
 * Uso:
 *   AGENFT_CHAT_API_PORT=8787 npm run chat:api
 *   curl -X POST http://127.0.0.1:8787/v1/turn -H 'content-type: application/json' \
 *     -d '{"message":"Hola"}'
 */
import { createServer } from 'node:http';
import { resolveAgentEnv } from './agenft-env.mjs';
import { runTurn } from './run-turn.mjs';
import { loadWiring, chatWebEnabled } from './wiring-loader.mjs';

const PORT = Number(process.env.AGENFT_CHAT_API_PORT ?? 8787);
const HOST = process.env.AGENFT_CHAT_API_HOST ?? '127.0.0.1';
const PAY = process.env.AGENFT_CHAT_API_PAY !== '0';
const CORS = process.env.AGENFT_CHAT_API_CORS ?? '*';

function corsHeaders() {
  return {
    'access-control-allow-origin': CORS,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    json(res, 200, { ok: true, service: 'agenft-chat-api', pay: PAY });
    return;
  }

  if (req.method === 'GET' && req.url?.startsWith('/v1/wiring')) {
    try {
      const ctx = resolveAgentEnv();
      const { wiring, path, missing } = loadWiring(ctx.packId);
      json(res, 200, { ok: true, packId: ctx.packId, wiring, path, missing });
    } catch (e) {
      json(res, 500, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/v1/turn') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      json(res, 400, { ok: false, error: 'JSON inválido' });
      return;
    }
    const message = String(body.message ?? '').trim();
    if (!message) {
      json(res, 400, { ok: false, error: 'Falta message' });
      return;
    }
    const pay = body.pay !== undefined ? Boolean(body.pay) : PAY;
    try {
      const ctx = resolveAgentEnv();
      if (!chatWebEnabled(ctx.wiring)) {
        json(res, 503, {
          ok: false,
          error: 'Chat web no cableado al Motor (runtime/wiring)',
          wiringBlocked: true,
        });
        return;
      }
      const out = await runTurn({
        ...ctx,
        userMessage: message,
        pay,
        force: false,
        syncMemory: false,
        quiet: true,
      });
      json(res, 200, {
        ok: out.ok,
        dormant: out.dormant ?? false,
        assistantText: out.assistantText ?? null,
        reason: out.reason ?? null,
        payer: out.payer ?? null,
        costUsd: out.costUsd ?? null,
      });
    } catch (e) {
      json(res, 500, { ok: false, error: e.message ?? String(e) });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`agenft-chat-api http://${HOST}:${PORT} pay=${PAY} cors=${CORS}`);
});
