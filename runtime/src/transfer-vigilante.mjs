#!/usr/bin/env node
/**
 * Vigilante transfer — Doctor de mudanza (Hygiene + gates).
 * Precedente P001: docs/decisions/precedents/P001-telegram-handle-transfer.md
 *
 * Detecta cables sueltos tras transfer (con o sin wizard): owner gate, token Telegram,
 * handle manifiesto obsoleto, bot en marcha con wallet ajena.
 *
 * Uso:
 *   npm run transfer:vigilante
 *   npm run transfer:vigilante -- --json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAgentEnv } from './agenft-env.mjs';
import { checkOwnerGate, ownerGateRequired } from './owner-gate.mjs';
import { gatewayEnabled } from './wiring-loader.mjs';
import {
  isTelegramBotRunning,
  loadTelegramToken,
  manifestTelegramHandle,
  probeTelegramGetMe,
} from './telegram-gateway-utils.mjs';

/** @typedef {{ id: string, severity: 'critical'|'warning'|'info', message: string, action?: string }} Finding */

/**
 * @param {'critical'|'warning'|'info'} severity
 * @param {string} id
 * @param {string} message
 * @param {string} [action]
 * @returns {Finding}
 */
function finding(severity, id, message, action) {
  return { id, severity, message, action };
}

