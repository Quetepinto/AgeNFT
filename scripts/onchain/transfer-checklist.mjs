#!/usr/bin/env node
/**
 * Fase 2.3 — Transfer round-trip + checklist digital-body post-transfer.
 *
 * Flujo: fund temp → transfer out → checklist (nuevo owner) → transfer back → checklist (owner original)
 *
 * Usage:
 *   node transfer-checklist.mjs [agentId]           # full E2E
 *   node transfer-checklist.mjs 115 --check-only    # solo checklist, sin transfer
 *   node transfer-checklist.mjs 115 --dry-run       # checklist contra estado actual
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import {
  DEPLOYMENTS,
  IDENTITY_REGISTRY,
  identityRegistryAbi,
  contextRegistryAbi,
  memoryRegistryAbi,
  x402ReceiverAbi,
  serviceId,
} from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const RPC = 'https://sepolia.base.org';
const MANIFEST = join(REPO, 'docs/manifest/examples/unit-1-lab.json');

const args = process.argv.slice(2);
const agentId = BigInt(args.find((a) => /^\d+$/.test(a)) ?? 115);
const checkOnly = args.includes('--check-only');
const dryRun = args.includes('--dry-run');

const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials', 'agenft-base-sepolia.json'), 'utf8'),
);
const canonicalOwner = privateKeyToAccount(creds.privateKey);
const transport = http(RPC);
const publicClient = createPublicClient({ chain: baseSepolia, transport });
const ownerWallet = createWalletClient({
  account: canonicalOwner,
  chain: baseSepolia,
  transport,
});

const labDir = join(REPO, 'docs/research/lab');
mkdirSync(labDir, { recursive: true });

function check(id, label, ok, detail = '') {
  return { id, label, ok: Boolean(ok), detail };
}

async function readOnchainSnapshot(expectedOwner) {
  const sid = serviceId('agenft-lab-chat');
  const agentsRow = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'agents',
    args: [agentId],
  });
  const tba = agentsRow[1];

  const [owner, ctxCount, memCount, svc, ownerBal, tbaBal] = await Promise.all([
    publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'ownerOf',
      args: [agentId],
    }),
    publicClient.readContract({
      address: DEPLOYMENTS.proxies.AgentContextRegistry,
      abi: contextRegistryAbi,
      functionName: 'fileCount',
      args: [agentId],
    }),
    publicClient.readContract({
      address: DEPLOYMENTS.proxies.AgentMemory,
      abi: memoryRegistryAbi,
      functionName: 'versionCount',
      args: [agentId],
    }),
    publicClient
      .readContract({
        address: DEPLOYMENTS.proxies.AgentX402Receiver,
        abi: x402ReceiverAbi,
        functionName: 'getService',
        args: [agentId, sid],
      })
      .catch(() => null),
    publicClient.getBalance({ address: expectedOwner }),
    publicClient.getBalance({ address: tba }),
  ]);

  return {
    name: agentsRow[0],
    tba,
    active: agentsRow[3],
    owner,
    ctxCount,
    memCount,
    svc,
    ownerEth: formatEther(ownerBal),
    tbaEth: formatEther(tbaBal),
  };
}

async function runChecklist({ phase, expectedOwner, tbaBefore }) {
  const snap = await readOnchainSnapshot(expectedOwner);
  const items = [];

  items.push(
    check(
      '1-owner',
      'ownerOf(tokenId) == expectedOwner',
      snap.owner.toLowerCase() === expectedOwner.toLowerCase(),
      `${snap.owner} (expected ${expectedOwner})`,
    ),
  );

  items.push(
    check(
      '2-tba-stable',
      'TBA address unchanged',
      !tbaBefore || snap.tba.toLowerCase() === tbaBefore.toLowerCase(),
      snap.tba,
    ),
  );

  const tbaFunded = BigInt(parseEther(snap.tbaEth)) > 0n;
  items.push(
    check(
      '2b-tba-balance',
      'TBA has ETH (warning if empty)',
      true,
      tbaFunded ? `${snap.tbaEth} ETH` : '0 ETH — optional fund post-transfer',
    ),
  );
  if (!tbaFunded) items[items.length - 1].warn = true;

  // Manifest
  let manifestOk = false;
  let manifestDetail = '';
  try {
    const { execSync } = await import('node:child_process');
    execSync(`node scripts/validate-manifest.mjs ${MANIFEST}`, { cwd: REPO, stdio: 'pipe' });
    manifestOk = true;
    manifestDetail = 'unit-1-lab.json valid';
  } catch (e) {
    manifestDetail = String(e.message ?? e).slice(0, 120);
  }
  items.push(check('3-manifest', 'Manifiesto ageNFT validado', manifestOk, manifestDetail));

  // Offchain memory pointer + hydrate
  let memDetail = 'no pointer';
  let memOk = false;
  try {
    const { loadManifest } = await import('../../runtime/src/manifest-loader.mjs');
    const { loadPointer, hydrateLocalFromPointer, resolveRemotePointer } = await import(
      '../../runtime/src/memory-toju.mjs'
    );
    const { preloadContext } = await import('../../runtime/src/memory-local.mjs');

    const { manifest, packDir, dataDir } = loadManifest(MANIFEST);
    const pointer = resolveRemotePointer(manifest, dataDir);
    if (!pointer) {
      memDetail = 'sin remote-pointer — run npm run memory:sync en runtime/';
    } else {
      const hydrated = await hydrateLocalFromPointer({ dataDir, pointer });
      const ctx = preloadContext({ packDir, dataDir });
      memOk =
        Boolean(hydrated.experientialHash) &&
        ctx.systemPrompt.includes('Memory L0') &&
        !ctx.systemPrompt.includes('sin memoria previa');
      memDetail = `${pointer.uri} → hash ${hydrated.experientialHash?.slice(0, 14)}…`;
    }
  } catch (e) {
    memDetail = String(e.message ?? e).slice(0, 160);
  }
  items.push(
    check('4-memory-offchain', 'Memoria offchain resuelve + preload', memOk, memDetail),
  );

  // Onchain organs
  const ctxOk = Number(snap.ctxCount) >= 1;
  const memOnOk = Number(snap.memCount) >= 1;
  items.push(
    check('5-context-onchain', 'Context onchain (skills.md)', ctxOk, `fileCount=${snap.ctxCount}`),
  );
  items.push(
    check('6-memory-onchain', 'Memory onchain VIMS', memOnOk, `versionCount=${snap.memCount}`),
  );

  const x402Ok = snap.svc?.active === true;
  items.push(
    check(
      '7-x402-service',
      'Servicio x402 registrado y activo',
      x402Ok,
      x402Ok ? 'agenft-lab-chat active' : 'inactive/missing',
    ),
  );

  items.push(
    check(
      '8-x402-tba-pay',
      'Pago x402 desde TBA',
      true,
      'DEFER — Fase 2+ (hoy pago EOA lab)',
    ),
  );
  items[items.length - 1].defer = true;

  const required = items.filter((i) => !i.defer && !i.warn);
  const passed = required.filter((i) => i.ok).length;
  const score = `${passed}/${required.length}`;

  return { phase, expectedOwner, tba: snap.tba, items, score, snap };
}

async function transferRoundTrip() {
  const before = await readOnchainSnapshot(canonicalOwner.address);
  const tbaBefore = before.tba;

  const tempPk = generatePrivateKey();
  const temp = privateKeyToAccount(tempPk);
  const tempWallet = createWalletClient({ account: temp, chain: baseSepolia, transport });

  const keyPath = join(labDir, `transfer-temp-${agentId}.json`);
  writeFileSync(
    keyPath,
    `${JSON.stringify(
      {
        address: temp.address,
        privateKey: tempPk,
        purpose: 'transfer-checklist temp — wiped after success',
        agentId: agentId.toString(),
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );

  console.log('Funding temp wallet for return gas…');
  const fundHash = await ownerWallet.sendTransaction({
    to: temp.address,
    value: parseEther('0.0005'),
  });
  await publicClient.waitForTransactionReceipt({ hash: fundHash });

  console.log('Transfer OUT → temp owner', temp.address);
  const outHash = await ownerWallet.writeContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'safeTransferFrom',
    args: [canonicalOwner.address, temp.address, agentId],
    gas: 200000n,
  });
  const outRc = await publicClient.waitForTransactionReceipt({ hash: outHash });
  if (outRc.status !== 'success') throw new Error(`Transfer out reverted: ${outHash}`);

  for (let i = 0; i < 8; i++) {
    const o = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'ownerOf',
      args: [agentId],
    });
    if (o.toLowerCase() === temp.address.toLowerCase()) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const midCheck = await runChecklist({
    phase: 'post-transfer-out',
    expectedOwner: temp.address,
    tbaBefore,
  });

  console.log('Transfer BACK → canonical owner', canonicalOwner.address);
  const backHash = await tempWallet.writeContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'safeTransferFrom',
    args: [temp.address, canonicalOwner.address, agentId],
    gas: 200000n,
  });
  const backRc = await publicClient.waitForTransactionReceipt({ hash: backHash });
  if (backRc.status !== 'success') {
    throw new Error(`Transfer back reverted: ${backHash}`);
  }

  // RPC lag: poll hasta que ownerOf refleje el cambio
  for (let i = 0; i < 8; i++) {
    const o = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'ownerOf',
      args: [agentId],
    });
    if (o.toLowerCase() === canonicalOwner.address.toLowerCase()) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const finalCheck = await runChecklist({
    phase: 'post-transfer-back',
    expectedOwner: canonicalOwner.address,
    tbaBefore,
  });

  const success =
    finalCheck.items.find((i) => i.id === '1-owner')?.ok &&
    finalCheck.items.find((i) => i.id === '2-tba-stable')?.ok;

  if (success) {
    writeFileSync(keyPath, '{"deleted":"round-trip ok — key wiped"}\n');
  }

  return {
    agentId: agentId.toString(),
    tbaBefore,
    tempOwner: temp.address,
    txs: { fund: fundHash, out: outHash, back: backHash },
    midCheck,
    finalCheck,
    success,
  };
}

function printChecklist(result) {
  console.log(`\n=== ${result.phase} (${result.score}) ===`);
  for (const item of result.items) {
    const icon = item.defer ? '⏸' : item.warn ? '⚠️' : item.ok ? '✅' : '❌';
    console.log(`${icon} [${item.id}] ${item.label}`);
    if (item.detail) console.log(`   ${item.detail}`);
  }
}

async function main() {
  console.log('=== ageNFT transfer-checklist ===');
  console.log('agentId:', agentId.toString());
  console.log('mode:', dryRun ? 'dry-run' : checkOnly ? 'check-only' : 'full round-trip');

  let report;

  if (dryRun || checkOnly) {
    const owner = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'ownerOf',
      args: [agentId],
    });
    const agentsRow = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'agents',
      args: [agentId],
    });
    const check = await runChecklist({
      phase: checkOnly ? 'check-only' : 'dry-run',
      expectedOwner: owner,
      tbaBefore: agentsRow[1],
    });
    printChecklist(check);
    report = { agentId: agentId.toString(), mode: checkOnly ? 'check-only' : 'dry-run', check };
  } else {
    report = await transferRoundTrip();
    printChecklist(report.midCheck);
    printChecklist(report.finalCheck);
    console.log('\n---');
    console.log(report.success ? '✅ TRANSFER CHECKLIST PASSED' : '❌ TRANSFER CHECKLIST FAILED');
  }

  const outPath = join(labDir, `transfer-checklist-${agentId}.json`);
  writeFileSync(
    outPath,
    `${JSON.stringify(
      { at: new Date().toISOString(), ...report },
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    )}\n`,
  );
  console.log('Report:', outPath);

  const failed = report.finalCheck
    ? report.finalCheck.items.filter((i) => !i.defer && !i.warn && !i.ok)
    : report.check?.items.filter((i) => !i.defer && !i.warn && !i.ok) ?? [];

  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
