/**
 * Un turno ageNFT — API reutilizable (CLI, Hermes skill, Doctor).
 */
import { resolveBrain } from './manifest-loader.mjs';
import { preloadContext, autowriteDelta } from './memory-local.mjs';
import { inferBrain } from './brain-tx402.mjs';
import {
  checkBrainBudget,
  recordBrainSpend,
  checkOperatingBalance,
} from './budget-tracker.mjs';
import { loadPayerKey, loadPayerAccount } from './payer-key.mjs';
import { syncMemoryRemote } from './memory-toju.mjs';

/**
 * @param {object} opts
 * @param {import('./manifest-loader.mjs').loadManifest extends Function ? ReturnType<import('./manifest-loader.mjs').loadManifest> : never} opts.ctx - resultado loadManifest/resolveAgentEnv
 * @param {string} opts.userMessage
 * @param {boolean} [opts.pay]
 * @param {boolean} [opts.force]
 * @param {boolean} [opts.syncMemory]
 * @param {boolean} [opts.quiet]
 */
export async function runTurn({
  manifest,
  packDir,
  dataDir,
  packId,
  userMessage,
  pay = false,
  force = false,
  syncMemory = false,
  quiet = false,
}) {
  if (syncMemory && !pay) {
    throw new Error('syncMemory requiere pay=true');
  }

  const brain = resolveBrain(manifest);
  const ctx = preloadContext({ packDir, dataDir });

  const log = (...a) => {
    if (!quiet) console.log(...a);
  };

  log('=== ageNFT turn ===');
  log('agent:', manifest.name, `#${manifest.identity.agentId}`);
  log('TBA:', manifest.treasury.address);
  log('pack:', packId);
  log('brain:', brain.primary.provider, brain.primary.model);
  log('mode:', pay ? 'paid (x402)' : 'probe (sin USDC)');

  const budget = checkBrainBudget(manifest, dataDir, { pay });
  log('budget:', budget.status);

  if (!budget.allowed && !force) {
    return {
      ok: false,
      dormant: true,
      reason: budget.reason,
      budget: budget.status,
      exitCode: 2,
    };
  }

  if (force && !budget.allowed) {
    log('⚠️  --force: ignorando cap:', budget.reason);
  }

  let payerAddress = null;
  if (pay) {
    const pk = loadPayerKey();
    if (!pk) {
      return {
        ok: false,
        dormant: false,
        reason: 'Missing payer private key (VALIDATION_PRIVATE_KEY / AGENFT_PAYER_PRIVATE_KEY)',
        exitCode: 1,
      };
    }
    payerAddress = loadPayerAccount().address;
    const op = await checkOperatingBalance(manifest, payerAddress);
    log('payer USDC:', op.balance?.usdc?.toFixed(6) ?? '?');
    if (!op.ok && !force) {
      return {
        ok: false,
        dormant: true,
        reason: op.reason,
        budget: budget.status,
        payer: payerAddress,
        exitCode: 2,
      };
    }
  }

  const result = await inferBrain({
    brain,
    systemPrompt: ctx.systemPrompt,
    userMessage,
    pay,
    privateKey: pay ? loadPayerKey() : null,
  });

  let assistantText;
  if (result.content) {
    assistantText = result.content;
  } else if (result.mode === 'probe' && result.ok) {
    assistantText = `[probe-only] ${result.message}`;
  } else {
    return {
      ok: false,
      dormant: false,
      reason: result.message ?? 'Brain error',
      brain: result,
      exitCode: 1,
    };
  }

  const spend = recordBrainSpend(dataDir, manifest, {
    pay,
    usdMicro: result.costUsdMicro ?? 0,
    success: result.ok,
  });

  const mem = autowriteDelta({
    dataDir,
    userMessage,
    assistantMessage: assistantText,
    manifest,
  });

  let sync = null;
  if (syncMemory && pay) {
    sync = await syncMemoryRemote({
      manifest,
      dataDir,
      privateKey: loadPayerKey(),
      provider: 'auto',
    });
  }

  return {
    ok: true,
    dormant: false,
    agent: manifest.name,
    agentId: manifest.identity.agentId,
    tba: manifest.treasury.address,
    userMessage,
    assistantText,
    mode: result.mode,
    payer: result.payer ?? payerAddress,
    costUsd: result.costUsd ?? null,
    budget: spend.totals,
    budgetStatus: budget.status,
    memory: {
      latestPath: mem.latestPath,
      l0Summary: mem.latest.l0Summary,
      experientialHash: mem.latest.experientialHash,
    },
    sync: sync
      ? {
          uri: sync.pointer.uri,
          fallback: sync.fallback ?? false,
          costUsd: (sync.costUsdMicro / 1_000_000).toFixed(6),
        }
      : null,
    exitCode: 0,
  };
}