function readDoctorProbe(dataDir) {
  const path = join(dataDir, 'doctor/latest-probe.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function worstSeverity(findings) {
  if (findings.some((f) => f.severity === 'critical')) return 'critical';
  if (findings.some((f) => f.severity === 'warning')) return 'warning';
  return 'ok';
}

/**
 * @param {import('./agenft-env.mjs').resolveAgentEnv extends Function ? Awaited<ReturnType<import('./agenft-env.mjs').resolveAgentEnv>> : never} ctx
 */
export async function runTransferVigilante(ctx) {
  /** @type {Finding[]} */
  const findings = [];
  const manifest = ctx.manifest;
  const transfer = manifest?.transfer ?? {};
  const gatewayWired = gatewayEnabled(ctx.wiring);
  const gateRequired = ownerGateRequired(manifest);

  const gate = gateRequired
    ? await checkOwnerGate({ manifest, tokenId: ctx.tokenId })
    : { ok: true, skipped: true };

  if (gateRequired && !gate.ok) {
    findings.push(
      finding(
        'critical',
        'owner_gate',
        gate.reason ?? 'ownerOf no coincide con wallet operadora',
        'Pare el bot Telegram. Si vendiste: revoca token. Si compraste: conecta tu wallet y crea bot nuevo.',
      ),
    );
  }

  const manifestHandle = manifestTelegramHandle(manifest);
  const token = loadTelegramToken();
  const telegram = token ? await probeTelegramGetMe(token) : { present: false, alive: false, dead: false, status: 'no_token' };
  const botRunning = isTelegramBotRunning();

  if (gatewayWired && !token) {
    findings.push(
      finding(
        'warning',
        'token_missing',
        'Gateway Telegram cableado pero no hay token en Vault 0',
        'Crea bot nuevo en @BotFather → ~/.credentials/agenft-telegram.env',
      ),
    );
  }

  if (token && telegram.alive && gateRequired && !gate.ok) {
    findings.push(
      finding(
        'critical',
        'token_alive_wrong_owner',
        `Token Telegram vivo (@${telegram.username ?? '?'}) pero wallet operadora ≠ ownerOf`,
        'Revoca token en BotFather (ex-owner) o usa token de TU bot nuevo (comprador).',
      ),
    );
  }

  if (token && telegram.dead) {
    findings.push(
      finding(
        'info',
        'token_dead',
        'Token Telegram muerto (401) — coherente con checklist ex-owner',
        gate.ok ? 'Pega token de tu bot nuevo antes de arrancar.' : undefined,
      ),
    );
  }

  if (manifestHandle && telegram.username && manifestHandle.toLowerCase() !== telegram.username.toLowerCase()) {
    findings.push(
      finding(
        'warning',
        'manifest_handle_stale',
        `Manifiesto menciona @${manifestHandle} pero Vault 0 usa @${telegram.username}`,
        'Esperado tras transfer (new-bot-only). Actualiza manifiesto cuando estabilices el bot.',
      ),
    );
  }

  if (manifestHandle && !telegram.username && gatewayWired && gate.ok) {
    findings.push(
      finding(
        'warning',
        'manifest_handle_unverified',
        `Manifiesto menciona @${manifestHandle} — no verificado (sin token vivo)`,
        'Configura tu bot nuevo y vuelve a ejecutar transfer:vigilante.',
      ),
    );
  }

  if (botRunning && gateRequired && !gate.ok) {
    findings.push(
      finding(
        'critical',
        'bot_running_wrong_owner',
        'Proceso bot Telegram activo con owner gate en fallo',
        'pkill -f telegram-unit-mainnet-bot && revocar token si eres ex-owner.',
      ),
    );
  }

  if (botRunning && !token) {
    findings.push(
      finding(
        'warning',
        'bot_running_no_token',
        'Proceso bot detectado pero sin token en Vault 0',
        'Revisa env del proceso o reinicia con credenciales correctas.',
      ),
    );
  }

  if (transfer.transferEndsBotAccess === true && gatewayWired && gate.ok && token && telegram.alive) {
    findings.push(
      finding(
        'info',
        'telegram_ready',
        `Telegram cableado: @${telegram.username ?? '?'} con owner gate OK`,
      ),
    );
  }

  const doctor = readDoctorProbe(ctx.dataDir);
  if (doctor?.health && doctor.health !== 'healthy') {
    findings.push(
      finding(
        doctor.health === 'dormant' ? 'critical' : 'warning',
        'doctor_vitality',
        `Doctor Vitality: ${doctor.health} — ${(doctor.issues ?? []).join('; ') || 'ver hermes:doctor'}`,
        'npm run hermes:doctor',
      ),
    );
  }

  const overall = worstSeverity(findings);

  return {
    at: new Date().toISOString(),
    precedent: 'P001-telegram-handle-transfer',
    packId: ctx.packId,
    tokenId: ctx.tokenId,
    agent: manifest.name,
    transferPolicy: {
      vault0NeverTravels: transfer.vault0NeverTravels ?? null,
      transferEndsBotAccess: transfer.transferEndsBotAccess ?? null,
      telegramPolicy: transfer.gateways?.telegram?.policy ?? null,
    },
    gate: {
      required: gateRequired,
      ok: gate.ok,
      operator: gate.operator ?? null,
      onchainOwner: gate.onchainOwner ?? null,
      skipped: gate.skipped ?? false,
    },
    telegram: {
      gatewayWired,
      tokenPresent: Boolean(token),
      probe: {
        alive: telegram.alive,
        dead: telegram.dead,
        username: telegram.username ?? null,
        httpStatus: telegram.status,
      },
      manifestHandle,
      botRunning,
    },
    overall,
    findings,
    actions: findings.filter((f) => f.action).map((f) => ({ id: f.id, action: f.action })),
  };
}

async function main() {
  const jsonOnly = process.argv.includes('--json');
  const ctx = resolveAgentEnv();
  const report = await runTransferVigilante(ctx);

  const outPath = join(ctx.dataDir, 'doctor/transfer-vigilante.json');
  mkdirSync(join(ctx.dataDir, 'doctor'), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const icon = { critical: '🔴', warning: '🟠', info: 'ℹ️', ok: '✅' };
    console.log(`VIGILANTE [${report.overall.toUpperCase()}] ${report.agent} #${report.tokenId}`);
    console.log(`Precedente: ${report.precedent}`);
    if (!report.findings.length) {
      console.log(`${icon.ok} Sin hallazgos — cables coherentes`);
    } else {
      for (const f of report.findings) {
        console.log(`${icon[f.severity] ?? '•'} [${f.id}] ${f.message}`);
        if (f.action) console.log(`   → ${f.action}`);
      }
    }
    console.log(`Informe: ${outPath}`);
  }

  if (report.overall === 'critical') process.exit(2);
  if (report.overall === 'warning') process.exit(1);
  process.exit(0);
}

const isMain =
  process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) {
  main().catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  });
}
