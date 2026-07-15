#!/usr/bin/env node
/** Full organ probe for a VIMS agent — read-only lab report. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, formatEther, http } from 'viem';
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
const agentId = BigInt(process.argv[2] ?? 114);
const RPC = 'https://sepolia.base.org';

const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });

async function safe(label, fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    return { ok: false, error: err.shortMessage ?? err.message };
  }
}

const sid = serviceId('agenft-lab-chat');

const [
  agentsRow,
  owner,
  uri,
  royalty,
  vault,
  ctxCount,
  ctxFiles,
  memCount,
  memLatest,
  usdcAllowed,
  svc,
  split,
  ownerBal,
  tbaBal,
] = await Promise.all([
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'agents',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'ownerOf',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'tokenURI',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'getCreatorRoyalty',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'royaltyVaultAddress',
    args: [agentId],
  }),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentContextRegistry,
    abi: contextRegistryAbi,
    functionName: 'fileCount',
    args: [agentId],
  }),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentContextRegistry,
    abi: contextRegistryAbi,
    functionName: 'getAllFiles',
    args: [agentId],
  }).catch(() => []),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentMemory,
    abi: memoryRegistryAbi,
    functionName: 'versionCount',
    args: [agentId],
  }),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentMemory,
    abi: memoryRegistryAbi,
    functionName: 'getLatest',
    args: [agentId],
  }).catch(() => null),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentX402Receiver,
    abi: x402ReceiverAbi,
    functionName: 'allowedTokens',
    args: [DEPLOYMENTS.usdc],
  }),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentX402Receiver,
    abi: x402ReceiverAbi,
    functionName: 'getService',
    args: [agentId, sid],
  }).catch(() => null),
  publicClient.readContract({
    address: DEPLOYMENTS.proxies.AgentX402Receiver,
    abi: x402ReceiverAbi,
    functionName: 'quoteSplit',
    args: [agentId, sid],
  }).catch(() => null),
]);

const [name, tba, createdAt, active, reputationAnchor] = agentsRow;
const [creator, creatorRoyaltyBps] = royalty;

const ownerBalance = await publicClient.getBalance({ address: owner });
const tbaBalance = await publicClient.getBalance({ address: tba });

const report = {
  agentId: agentId.toString(),
  probedAt: new Date().toISOString(),
  identity: {
    name,
    owner,
    tba,
    active,
    createdAt: new Date(Number(createdAt) * 1000).toISOString(),
    reputationAnchor,
    tokenURI: uri,
    creator,
    creatorRoyaltyBps: creatorRoyaltyBps.toString(),
    royaltyVault: vault,
    balances: {
      ownerEth: formatEther(ownerBalance),
      tbaEth: formatEther(tbaBalance),
    },
  },
  context: {
    fileCount: ctxCount.toString(),
    files: (ctxFiles ?? []).map((f) => ({
      name: f.name,
      storageURI: f.storageURI,
      contentHash: f.contentHash,
      category: Number(f.category),
      enabled: f.enabled,
    })),
  },
  memory: {
    versionCount: memCount.toString(),
    latest: memLatest
      ? {
          version: memLatest[0]?.toString(),
          storageURI: memLatest[1]?.storageURI,
          contentHash: memLatest[1]?.contentHash,
          versionType: Number(memLatest[1]?.versionType),
          category: Number(memLatest[1]?.category),
        }
      : null,
  },
  x402: {
    usdcAllowed,
    probeServiceId: sid,
    service: svc
      ? {
          token: svc.token ?? svc[0],
          price: (svc.price ?? svc[1])?.toString(),
          active: svc.active ?? svc[2],
        }
      : null,
    quoteSplit1000usdc: split
      ? {
          gross: split[0]?.toString(),
          systemCut: split[1]?.toString(),
          creatorCut: split[2]?.toString(),
          agentCut: split[3]?.toString(),
        }
      : null,
  },
  deployments: DEPLOYMENTS.proxies,
};

const outDir = join(__dirname, '../../docs/research/lab');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `probe-agent-${agentId}.json`);
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
console.error('\nSaved:', outPath);
