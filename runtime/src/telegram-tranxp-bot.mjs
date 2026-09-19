#!/usr/bin/env node
/**
 * Bot Telegram TranXp — hábitat lite sin LLM.
 * Llama a pieces/mobility/tools/mobility.py reply <pack> "<texto>".
 *
 * Token: TRANXP_TELEGRAM_BOT_TOKEN o AGENFT_TRANXP_BOT_TOKEN
 * Pack:  TRANXP_CITY_PACK=valencia-es (default)
 * Allowlist: TRANXP_TELEGRAM_ALLOWED_USERS=123,456 (vacío = abierto)
 *
 * Credenciales opcionales: ~/.credentials/agenft-tranxp-telegram.env
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mobilityReply } from './mobility-reply.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const MOBILITY_PY = join(REPO, 'pieces/mobility/tools/mobility.py');

function loadEnvFile() {
  const path = join(homedir(), '.credentials/agenft-tranxp-telegram.env');
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
  process.env.TRANXP_TELEGRAM_BOT_TOKEN ??
  process.env.AGENFT_TRANXP_BOT_TOKEN ??
  '';
const PACK = process.env.TRANXP_CITY_PACK ?? 'valencia-es';
const allowed = (process.env.TRANXP_TELEGRAM_ALLOWED_USERS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!TOKEN) {
  console.error(
    'Falta TRANXP_TELEGRAM_BOT_TOKEN (o AGENFT_TRANXP_BOT_TOKEN) en env o ~/.credentials/agenft-tranxp-telegram.env',
  );
  process.exit(1);
}

if (!existsSync(MOBILITY_PY)) {
  console.error('No encuentro mobility.py en', MOBILITY_PY);
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;
const DISPLAY = process.env.TRANXP_TELEGRAM_DISPLAY_NAME ?? 'TranXp';

async function tg(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${method}: ${json.description ?? res.status}`);
  return json.result;
}

function helpText() {
  return [
    `Hola — soy **${DISPLAY}** (AgeNFT movilidad, modo básico, sin modelo).`,
    `Pack activo: \`${PACK}\`. Cambia con TRANXP_CITY_PACK (valencia-es | madrid-es).`,
    '',
    'Ejemplos:',
    '· próximo bus suecia',
    '· cuánto falta tren cabanyal',
    '· próximo tren atocha',
    '',
    'Comandos: /start /pack /scan /help',
  ].join('\n');
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = String(msg.from?.id ?? '');
  const text = (msg.text ?? '').trim();
  if (!text) return;

  if (allowed.length && !allowed.includes(userId)) {
    await tg('sendMessage', { chat_id: chatId, text: 'Acceso restringido.' });
    return;
  }

  const low = text.toLowerCase();
  if (low === '/start' || low === '/help') {
    await tg('sendMessage', { chat_id: chatId, text: helpText(), parse_mode: 'Markdown' });
    return;
  }
  if (low === '/pack') {
    await tg('sendMessage', {
      chat_id: chatId,
      text: `Pack activo: ${PACK}\nCambia env TRANXP_CITY_PACK y reinicia el bot.`,
    });
    return;
  }
  if (low === '/scan') {
    await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
    const r = spawnSync('python3', [MOBILITY_PY, 'scan', PACK], {
      encoding: 'utf8',
      timeout: 60_000,
    });
    const out = (r.stdout || r.stderr || '').trim().slice(0, 3500) || '(scan vacío)';
    await tg('sendMessage', { chat_id: chatId, text: out });
    return;
  }

  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  const reply = mobilityReply(PACK, text);
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
  `TranXp Telegram — pack=${PACK} — allowlist=${allowed.length || 'open'} — sin LLM`,
);
poll(0).catch((e) => {
  console.error('poll fatal:', e.message ?? e);
  process.exit(1);
});
