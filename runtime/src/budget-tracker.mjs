import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const LEDGER_FILE = 'budget/ledger.json';

/** @typedef {{ requests: number, usdMicro: number, windowKey: string }} WindowSpend */

function usdToMicro(s) {
  const n = Number(String(s).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1_000_000);
}

function microToUsd(m) {
  return (m / 1_000_000).toFixed(6);
}

function windowKeys(now = new Date()) {
  const iso = now.toISOString();
  return {
    hour: iso.slice(0, 13),
    day: iso.slice(0, 10),
    month: iso.slice(0, 7),
  };
}

export function ledgerPath(dataDir) {
  return join(dataDir, LEDGER_FILE);
}

export function loadLedger(dataDir) {
  mkdirSync(join(dataDir, 'budget'), { recursive: true });
  const path = ledgerPath(dataDir);
  if (!existsSync(path)) {
    return { version: 1, updatedAt: null, organs: {}, global: {}, events: [] };
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveLedger(dataDir, ledger) {
  ledger.updatedAt = new Date().toISOString();
  writeFileSync(ledgerPath(dataDir), `${JSON.stringify(ledger, null, 2)}\n`);
}

function getWindow(store, organ, period, key) {
  store[organ] ??= {};
  store[organ][period] ??= { windowKey: key, requests: 0, usdMicro: 0 };
  if (store[organ][period].windowKey !== key) {
    store[organ][period] = { windowKey: key, requests: 0, usdMicro: 0 };
  }
  return store[organ][period];
}

function getGlobalDay(store, key) {
  store.global ??= {};
  store.global.day ??= { windowKey: key, usdMicro: 0 };
  if (store.global.day.windowKey !== key) {
    store.global.day = { windowKey: key, usdMicro: 0 };
  }
  return store.global.day;
}

/**
 * Comprueba si el órgano cerebro puede ejecutarse.
 * @returns {{ allowed: boolean, reason?: string, status: object }}
 */
export function checkBrainBudget(manifest, dataDir, { pay = false } = {}) {
  const ledger = loadLedger(dataDir);
  const keys = windowKeys();
  const brainLimits = manifest.budget?.organs?.brain?.limits ?? {};
  const globalCap = manifest.budget?.global?.perDayUsdHardCap;

  ledger.organs ??= {};
  const hour = getWindow(ledger.organs, 'brain', 'hour', keys.hour);
  const day = getWindow(ledger.organs, 'brain', 'day', keys.day);
  const month = getWindow(ledger.organs, 'brain', 'month', keys.month);
  const globalDay = getGlobalDay(ledger, keys.day);

  const status = {
    pay,
    windows: {
      hour: { requests: hour.requests, usd: microToUsd(hour.usdMicro), cap: brainLimits.perHour },
      day: { requests: day.requests, usd: microToUsd(day.usdMicro), cap: brainLimits.perDay },
      month: { requests: month.requests, usd: microToUsd(month.usdMicro), cap: brainLimits.perMonth },
    },
    globalDayUsd: microToUsd(globalDay.usdMicro),
    globalCap,
  };

  const fail = (reason) => ({ allowed: false, reason, status, ledger });

  if (brainLimits.perHour?.requests != null && hour.requests >= brainLimits.perHour.requests) {
    return fail(`brain perHour requests cap (${brainLimits.perHour.requests})`);
  }
  if (brainLimits.perDay?.requests != null && day.requests >= brainLimits.perDay.requests) {
    return fail(`brain perDay requests cap (${brainLimits.perDay.requests})`);
  }

  if (pay) {
    const est = usdToMicro(
      manifest.budget?.organs?.brain?.assumptions?.avgCostPerRequestUsd ?? 0.002,
    );

    if (brainLimits.perHour?.usd != null) {
      const cap = usdToMicro(brainLimits.perHour.usd);
      if (hour.usdMicro + est > cap) return fail(`brain perHour usd cap ($${brainLimits.perHour.usd})`);
    }
    if (brainLimits.perDay?.usd != null) {
      const cap = usdToMicro(brainLimits.perDay.usd);
      if (day.usdMicro + est > cap) return fail(`brain perDay usd cap ($${brainLimits.perDay.usd})`);
    }
    if (brainLimits.perMonth?.usd != null) {
      const cap = usdToMicro(brainLimits.perMonth.usd);
      if (month.usdMicro + est > cap) return fail(`brain perMonth usd cap ($${brainLimits.perMonth.usd})`);
    }
    if (globalCap != null) {
      const cap = usdToMicro(globalCap);
      if (globalDay.usdMicro + est > cap) {
        return fail(`global perDay usd cap ($${globalCap})`);
      }
    }
  }

  return { allowed: true, status, ledger };
}

/**
 * Registra uso del cerebro tras un turno.
 */
export function recordBrainSpend(dataDir, manifest, { pay, usdMicro, success = true }) {
  const ledger = loadLedger(dataDir);
  const keys = windowKeys();

  ledger.organs ??= {};
  const hour = getWindow(ledger.organs, 'brain', 'hour', keys.hour);
  const day = getWindow(ledger.organs, 'brain', 'day', keys.day);
  const month = getWindow(ledger.organs, 'brain', 'month', keys.month);
  const globalDay = getGlobalDay(ledger, keys.day);

  const spent =
    pay && usdMicro > 0
      ? usdMicro
      : pay
        ? usdToMicro(manifest.budget?.organs?.brain?.assumptions?.avgCostPerRequestUsd ?? 0.002)
        : 0;

  hour.requests += 1;
  day.requests += 1;
  month.requests += 1;

  if (pay) {
    hour.usdMicro += spent;
    day.usdMicro += spent;
    month.usdMicro += spent;
    globalDay.usdMicro += spent;
  }

  ledger.events ??= [];
  ledger.events.unshift({
    at: new Date().toISOString(),
    organ: 'brain',
    pay,
    usd: microToUsd(spent),
    success,
  });
  ledger.events = ledger.events.slice(0, 100);

  saveLedger(dataDir, ledger);

  return {
    spentUsd: microToUsd(spent),
    totals: {
      hour: { requests: hour.requests, usd: microToUsd(hour.usdMicro) },
      day: { requests: day.requests, usd: microToUsd(day.usdMicro) },
      globalDayUsd: microToUsd(globalDay.usdMicro),
    },
  };
}

export function getBudgetStatus(manifest, dataDir) {
  const check = checkBrainBudget(manifest, dataDir, { pay: true });
  return check.status;
}

export async function checkPayerBalanceUsdc(payerAddress) {
  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const data = `0x70a08231${payerAddress.slice(2).toLowerCase().padStart(64, '0')}`;
  const res = await fetch('https://mainnet.base.org', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: USDC, data }, 'latest'],
      id: 1,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  const micro = Number(BigInt(json.result ?? '0x0'));
  return { usdc: micro / 1_000_000, usdMicro: micro };
}

/**
 * Modo dormant si saldo pagador < mínimo operativo (Fase 1: EOA; Fase 2: TBA).
 */
export async function checkOperatingBalance(manifest, payerAddress) {
  const min = usdToMicro(manifest.budget?.minOperatingBalanceUsdc ?? '5.00');
  const bal = await checkPayerBalanceUsdc(payerAddress);
  // Fase 1 lab: relajar — solo exigir saldo > 1 request estimado si min es alto
  const floor = Math.min(min, usdToMicro('0.002'));
  if (bal.usdMicro < floor) {
    return {
      ok: false,
      reason: `payer USDC ${bal.usdc.toFixed(6)} < floor $${microToUsd(floor)}`,
      balance: bal,
    };
  }
  return { ok: true, balance: bal };
}

export { microToUsd, usdToMicro };
