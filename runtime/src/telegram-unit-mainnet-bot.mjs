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
import {
  mobilityReply,
  parseTranxCommand,
  resolveMobilityFromManifest,
} from './mobility-reply.mjs';

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

const BOT_DISPLAY_NAME = process.env.AGENFT_TELEGRAM_DISPLAY_NAME ?? 'URUIRU';
const API = `https://api.telegram.org/bot${TOKEN}`;

async function ensureBotProfile() {
  if (process.env.AGENFT_TELEGRAM_SKIP_PROFILE === '1') return;
  try {
    await tg('setMyName', { name: BOT_DISPLAY_NAME });
    await tg('setMyDescription', {
      description: `${BOT_DISPLAY_NAME} · Gespenster (Ety Fefer) · Unit-Mainnet #1 ageNFT en Base.`,
    });
  } catch (e) {
    console.warn('telegram profile skip:', e.message ?? e);
  }
}

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
      text: `Hola — soy **${BOT_DISPLAY_NAME}** (Unit-Mainnet #1, ageNFT en Base mainnet). Gespenster de Ety Fefer. Escribe tu mensaje.\n\nTransporte (TRNXP, sin LLM): /tranx próximo bus suecia`,
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

  const tranxQ = parseTranxCommand(text);
  if (tranxQ !== null) {
    const { pack, enabled } = resolveMobilityFromManifest();
    if (!enabled && !process.env.AGENFT_MOBILITY_PACK) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: 'Capacidad mobility/v0 no habilitada en el manifiesto (capabilities).',
      });
      return;
    }
    if (!pack) {
      await tg('sendMessage', {
        chat_id: chatId,
        text:
          'Sin City Pack en manifiesto ni AGENFT_MOBILITY_PACK.\n' +
          'Configura packs[] en capabilities o el env. Bot lite: /ciudad.',
      });
      return;
    }
    if (!tranxQ) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: `Uso: /tranx <pregunta>\nPack: ${pack}\nEj.: /tranx próximo bus suecia`,
      });
      return;
    }
    await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
    const reply = mobilityReply(pack, tranxQ);
    await tg('sendMessage', { chat_id: chatId, text: reply.slice(0, 4000) });
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
  `ageNFT Telegram bot — ${BOT_DISPLAY_NAME} — token #${process.env.AGENFT_TOKEN_ID ?? '1'} — pay=${pay} — allowlist=${allowed.length || 'open'}`,
);
await ensureBotProfile();
poll(0).catch((e) => {
  console.error('poll fatal:', e.message ?? e);
  process.exit(1);
});
