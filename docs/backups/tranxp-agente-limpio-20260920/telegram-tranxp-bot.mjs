#!/usr/bin/env node
/**
 * Bot Telegram TranXp — sin ciudad por defecto (agente “nuevo”).
 *
 * Flujo: /start → elegir City Pack → preguntas de transporte.
 * Favoritos personales = M2 (`runtime/data/tranxp/personal-store.json`) — no viajan con el NFT.
 *
 * Token: TRANXP_TELEGRAM_BOT_TOKEN
 * Pack opcional solo si el usuario aún no eligió: TRANXP_CITY_PACK (vacío = obligatorio elegir)
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mobilityReply } from './mobility-reply.mjs';
import {
  addPersonalFavorite,
  getPersonalUser,
  matchPersonalFavorite,
  personalStorePath,
  removePersonalFavorite,
  setPersonalPack,
} from './tranxp-personal.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const MOBILITY_PY = join(REPO, 'pieces/mobility/tools/mobility.py');
const PACKS_DIR = join(REPO, 'pieces/mobility/packs');

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
/** Hint opcional; ya no forzamos valencia-es. */
const ENV_PACK_HINT = (process.env.TRANXP_CITY_PACK || '').trim();
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

function listPacks() {
  const out = [];
  if (!existsSync(PACKS_DIR)) return out;
  for (const id of readdirSync(PACKS_DIR)) {
    if (id.startsWith('_')) continue;
    const path = join(PACKS_DIR, id, 'city-pack.json');
    if (!existsSync(path)) continue;
    try {
      const p = JSON.parse(readFileSync(path, 'utf8'));
      out.push({
        id: p.id || id,
        name: p.name || id,
        country: p.country || '??',
      });
    } catch {
      /* skip */
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

const PACKS = listPacks();

function chatKey(chatId) {
  return `telegram:${chatId}`;
}

function activePackId(chatId) {
  const u = getPersonalUser(chatKey(chatId));
  return u.packId || ENV_PACK_HINT || '';
}

function packById(id) {
  return PACKS.find((p) => p.id === id) || null;
}

function cityKeyboard() {
  const rows = [];
  for (const p of PACKS) {
    rows.push([{ text: `${p.name}`, callback_data: `pack:${p.id}` }]);
  }
  if (!rows.length) {
    rows.push([{ text: '(sin City Packs)', callback_data: 'noop' }]);
  }
  return { inline_keyboard: rows };
}

function helpText(packId) {
  const pack = packById(packId);
  const lines = [
    `Hola — soy **${DISPLAY}** (movilidad AgeNFT).`,
    pack
      ? `Ciudad: ${pack.name} (\`${pack.id}\`)`
      : 'Aún no hay ciudad — pulsa /ciudad',
    '',
    'Comandos:',
    '/start · /ciudad — elegir City Pack (obligatorio)',
    '/help — esta ayuda',
    '/scan — refrescar avisos RSS del pack',
    '/favs — tus favoritos personales (no viajan al vender el NFT)',
    '/fav add etiqueta red parada [línea]',
    '/fav del etiqueta',
    '',
    'Ejemplos (según ciudad):',
    '· próximo bus …',
    '· cuánto falta tren …',
    '· avisos',
  ];
  return lines.join('\n');
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

async function sendCityPicker(chatId, preface) {
  const text =
    (preface ? preface + '\n\n' : '') +
    `${DISPLAY} — elige ciudad.\n` +
    `Hay ${PACKS.length} City Pack(s). Sin ciudad no consulto transporte.`;
  await tg('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: cityKeyboard(),
  });
}

async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  const data = cq.data || '';
  if (!chatId) return;
  await tg('answerCallbackQuery', { callback_query_id: cq.id });
  if (data === 'noop') return;
  if (data.startsWith('pack:')) {
    const id = data.slice(5);
    const pack = packById(id);
    if (!pack) {
      await tg('sendMessage', { chat_id: chatId, text: `Pack desconocido: ${id}` });
      return;
    }
    setPersonalPack(chatKey(chatId), id);
    await tg('sendMessage', {
      chat_id: chatId,
      text: helpText(id),
      parse_mode: 'Markdown',
    });
  }
}

function formatFavBoardHint(fav) {
  const bits = [fav.network, `parada ${fav.stop}`];
  if (fav.line) bits.push(`línea ${fav.line}`);
  return bits.join(' · ');
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

  const key = chatKey(chatId);
  const low = text.toLowerCase();

  if (low === '/start' || low === '/ciudad' || low === '/city') {
    await sendCityPicker(chatId);
    return;
  }
  if (low === '/help') {
    const packId = activePackId(chatId);
    if (!packId) {
      await sendCityPicker(chatId, 'Primero elige ciudad.');
      return;
    }
    await tg('sendMessage', {
      chat_id: chatId,
      text: helpText(packId),
      parse_mode: 'Markdown',
    });
    return;
  }

  if (low === '/favs' || low === '/favoritos') {
    const favs = getPersonalUser(key).favorites || [];
    if (!favs.length) {
      await tg('sendMessage', {
        chat_id: chatId,
        text:
          'Sin favoritos personales.\n' +
          'Añade: /fav add casa metrobus 168 112A\n' +
          '(etiqueta red parada [línea]) — se guardan en M2, no en el City Pack.',
      });
      return;
    }
    const lines = favs.map(
      (f) => `· ${f.label} — ${f.packId} · ${formatFavBoardHint(f)}`,
    );
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Tus favoritos (personales · no viajan con el NFT):\n' + lines.join('\n'),
    });
    return;
  }

  if (low.startsWith('/fav ')) {
    const rest = text.slice(5).trim();
    const del = rest.match(/^del\s+(\S+)/i);
    if (del) {
      removePersonalFavorite(key, del[1]);
      await tg('sendMessage', { chat_id: chatId, text: `Favorito quitado: ${del[1]}` });
      return;
    }
    const add = rest.match(/^add\s+(\S+)\s+(\S+)\s+(\S+)(?:\s+(\S+))?/i);
    if (add) {
      const packId = activePackId(chatId);
      if (!packId) {
        await sendCityPicker(chatId, 'Elige ciudad antes de guardar favoritos.');
        return;
      }
      addPersonalFavorite(key, {
        label: add[1],
        network: add[2],
        stop: add[3],
        line: add[4],
        packId,
      });
      await tg('sendMessage', {
        chat_id: chatId,
        text: `Favorito guardado: «${add[1]}» → ${add[2]} ${add[3]}${add[4] ? ' ' + add[4] : ''}`,
      });
      return;
    }
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Uso:\n/fav add casa metrobus 168 112A\n/fav del casa\n/favs',
    });
    return;
  }

  const packId = activePackId(chatId);
  if (!packId) {
    await sendCityPicker(chatId, 'Elige ciudad para continuar.');
    return;
  }

  if (low === '/scan') {
    await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
    const r = spawnSync('python3', [MOBILITY_PY, 'scan', packId], {
      encoding: 'utf8',
      timeout: 60_000,
    });
    const out = (r.stdout || r.stderr || '').trim().slice(0, 3500) || '(scan vacío)';
    await tg('sendMessage', { chat_id: chatId, text: out });
    return;
  }

  if (low === '/pack') {
    const pack = packById(packId);
    await tg('sendMessage', {
      chat_id: chatId,
      text: `Pack activo: ${pack?.name || packId}\nCambia con /ciudad`,
    });
    return;
  }

  // Favorito personal → consulta concreta
  const fav = matchPersonalFavorite(key, text);
  let query = text;
  if (fav && fav.packId === packId) {
    query = `próximo ${fav.network} parada ${fav.stop}${fav.line ? ' línea ' + fav.line : ''}`;
  } else if (fav && fav.packId !== packId) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: `Ese favorito es de \`${fav.packId}\`. Cambia con /ciudad o borra el favorito.`,
      parse_mode: 'Markdown',
    });
    return;
  }

  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  let reply = mobilityReply(packId, query);
  if (fav) {
    reply = `⭐ ${fav.label} (${formatFavBoardHint(fav)})\n\n` + reply;
  }
  await tg('sendMessage', { chat_id: chatId, text: reply.slice(0, 4000) });
}

async function poll(offset = 0) {
  const updates = await tg('getUpdates', { timeout: 50, offset });
  let next = offset;
  for (const u of updates) {
    next = u.update_id + 1;
    try {
      if (u.callback_query) await handleCallback(u.callback_query);
      else if (u.message) await handleMessage(u.message);
    } catch (e) {
      console.error('handle error:', e.message ?? e);
    }
  }
  return poll(next);
}

console.log(
  `TranXp Telegram — sin ciudad por defecto — packs=${PACKS.length} — personal=${personalStorePath()} — allowlist=${allowed.length || 'open'}`,
);
if (ENV_PACK_HINT) {
  console.log(`(hint TRANXP_CITY_PACK=${ENV_PACK_HINT} solo si el chat aún no eligió)`);
}
poll(0).catch((e) => {
  console.error('poll fatal:', e.message ?? e);
  process.exit(1);
});
