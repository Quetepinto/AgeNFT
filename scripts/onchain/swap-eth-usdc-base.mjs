#!/usr/bin/env node
/** Swap ETH → USDC en Base (Uniswap V3 SwapRouter02 + multicall wrap). */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  formatEther,
  formatUnits,
  getAddress,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const ROUTER = getAddress('0x2626664c2603336E57B97c5fD046D6631c7D447C');
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const FEE = 500;

const swapEth = process.argv.find((a) => a.startsWith('--eth='))?.split('=')[1] ?? '0.00012';
const dryRun = process.argv.includes('--dry-run');

const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
);
const account = privateKeyToAccount(creds.privateKey);
const transport = http('https://mainnet.base.org');
const publicClient = createPublicClient({ chain: base, transport });
const wallet = createWalletClient({ account, chain: base, transport });

const amountIn = parseEther(swapEth);
const bal = await publicClient.getBalance({ address: account.address });
console.log('Base ETH:', formatEther(bal), '| swap:', swapEth);

if (bal < amountIn + parseEther('0.00008')) {
  console.error('Not enough Base ETH for swap + gas');
  process.exit(1);
}

const exactInputSingle = encodeFunctionData({
  abi: [
    {
      type: 'function',
      name: 'exactInputSingle',
      inputs: [
        {
          type: 'tuple',
          components: [
            { name: 'tokenIn', type: 'address' },
            { name: 'tokenOut', type: 'address' },
            { name: 'fee', type: 'uint24' },
            { name: 'recipient', type: 'address' },
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMinimum', type: 'uint256' },
            { name: 'sqrtPriceLimitX96', type: 'uint160' },
          ],
        },
      ],
    },
  ],
  functionName: 'exactInputSingle',
  args: [
    {
      tokenIn: WETH,
      tokenOut: USDC,
      fee: FEE,
      recipient: account.address,
      amountIn,
      amountOutMinimum: 0n,
      sqrtPriceLimitX96: 0n,
    },
  ],
});

const refundETH = encodeFunctionData({
  abi: [{ type: 'function', name: 'refundETH', inputs: [], outputs: [] }],
  functionName: 'refundETH',
});

if (dryRun) {
  console.log('dry-run OK — would multicall swap', swapEth, 'ETH → USDC');
  process.exit(0);
}

const hash = await wallet.writeContract({
  address: ROUTER,
  abi: [
    {
      type: 'function',
      name: 'multicall',
      inputs: [
        { name: 'deadline', type: 'uint256' },
        { name: 'data', type: 'bytes[]' },
      ],
      outputs: [{ type: 'bytes[]' }],
      stateMutability: 'payable',
    },
  ],
  functionName: 'multicall',
  args: [BigInt(Math.floor(Date.now() / 1000) + 600), [exactInputSingle, refundETH]],
  value: amountIn,
});

console.log('Swap tx:', hash);
await publicClient.waitForTransactionReceipt({ hash });
const usdc = await publicClient.readContract({
  address: USDC,
  abi: [{ type: 'function', name: 'balanceOf', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] }],
  functionName: 'balanceOf',
  args: [account.address],
});
console.log('USDC after:', formatUnits(usdc, 6));
