#!/usr/bin/env node
/**
 * Bot Telegram → cerebro ageNFT (sin LLM genérico de Hermes).
 *
 * Token: AGENFT_TELEGRAM_BOT_TOKEN o TELEGRAM_BOT_TOKEN
 * Allowlist: AGENFT_TELEGRAM_ALLOWED_USERS=123,456 (vacío = abierto)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAgentEnv } from './agenft-env.mjs';
import { gatewayEnabled } from './wiring-loader.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNTIME = join(__dirname, '..');

function loadEnvFile() {
  const path = join(homedir(), '.credentials/agenft-telegram.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i);
    const v = t.slice(i + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvFile();

const TOKEN =
  process.env.AGENFT_TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN ?? '';
const pay = process.argv.includes('--pay');
const allowed = (process.env.AGENFT_TELEGRAM_ALLOWED_USERS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!TOKEN) {
  console.error('Falta AGENFT_TELEGRAM_BOT_TOKEN en env o ~/.credentials/agenft-telegram.env');
  process.exit(1);
}

try {
  const ctx = resolveAgentEnv();
  if (!gatewayEnabled(ctx.wiring)) {
    console.error(
      'Gateway Telegram no cableado al Motor — revisa runtime/wiring/' + ctx.packId + '.json',
    );
    console.error('(Desconecta el servicio o restaura edge runtime → gateway)');
    process.exit(2);
  }
} catch (e) {
  console.warn('wiring check skip:', e.message ?? e);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${method}: ${json.description ?? res.status}`);
  return json.result;
}

function runBrain(text) {
  const args = pay
    ? ['run', 'hermes:turn:pay', '--', '--plain', '--quiet', text]
    : ['run', 'hermes:turn', '--', '--plain', '--quiet', text];
  const r = spawnSync('npm', args, {
    cwd: RUNTIME,
    encoding: 'utf8',
    env: {
      ...process.env,
      AGENFT_TOKEN_ID: process.env.AGENFT_TOKEN_ID ?? '1',
      AGENFT_USER_MESSAGE: text,
    },
  });
  if (r.status === 2) {
    return 'El agente está en modo DORMANT (presupuesto o USDC bajo). Inténtalo más tarde.';
  }
  if (r.status !== 0) {
    return `Error del runtime (${r.status}): ${(r.stderr || r.stdout || 'unknown').slice(0, 200)}`;
  }
  return (r.stdout || '').trim() || '(sin respuesta)';
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from?.id ?? '');
  const text = (msg.text ?? '').trim();
  if (!text || text.startsWith('/start')) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Hola — soy Unit-Mainnet (ageNFT en Base mainnet). Mi rostro es URUIRU, un Gespenster. Escribe tu mensaje.',
    });
    return;
  }
  if (allowed.length && !allowed.includes(userId)) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Acceso restringido (lab).',
    });
    return;
  }
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  const reply = runBrain(text);
  await tg('sendMessage', { chat_id: chatId, text: reply.slice(0, 4000) });
}

async function poll(offset = 0) {
  const updates = await tg('getUpdates', { timeout: 50, offset });
  let next = offset;
  for (const u of updates) {
    next = u.update_id + 1;
    if (u.message) {
      try {
        await handleMessage(u.message);
      } catch (e) {
        console.error('handle error:', e.message ?? e);
      }
    }
  }
  return poll(next);
}

console.log(
  `ageNFT Telegram bot — token #${process.env.AGENFT_TOKEN_ID ?? '1'} — pay=${pay} — allowlist=${allowed.length || 'open'}`,
);
poll(0).catch((e) => {
  console.error('poll fatal:', e.message ?? e);
  process.exit(1);
});
