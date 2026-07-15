#!/usr/bin/env node
/** Recover agent NFT from temp wallet to canonical lab owner. */
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { IDENTITY_REGISTRY, identityRegistryAbi } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const agentId = BigInt(process.argv[2] ?? 115);
const labDir = join(__dirname, '../../docs/research/lab');
const temp = JSON.parse(readFileSync(join(labDir, `transfer-temp-${agentId}.json`), 'utf8'));
const creds = JSON.parse(readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'));

const canonical = privateKeyToAccount(creds.privateKey);
const tempAcc = privateKeyToAccount(temp.privateKey);
const transport = http('https://sepolia.base.org');
const pub = createPublicClient({ chain: baseSepolia, transport });
const tempWallet = createWalletClient({ account: tempAcc, chain: baseSepolia, transport });

const owner = await pub.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'ownerOf',
  args: [agentId],
});

console.log('current owner:', owner);
console.log('temp:', temp.address);
console.log('canonical:', canonical.address);

if (owner.toLowerCase() === canonical.address.toLowerCase()) {
  console.log('Already recovered.');
  process.exit(0);
}

if (owner.toLowerCase() !== temp.address.toLowerCase()) {
  console.error('Owner is neither temp nor canonical — manual intervention needed');
  process.exit(1);
}

const hash = await tempWallet.writeContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'safeTransferFrom',
  args: [temp.address, canonical.address, agentId],
  gas: 200000n,
});
console.log('Transfer back tx:', hash);
const rc = await pub.waitForTransactionReceipt({ hash });
console.log('Receipt:', rc.status);

const owner2 = await pub.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'ownerOf',
  args: [agentId],
});
console.log('Owner after:', owner2);

if (owner2.toLowerCase() === canonical.address.toLowerCase()) {
  writeFileSync(join(labDir, `transfer-temp-${agentId}.json`), '{"recovered":true}\n');
  console.log('✅ Recovered');
}
