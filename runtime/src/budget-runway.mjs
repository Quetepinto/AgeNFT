#!/usr/bin/env node
/** Estimador runway lab — USDC restante / gasto medio cerebro. */
import { loadManifest } from './manifest-loader.mjs';
import { loadLedger, checkPayerBalanceUsdc } from './budget-tracker.mjs';
import { loadPayerAccount } from './payer-key.mjs';

const manifestPath = process.argv[2] ?? '../docs/manifest/examples/unit-1-lab.json';
const { manifest, dataDir } = loadManifest(manifestPath);
const ledger = loadLedger(dataDir);
const brainDay = ledger.organs?.brain?.day;
const payer = loadPayerAccount();

const avgCost = manifest.budget?.organs?.brain?.assumptions?.avgCostPerRequestUsd ?? 0.002;
const dayCap = Number(manifest.budget?.organs?.brain?.limits?.perDay?.usd ?? 1);
const globalCap = Number(manifest.budget?.global?.perDayUsdHardCap ?? 2);
const profile = manifest.budget?.profile ?? 'conversational';

let balance = null;
if (payer) balance = await checkPayerBalanceUsdc(payer.address);

const spentToday = (brainDay?.usdMicro ?? 0) / 1_000_000;
const requestsToday = brainDay?.requests ?? 0;
const effectiveAvg = requestsToday > 0 ? spentToday / requestsToday : avgCost;

const usdc = balance?.usdc ?? 0;
const requestsLeftByBalance = effectiveAvg > 0 ? Math.floor(usdc / effectiveAvg) : 0;
const usdLeftTodayCap = Math.max(0, Math.min(dayCap, globalCap) - spentToday);
const requestsLeftByCap = effectiveAvg > 0 ? Math.floor(usdLeftTodayCap / effectiveAvg) : 0;

console.log(
  JSON.stringify(
    {
      agent: manifest.name,
      profile,
      payer: payer?.address ?? null,
      usdcMainnet: usdc,
      spentTodayUsd: spentToday.toFixed(6),
      avgCostObservedUsd: effectiveAvg.toFixed(6),
      caps: { brainPerDayUsd: dayCap, globalPerDayUsd: globalCap },
      runway: {
        requestsByBalance: requestsLeftByBalance,
        requestsByCapToday: requestsLeftByCap,
        limitingFactor:
          requestsLeftByCap < requestsLeftByBalance ? 'manifest cap' : 'wallet balance',
      },
      note: 'Fase 1: pago EOA lab, no TBA. Perfil B orientativo ~$6-8/mes no modelado aún.',
    },
    null,
    2,
  ),
);
