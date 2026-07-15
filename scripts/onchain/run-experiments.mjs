#!/usr/bin/env node
/**
 * Lab experiments on Unit-0 organs:
 * 1. addFile (skills.md) → AgentContextRegistry
 * 2. addVersion (.pixe capsule) → AgentMemory
 * 3. registerService → AgentX402Receiver
 * 4. transfer NFT to temp wallet and back (cuerpo digital test)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import {
  CONTEXT,
  DEPLOYMENTS,
  IDENTITY_REGISTRY,
  MEMORY,
  contentHash,
  contextRegistryAbi,
  identityRegistryAbi,
  memoryRegistryAbi,
  serviceId,
  x402ReceiverAbi,
} from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_ID = BigInt(process.argv[2] ?? 114);
const RPC = 'https://sepolia.base.org';

function loadCredentials() {
  const path = join(homedir(), '.credentials', 'agenft-base-sepolia.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

const creds = loadCredentials();
const ownerAccount = privateKeyToAccount(creds.privateKey);
const transport = http(RPC);
const publicClient = createPublicClient({ chain: baseSepolia, transport });
const ownerWallet = createWalletClient({ account: ownerAccount, chain: baseSepolia, transport });

const log = [];
const push = (step, data) => {
  const entry = { step, at: new Date().toISOString(), ...data };
  log.push(entry);
  console.log(`\n[${step}]`, data.ok === false ? `FAIL: ${data.error}` : 'OK', JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));
};

async function runStep(step, fn) {
  try {
    const data = await fn();
    push(step, { ok: true, ...data });
    return data;
  } catch (err) {
    push(step, { ok: false, error: err.shortMessage ?? err.message });
    return null;
  }
}

// --- 1. Context: skills.md ---
const skillsBody = `# Unit-0 skills (ageNFT lab)

You are Unit-0, a laboratory agent for the ageNFT project.

## Core behavior
- Answer concisely in Spanish when the owner prefers it.
- Treat the TBA as the agent treasury, not the owner EOA.
- Never exfiltrate private keys or credentials.

## Tools (planned)
- brain: tx402.ai via x402 from TBA
- memory: toju / .pixe-compatible capsule
`;

await runStep('context_addFile', async () => {
  const hash = contentHash(skillsBody);
  const uri = `ipfs://bafkreiagenftlab${AGENT_ID}skills`; // short URI; content addressed by hash onchain
  const { request } = await publicClient.simulateContract({
    address: DEPLOYMENTS.proxies.AgentContextRegistry,
    abi: contextRegistryAbi,
    functionName: 'addFile',
    args: [
      AGENT_ID,
      'skills.md',
      uri,
      hash,
      CONTEXT.FILE_MD,
      CONTEXT.CATEGORY_INSTRUCTION,
      'ageNFT lab static context',
    ],
    account: ownerAccount,
  });
  const tx = await ownerWallet.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  return { tx, name: 'skills.md', contentHash: hash };
});

// --- 2. Memory: .pixe capsule ---
const pixePayload = JSON.stringify({
  format: 'pixe-lab/v0',
  agent: 'Unit-0',
  event: 'lab_bootstrap',
  note: 'First experiential memory capsule from ageNFT exploration loop.',
  ts: new Date().toISOString(),
});

await runStep('memory_addVersion', async () => {
  const hash = contentHash(pixePayload);
  const uri = `pixe://lab/unit-0/bootstrap-v1`;
  const { request } = await publicClient.simulateContract({
    address: DEPLOYMENTS.proxies.AgentMemory,
    abi: memoryRegistryAbi,
    functionName: 'addVersion',
    args: [
      AGENT_ID,
      uri,
      hash,
      MEMORY.TYPE_CAPSULE,
      MEMORY.CATEGORY_SKILL,
      MEMORY.TIER_L2,
      0,
      'ageNFT lab bootstrap capsule',
    ],
    account: ownerAccount,
  });
  const tx = await ownerWallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  return { tx, storageURI: uri, contentHash: hash, gasUsed: receipt.gasUsed.toString() };
});

// --- 3. x402 service registration ---
const CHAT_SERVICE = serviceId('agenft-lab-chat');
const PRICE_USDC = 1000n; // 0.001 USDC (6 decimals)

await runStep('x402_registerService', async () => {
  const { request } = await publicClient.simulateContract({
    address: DEPLOYMENTS.proxies.AgentX402Receiver,
    abi: x402ReceiverAbi,
    functionName: 'registerService',
    args: [AGENT_ID, CHAT_SERVICE, DEPLOYMENTS.usdc, PRICE_USDC],
    account: ownerAccount,
  });
  const tx = await ownerWallet.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  let split = null;
  try {
    split = await publicClient.readContract({
      address: DEPLOYMENTS.proxies.AgentX402Receiver,
      abi: x402ReceiverAbi,
      functionName: 'quoteSplit',
      args: [AGENT_ID, CHAT_SERVICE],
    });
  } catch {
    /* quoteSplit needs active service + nonzero price context */
  }
  return {
    tx,
    serviceId: CHAT_SERVICE,
    priceUsdc: PRICE_USDC.toString(),
    split: split
      ? { system: split[0].toString(), creator: split[1].toString(), agent: split[2].toString() }
      : null,
  };
});

// --- 4. Transfer test (safe round-trip script) ---
await runStep('transfer_roundtrip', async () => {
  const { execSync } = await import('node:child_process');
  const out = execSync(`node ${join(__dirname, 'transfer-test.mjs')} ${AGENT_ID}`, {
    encoding: 'utf8',
  });
  return { output: out.trim().split('\n').slice(-1)[0] };
});

const outDir = join(__dirname, '../../docs/research/lab');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `experiments-agent-${AGENT_ID}.json`);
writeFileSync(outPath, `${JSON.stringify({ agentId: AGENT_ID.toString(), experiments: log }, null, 2)}\n`);
console.log('\n=== Experiment log saved ===', outPath);
