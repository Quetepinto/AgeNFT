#!/usr/bin/env node
/** Fondear TBA Unit-mainnet — USDC + ETH desde EOA operacional. */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  formatUnits,
  http,
  parseEther,
  parseUnits,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { BASE_MAINNET, erc20Abi } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCredentials() {
  const path = join(homedir(), '.credentials', 'agenft-base-sepolia.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadMintResult() {
  const path = join(__dirname, '../../docs/research/lab/unit-mainnet-mint.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

async function main() {
  const creds = loadCredentials();
  const mint = loadMintResult();
  if (!mint.tba) throw new Error('No TBA in unit-mainnet-mint.json — mint first.');

  const account = privateKeyToAccount(creds.privateKey);
  const tba = mint.tba;
  const usdcAmount = parseUnits(process.argv[2] ?? '0.02', 6);
  const ethAmount = parseEther(process.argv[3] ?? '0.00015');

  const transport = http('https://mainnet.base.org');
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({ account, chain: base, transport });

  const [eoaEth, eoaUsdc, tbaEthBefore, tbaUsdcBefore] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: BASE_MAINNET.usdc,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address],
    }),
    publicClient.getBalance({ address: tba }),
    publicClient.readContract({
      address: BASE_MAINNET.usdc,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [tba],
    }),
  ]);

  console.log('EOA:', account.address);
  console.log('TBA:', tba);
  console.log('EOA before — ETH:', formatEther(eoaEth), 'USDC:', formatUnits(eoaUsdc, 6));
  console.log('TBA before — ETH:', formatEther(tbaEthBefore), 'USDC:', formatUnits(tbaUsdcBefore, 6));
  console.log('Sending — ETH:', formatEther(ethAmount), 'USDC:', formatUnits(usdcAmount, 6));

  if (eoaUsdc < usdcAmount) throw new Error('Insufficient USDC on EOA');
  if (eoaEth < ethAmount + parseEther('0.00005')) throw new Error('Insufficient ETH on EOA for transfer + gas');

  const usdcHash = await walletClient.writeContract({
    address: BASE_MAINNET.usdc,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [tba, usdcAmount],
  });
  console.log('USDC tx:', usdcHash);
  await publicClient.waitForTransactionReceipt({ hash: usdcHash });

  const ethHash = await walletClient.sendTransaction({
    to: tba,
    value: ethAmount,
  });
  console.log('ETH tx:', ethHash);
  await publicClient.waitForTransactionReceipt({ hash: ethHash });

  const [tbaEthAfter, tbaUsdcAfter] = await Promise.all([
    publicClient.getBalance({ address: tba }),
    publicClient.readContract({
      address: BASE_MAINNET.usdc,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [tba],
    }),
  ]);

  console.log('\n=== Fund OK ===');
  console.log(
    JSON.stringify(
      {
        tba,
        tokenId: mint.tokenId,
        usdcTx: usdcHash,
        ethTx: ethHash,
        tbaAfter: {
          eth: formatEther(tbaEthAfter),
          usdc: formatUnits(tbaUsdcAfter, 6),
        },
        at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('Fund failed:', err.message ?? err);
  process.exit(1);
});
