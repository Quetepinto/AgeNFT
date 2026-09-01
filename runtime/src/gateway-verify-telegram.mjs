#!/usr/bin/env node
/**
 * Verifica token Telegram vía getMe (vivo / muerto).
 * Precedente P001: docs/decisions/precedents/P001-telegram-handle-transfer.md
 *
 * Uso:
 *   npm run gateway:verify-telegram
 *   npm run gateway:verify-telegram -- --must-be-dead   # ex-owner checklist
 *   npm run gateway:verify-telegram -- --must-be-alive # nuevo owner antes de arrancar
 *   npm run gateway:verify-telegram -- --json
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTelegramToken, probeTelegramGetMe } from './telegram-gateway-utils.mjs';

async function main() {
  const mustBeDead = process.argv.includes('--must-be-dead');
  const mustBeAlive = process.argv.includes('--must-be-alive');
  const jsonOut = process.argv.includes('--json');

  const token = loadTelegramToken();
  const probe = await probeTelegramGetMe(token);

  const report = {
    at: new Date().toISOString(),
    tokenPresent: probe.present,
    alive: probe.alive,
    dead: probe.dead,
    httpStatus: probe.status,
    username: probe.username ?? null,
    botId: probe.botId ?? null,
    detail: probe.detail ?? null,
  };

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
  } else if (!probe.present) {
    console.log('TELEGRAM_VERIFY: sin token (Vault 0 vacío)');
  } else if (probe.dead) {
    console.log('TELEGRAM_VERIFY: token MUERTO (401) — OK checklist ex-owner');
  } else if (probe.alive) {
    console.log(`TELEGRAM_VERIFY: token VIVO — @${probe.username ?? '?'}`);
  } else {
    console.log(`TELEGRAM_VERIFY: indeterminado — status ${probe.status}${probe.detail ? ` (${probe.detail})` : ''}`);
  }

  if (mustBeDead) {
    if (!probe.present) process.exit(0);
    process.exit(probe.dead ? 0 : 1);
  }
  if (mustBeAlive) {
    if (!probe.present) {
      console.error('Falta token Telegram en Vault 0');
      process.exit(1);
    }
    process.exit(probe.alive ? 0 : 1);
  }

  if (!probe.present) process.exit(0);
  process.exit(probe.alive ? 0 : probe.dead ? 2 : 1);
}

const isMain =
  process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) {
  main().catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  });
}
