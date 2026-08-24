/**
 * Estado de configuración de órganos — probes locales (sin secretos en respuesta).
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  canRunTurn,
  chatWebEnabled,
  doctorEnabled,
  gatewayEnabled,
  hasEdge,
  isConnectedToRuntime,
} from './wiring-loader.mjs';

const CHAT_API_PORT = Number(process.env.AGENFT_CHAT_API_PORT ?? 8787);
const CHAT_API_HOST = process.env.AGENFT_CHAT_API_HOST ?? '127.0.0.1';

function check(id, ok, label, detail = '') {
  return { id, ok: Boolean(ok), label, detail: detail || undefined };
}

function statusFromChecks(checks, { unsupported = false, notWired = false } = {}) {
  if (unsupported) {
    return { state: 'unsupported', label: 'No implementado aún' };
  }
  if (notWired) {
    return { state: 'not_wired', label: 'No cableado al Motor' };
  }
  const failed = checks.filter((c) => !c.ok);
  if (!failed.length) return { state: 'ready', label: 'Configurado' };
  const critical = failed.some((c) => c.id === 'wire' || c.id === 'adapter');
  if (critical) return { state: 'not_wired', label: 'Sin cablear o sin adaptador' };
  return { state: 'partial', label: 'Parcial — faltan pasos' };
}

function telegramTokenPresent() {
  if (process.env.AGENFT_TELEGRAM_BOT_TOKEN?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return true;
  }
  const path = join(homedir(), '.credentials/agenft-telegram.env');
  if (!existsSync(path)) return false;
  const text = readFileSync(path, 'utf8');
  return /(?:AGENFT_TELEGRAM_BOT_TOKEN|TELEGRAM_BOT_TOKEN)\s*=\s*\S+/.test(text);
}

async function probeHttpOk(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2200) });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const body = await res.json();
    return { ok: Boolean(body?.ok), detail: body?.service ?? 'ok' };
  } catch (e) {
    return { ok: false, detail: e.message ?? String(e) };
  }
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

function isTelegramBotRunning() {
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

function gatewayTelegramStatus(wiring) {
  const wired = gatewayEnabled(wiring);
  const tokenOk = telegramTokenPresent();
  const botRunning = isTelegramBotRunning();
  const sessionActive = wired && tokenOk && botRunning;
  const checks = [
    check('wire', wired, 'Cableado al Motor (runtime → gateway)'),
    check('token', !wired || tokenOk, 'Token bot Telegram', wired ? undefined : 'Opcional si no cableado'),
    check(
      'bot_process',
      !wired || botRunning,
      'Bot Telegram en marcha',
      botRunning ? 'Proceso detectado en el VPS' : 'No detectado',
    ),
    check(
      'adapter',
      wired,
      'Adaptador runtime',
      wired ? 'telegram-unit-mainnet-bot.mjs' : 'Conecta Gateway al Motor',
    ),
  ];
  if (wired && !tokenOk) {
    checks[1].detail =
      'Crea ~/.credentials/agenft-telegram.env con AGENFT_TELEGRAM_BOT_TOKEN=… (o variable de entorno)';
  }
  const steps = [
    'Cablear Gateway chat al Motor en Lab y aplicar wiring.',
    'Crear bot en @BotFather → copiar token.',
    'Guardar token en ~/.credentials/agenft-telegram.env (sin commitear).',
    'En VPS: cd ageNFT/runtime && npm run telegram:mainnet:pay',
    '(Opcional) AGENFT_TELEGRAM_ALLOWED_USERS=id1,id2 para restringir acceso.',
  ];
  if (botRunning) {
    steps.push('Para quitar el cable: para el bot en el VPS (Ctrl+C o detén el servicio), luego desconecta y aplica wiring.');
  }
  let label = statusFromChecks(checks, { notWired: !wired }).label;
  let state = statusFromChecks(checks, { notWired: !wired }).state;
  if (sessionActive) {
    label = 'Conectado · en línea';
    state = 'ready';
  } else if (botRunning && wired) {
    label = 'Bot activo (revisa token)';
    state = 'partial';
  } else if (botRunning && !wired) {
    label = 'Bot activo · wiring desconectado';
    state = 'partial';
  }
  return {
    nodeId: 'gateway',
    option: 'telegram',
    state,
    label,
    checks: checks.filter((c) => wired || c.id === 'wire' || (c.id === 'bot_process' && botRunning)),
    steps,
    live: {
      botRunning,
      tokenPresent: tokenOk,
      wiredOnDisk: wired,
      sessionActive,
      edgeLocked: botRunning,
    },
  };
}

function gatewayGenericStatus(wiring, option) {
  const wired = gatewayEnabled(wiring);
  const live = option === 'telegram';
  const checks = [
    check('wire', wired, 'Cableado al Motor'),
    check('adapter', false, `Adaptador «${option}»`, 'Solo Telegram está implementado como gateway hoy'),
  ];
  const steps =
    option === 'matrix'
      ? [
          'Gateway Matrix ≠ órgano Matrix — son módulos distintos.',
          'Hoy usa Gateway → telegram para chat operativo.',
          'Matrix como gateway requiere nuevo adaptador en runtime (bloque futuro).',
        ]
      : [
          `La opción «${option}» está en el catálogo Lab pero sin bot en runtime.`,
          'Para chat operativo hoy: Gateway → telegram.',
          'Documenta la intención en Lab y pide implementación en Cursor.',
        ];
  return {
    nodeId: 'gateway',
    option,
    ...statusFromChecks(checks, { unsupported: !live, notWired: !wired && live }),
    checks,
    steps,
  };
}

async function chatWebStatus(wiring) {
  const wired = chatWebEnabled(wiring);
  const node = wiring?.nodes?.find((n) => n.id === 'chatweb');
  const option = node?.option ?? 'chat-api-local';
  if (option !== 'chat-api-local') {
    return {
      nodeId: 'chatweb',
      option,
      state: 'unsupported',
      label: 'Opción no operativa',
      checks: [check('adapter', false, `Adaptador «${option}»`, 'Solo chat-api-local hoy')],
      steps: ['Usa chat-api-local o pide adaptador en Cursor.', 'cd runtime && npm run chat:api'],
    };
  }
  const health = wired ? await probeHttpOk(`http://${CHAT_API_HOST}:${CHAT_API_PORT}/health`) : { ok: false };
  const serviceRunning = health.ok;
  const checks = [
    check('wire', wired, 'Cableado al Motor'),
    check('service', !wired || serviceRunning, 'Servicio chat-api', health.detail ?? `:${CHAT_API_PORT}`),
  ];
  const steps = [
    'Cablear Chat web al Motor y aplicar wiring.',
    'cd ageNFT/runtime && npm run chat:api',
    'Probar: curl http://127.0.0.1:8787/health',
    'En dApp chat: URL API http://127.0.0.1:8787 (o Caddy /agenft-api/ en producción).',
  ];
  return {
    nodeId: 'chatweb',
    option,
    ...statusFromChecks(checks, { notWired: !wired }),
    checks: checks.filter((c) => wired || c.id === 'wire'),
    steps,
    live: {
      serviceRunning,
      wiredOnDisk: wired,
      edgeLocked: serviceRunning,
    },
  };
}

function brainStatus(wiring, ctx) {
  const runTurn = canRunTurn(wiring);
  const doctor = readDoctorProbe(ctx.dataDir);
  const brainReachable = doctor?.brainProbe?.ok || doctor?.health === 'healthy';
  const checks = [
    check('wire', runTurn.ok, 'Cadena NFT → Motor → Cerebro', runTurn.reason),
    check('memory_wire', hasEdge(wiring, 'brain', 'memory'), 'Cerebro → Memoria'),
    check(
      'probe',
      !runTurn.ok || brainReachable || doctor?.brainProbe?.status === 402,
      'Cerebro alcanzable (tx402)',
      doctor?.issues?.join('; ') ?? 'Ejecuta npm run hermes:doctor',
    ),
  ];
  const steps = [
    'Verificar manifiesto: organs.brain.primary (tx402.ai).',
    'Cadena mínima: nft → runtime → brain → memory.',
    'Probe: cd runtime && npm run hermes:doctor',
    'Turno de pago: npm run hermes:turn:pay "Hola" (requiere USDC en TBA).',
  ];
  return {
    nodeId: 'brain',
    option: wiring?.nodes?.find((n) => n.id === 'brain')?.option ?? 'tx402',
    ...statusFromChecks(checks, { notWired: !runTurn.ok }),
    checks,
    steps,
  };
}

function doctorOrganStatus(wiring, ctx) {
  const wired = doctorEnabled(wiring);
  const probe = readDoctorProbe(ctx.dataDir);
  const checks = [
    check('wire', wired, 'Cableado al Motor'),
    check('probe_file', !wired || Boolean(probe), 'Último informe Doctor', join(ctx.dataDir, 'doctor/latest-probe.json')),
    check(
      'health',
      !wired || probe?.health === 'healthy' || probe?.brainProbe?.status === 402,
      'Salud reciente',
      probe?.health ?? 'Sin probe — npm run hermes:doctor',
    ),
  ];
  const steps = [
    'Cablear Doctor Qi al Motor.',
    'cd runtime && npm run hermes:doctor',
    'Cron Hermes (--no-agent) usa el mismo probe cada 900s.',
  ];
  return {
    nodeId: 'doctor',
    option: wiring?.nodes?.find((n) => n.id === 'doctor')?.option ?? 'probe',
    ...statusFromChecks(checks, { notWired: !wired }),
    checks: wired ? checks : checks.slice(0, 1),
    steps,
  };
}

function matrixOrganStatus(wiring) {
  const node = wiring?.nodes?.find((n) => n.id === 'matrix');
  const option = node?.option ?? 'matrix-bot';
  const wired = isConnectedToRuntime(wiring, 'matrix');
  const checks = [
    check('wire', wired, 'Cableado al Motor (runtime → matrix)'),
    check('adapter', false, 'Bot Matrix en runtime', 'No hay matrix-bot.mjs operativo aún'),
  ];
  const steps = [
    'Órgano Matrix ≠ Gateway chat — no confundir módulos.',
    'Hoy: desconectado del Motor o solo esquema (matrix → MAS).',
    'Requiere: bot Matrix + credenciales + adaptador runtime.',
  ];
  return {
    nodeId: 'matrix',
    option,
    state: wired ? 'unsupported' : 'not_wired',
    label: wired ? 'Cableado pero sin bot' : 'No cableado al Motor',
    checks,
    steps,
  };
}

function runtimeStatus(wiring) {
  const turn = canRunTurn(wiring);
  const checks = [
    check('manifest', true, 'Manifiesto resuelto'),
    check('turn', turn.ok, 'Cadena mínima de turno', turn.reason),
  ];
  return {
    nodeId: 'runtime',
    option: wiring?.nodes?.find((n) => n.id === 'runtime')?.option ?? 'hermes',
    ...statusFromChecks(checks),
    checks,
    steps: ['Motor Hermes + wiring nft→runtime→brain.', 'Cron: hermes/README.md'],
  };
}

function genericOrganStatus(wiring, nodeId) {
  const node = wiring?.nodes?.find((n) => n.id === nodeId);
  if (!node) return null;
  const wired = isConnectedToRuntime(wiring, nodeId) || hasEdge(wiring, 'brain', nodeId);
  return {
    nodeId,
    option: node.option,
    state: wired ? 'partial' : 'not_wired',
    label: wired ? 'En esquema — revisar docs' : 'No cableado',
    checks: [check('wire', wired, wired ? 'Presente en wiring' : 'Sin cable al Motor/cabeza')],
    steps: [`Consulta docs/research/lab/ para ${node.label}.`],
  };
}

async function buildOrganEntry(wiring, ctx, nodeId) {
  const node = wiring?.nodes?.find((n) => n.id === nodeId);
  if (!node) return null;

  switch (nodeId) {
    case 'gateway':
      return node.option === 'telegram'
        ? gatewayTelegramStatus(wiring)
        : gatewayGenericStatus(wiring, node.option);
    case 'chatweb':
      return chatWebStatus(wiring);
    case 'brain':
      return brainStatus(wiring, ctx);
    case 'doctor':
      return doctorOrganStatus(wiring, ctx);
    case 'matrix':
      return matrixOrganStatus(wiring);
    case 'runtime':
      return runtimeStatus(wiring);
    default:
      return genericOrganStatus(wiring, nodeId);
  }
}

/** @param {import('./agenft-env.mjs').resolveAgentEnv extends Function ? Awaited<ReturnType<import('./agenft-env.mjs').resolveAgentEnv>> : never} ctx */
export async function getOrganStatusReport(ctx, { nodeId = null } = {}) {
  const wiring = ctx.wiring;
  const nodeIds = nodeId
    ? [nodeId]
    : (wiring?.nodes ?? []).map((n) => n.id);

  const organs = [];
  for (const id of nodeIds) {
    const entry = await buildOrganEntry(wiring, ctx, id);
    if (entry) organs.push(entry);
  }

  return {
    ok: true,
    packId: ctx.packId,
    at: new Date().toISOString(),
    organs,
  };
}
