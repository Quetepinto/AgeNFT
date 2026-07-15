#!/usr/bin/env node
/**
 * Lab mint — Agent-NFT (VIMS) standalone via mintWithFullStack on Base Sepolia.
 * NOT ageNFT product code; reference stack for Fase 1 validation.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  zeroAddress,
  zeroHash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { DEPLOYMENTS, identityRegistryAbi, IDENTITY_REGISTRY } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCredentials() {
  const path = join(homedir(), '.credentials', 'agenft-base-sepolia.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (!raw.privateKey) throw new Error(`Missing privateKey in ${path}`);
  return raw;
}

function buildAgentUri(name) {
  const payload = {
    name,
    description: 'ageNFT lab agent — minted via mintWithFullStack (VIMS reference stack)',
    external_url: 'https://github.com/openclaw/ageNFT',
    attributes: [{ trait_type: 'stack', value: 'Agent-NFT/v0.9.2' }],
  };
  return `data:application/json;base64,${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

async function main() {
  const creds = loadCredentials();
  const account = privateKeyToAccount(creds.privateKey);
  const name = process.argv[2] ?? 'Unit-0';
  const royaltyBps = BigInt(process.argv[3] ?? 500); // 5% — VIMS UI default

  const transport = http('https://sepolia.base.org');
  const publicClient = createPublicClient({ chain: baseSepolia, transport });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Signer:', account.address);
  console.log('Balance:', Number(balance) / 1e18, 'ETH');

  if (balance === 0n) {
    throw new Error('Wallet has 0 ETH — fund Base Sepolia first.');
  }

  const agentURI = buildAgentUri(name);
  console.log('Minting standalone agent:', name);
  console.log('Royalty bps:', royaltyBps.toString());

  const { request } = await publicClient.simulateContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'mintWithFullStack',
    args: [
      name,
      agentURI,
      royaltyBps,
      zeroAddress,
      zeroHash,
      zeroHash,
      zeroAddress,
      0n,
    ],
    account,
  });

  const hash = await walletClient.writeContract(request);
  console.log('Tx submitted:', hash);
  console.log('Explorer:', `https://sepolia.basescan.org/tx/${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') throw new Error('Mint tx reverted');

  const logs = parseEventLogs({
    abi: identityRegistryAbi,
    logs: receipt.logs,
  });

  const registered = logs.find((l) => l.eventName === 'AgentRegistered');
  const tbaSet = logs.find((l) => l.eventName === 'AgentTBASet');
  const agentId = registered?.args?.agentId ?? null;

  let tbaAddress = tbaSet?.args?.tba ?? null;
  if (agentId != null) {
    const row = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: 'agents',
      args: [agentId],
    });
    tbaAddress = row[1] ?? tbaAddress;
  }

  const result = {
    network: DEPLOYMENTS.network,
    chainId: DEPLOYMENTS.chainId,
    txHash: hash,
    agentId: agentId != null ? agentId.toString() : null,
    name,
    owner: account.address,
    tba: tbaAddress,
    agentURI,
    royaltyBps: royaltyBps.toString(),
    registry: IDENTITY_REGISTRY,
    deployments: DEPLOYMENTS.proxies,
    mintedAt: new Date().toISOString(),
  };

  const outDir = join(__dirname, '../../docs/research/lab');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'unit-0-mint.json');
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log('\n=== Mint OK ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nSaved:', outPath);
}

main().catch((err) => {
  console.error('Mint failed:', err.message ?? err);
  process.exit(1);
});
