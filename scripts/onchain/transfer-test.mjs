#!/usr/bin/env node
/** Safe transfer round-trip: fund temp wallet, save key to lab/, transfer back. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { IDENTITY_REGISTRY, identityRegistryAbi } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_ID = BigInt(process.argv[2] ?? 115);
const RPC = 'https://sepolia.base.org';

const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials', 'agenft-base-sepolia.json'), 'utf8'),
);
const owner = privateKeyToAccount(creds.privateKey);
const transport = http(RPC);
const publicClient = createPublicClient({ chain: baseSepolia, transport });
const ownerWallet = createWalletClient({ account: owner, chain: baseSepolia, transport });

const tempPk = generatePrivateKey();
const temp = privateKeyToAccount(tempPk);
const tempWallet = createWalletClient({ account: temp, chain: baseSepolia, transport });

const labDir = join(__dirname, '../../docs/research/lab');
mkdirSync(labDir, { recursive: true });
const keyPath = join(labDir, `transfer-temp-${AGENT_ID}.json`);
writeFileSync(
  keyPath,
  `${JSON.stringify({ address: temp.address, privateKey: tempPk, purpose: 'ephemeral transfer test — delete after', agentId: AGENT_ID.toString() }, null, 2)}\n`,
  { mode: 0o600 },
);

const before = await publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'agents',
  args: [AGENT_ID],
});
const tbaBefore = before[1];

console.log('Owner before:', owner.address);
console.log('Temp wallet:', temp.address);
console.log('TBA before:', tbaBefore);

// Fund temp wallet for return transfer gas
const fundHash = await ownerWallet.sendTransaction({
  to: temp.address,
  value: parseEther('0.0005'),
});
await publicClient.waitForTransactionReceipt({ hash: fundHash });
const tempBal = await publicClient.getBalance({ address: temp.address });
console.log('Temp balance after fund:', formatEther(tempBal));
if (tempBal === 0n) throw new Error('Fund tx did not credit temp wallet');

const outHash = await ownerWallet.writeContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'safeTransferFrom',
  args: [owner.address, temp.address, AGENT_ID],
  gas: 150000n,
});
await publicClient.waitForTransactionReceipt({ hash: outHash });
console.log('Transfer out:', outHash);

const midOwner = await publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'ownerOf',
  args: [AGENT_ID],
});
const midRow = await publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'agents',
  args: [AGENT_ID],
});
console.log('Owner mid:', midOwner, 'TBA same:', midRow[1] === tbaBefore);

const backHash = await tempWallet.writeContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'safeTransferFrom',
  args: [temp.address, owner.address, AGENT_ID],
  gas: 150000n,
});
await publicClient.waitForTransactionReceipt({ hash: backHash });
console.log('Transfer back:', backHash);

const finalOwner = await publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'ownerOf',
  args: [AGENT_ID],
});
const finalRow = await publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: identityRegistryAbi,
  functionName: 'agents',
  args: [AGENT_ID],
});

const result = {
  agentId: AGENT_ID.toString(),
  success: finalOwner.toLowerCase() === owner.address.toLowerCase(),
  tbaUnchanged: finalRow[1].toLowerCase() === tbaBefore.toLowerCase(),
  tba: finalRow[1],
  txs: { fund: fundHash, out: outHash, back: backHash },
  tempKeyFile: keyPath,
};
writeFileSync(join(labDir, `transfer-test-${AGENT_ID}.json`), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (result.success) {
  writeFileSync(keyPath, '{"deleted":"transfer completed — key wiped"}\n');
}
