#!/usr/bin/env node
/** Mint Unit-mainnet — ageNFT Registry en Base mainnet. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  keccak256,
  stringToBytes,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { ageNftAbi, BASE_MAINNET } from './abis.js';

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
    description: 'Primer ageNFT nativo Base mainnet — ageNFT Registry propio',
    external_url: 'https://github.com/openclaw/ageNFT',
    attributes: [
      { trait_type: 'stack', value: 'ageNFT-Registry/v1' },
      { trait_type: 'chain', value: 'base-mainnet' },
    ],
  };
  return `data:application/json;base64,${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

async function main() {
  const creds = loadCredentials();
  const account = privateKeyToAccount(creds.privateKey);
  const name = process.argv[2] ?? 'Unit-Mainnet';
  const saltLabel = process.argv[3] ?? name;
  const salt = keccak256(stringToBytes(saltLabel));

  const transport = http('https://mainnet.base.org');
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({ account, chain: base, transport });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Signer:', account.address);
  console.log('Balance:', Number(balance) / 1e18, 'ETH');
  if (balance === 0n) throw new Error('Wallet has 0 ETH on Base mainnet.');

  const agentURI = buildAgentUri(name);
  console.log('Minting:', name);
  console.log('Contract:', BASE_MAINNET.ageNft);
  console.log('Salt:', salt);

  const { request } = await publicClient.simulateContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'mint',
    args: [account.address, name, agentURI, salt],
    account,
  });

  const hash = await walletClient.writeContract(request);
  console.log('Tx:', hash);
  console.log('Explorer:', `https://basescan.org/tx/${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') throw new Error('Mint tx reverted');

  const logs = parseEventLogs({ abi: ageNftAbi, logs: receipt.logs });
  const minted = logs.find((l) => l.eventName === 'AgentMinted');
  const tokenId = minted?.args?.tokenId ?? null;
  let tba = minted?.args?.tba ?? null;

  if (tokenId != null && !tba) {
    tba = await publicClient.readContract({
      address: BASE_MAINNET.ageNft,
      abi: ageNftAbi,
      functionName: 'getTBA',
      args: [tokenId],
    });
  }

  const result = {
    network: BASE_MAINNET.network,
    chainId: BASE_MAINNET.chainId,
    caip2: BASE_MAINNET.caip2,
    txHash: hash,
    tokenId: tokenId != null ? tokenId.toString() : null,
    name,
    owner: account.address,
    tba,
    agentURI,
    salt,
    contract: BASE_MAINNET.ageNft,
    erc6551Registry: BASE_MAINNET.erc6551Registry,
    tbaImplementation: BASE_MAINNET.tbaImplementation,
    mintedAt: new Date().toISOString(),
    explorer: `https://basescan.org/token/${BASE_MAINNET.ageNft}?a=${tokenId?.toString()}`,
    tbaExplorer: tba ? `https://basescan.org/address/${tba}` : null,
  };

  const outDir = join(__dirname, '../../docs/research/lab');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'unit-mainnet-mint.json');
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log('\n=== Mint OK ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nSaved:', outPath);
}

main().catch((err) => {
  console.error('Mint failed:', err.message ?? err);
  process.exit(1);
});
