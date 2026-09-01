/**
 * Utilidades Telegram gateway — token Vault 0, probe getMe, proceso bot.
 * Precedente: docs/decisions/precedents/P001-telegram-handle-transfer.md
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const TELEGRAM_ENV_PATH = join(homedir(), '.credentials/agenft-telegram.env');

/** @returns {string} */
export function loadTelegramToken() {
  const env =
    process.env.AGENFT_TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (env) return env;

  if (!existsSync(TELEGRAM_ENV_PATH)) return '';
  for (const line of readFileSync(TELEGRAM_ENV_PATH, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k === 'AGENFT_TELEGRAM_BOT_TOKEN' || k === 'TELEGRAM_BOT_TOKEN') return v;
  }
  return '';
}

/** @param {object} manifest */
export function manifestTelegramHandle(manifest) {
  const chat = manifest?.gateways?.chat ?? [];
  const tg = chat.find((c) => c.platform === 'telegram' && c.enabled !== false);
  const raw = tg?.handle ?? null;
  if (!raw || typeof raw !== 'string') return null;
  return raw.replace(/^@/, '').trim() || null;
}

/**
 * @param {string} token
 * @returns {Promise<{ present: boolean, alive: boolean, dead: boolean, status: number|string, username?: string, botId?: number, detail?: string }>}
 */
export async function probeTelegramGetMe(token) {
  if (!token) {
    return { present: false, alive: false, dead: false, status: 'no_token' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(12_000),
    });

    if (res.status === 401) {
      return { present: true, alive: false, dead: true, status: 401 };
    }

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return { present: true, alive: false, dead: false, status: res.status, detail };
    }

    const data = await res.json();
    const username = data?.result?.username ?? null;
    return {
      present: true,
      alive: true,
      dead: false,
      status: 200,
      username,
      botId: data?.result?.id,
    };
  } catch (e) {
    return {
      present: true,
      alive: false,
      dead: false,
      status: 'error',
      detail: e.message ?? String(e),
    };
  }
}

export function isTelegramBotRunning() {
  try {
    const out = execSync('pgrep -af telegram-unit-mainnet-bot.mjs 2>/dev/null || true', {
      encoding: 'utf8',
      timeout: 1500,
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}
