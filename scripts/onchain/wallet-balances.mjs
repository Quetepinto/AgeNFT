#!/usr/bin/env node
/** Snapshot saldos EOA + TBA Unit-Mainnet — Ethereum L1 + Base mainnet. */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, formatEther, formatUnits, http } from 'viem';
import { mainnet, base } from 'viem/chains';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const EOA = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
).address;

const mintPath = join(ROOT, 'docs/research/lab/unit-mainnet-mint.json');
const tba = existsSync(mintPath)
  ? JSON.parse(readFileSync(mintPath, 'utf8')).tba
  : null;

const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const erc20 = [{ type: 'function', name: 'balanceOf', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] }];

const l1 = createPublicClient({ chain: mainnet, transport: http('https://ethereum.publicnode.com') });
const b = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

const reads = [
  l1.getBalance({ address: EOA }),
  b.getBalance({ address: EOA }),
  l1.readContract({ address: USDC_ETH, abi: erc20, functionName: 'balanceOf', args: [EOA] }),
  b.readContract({ address: USDC_BASE, abi: erc20, functionName: 'balanceOf', args: [EOA] }),
];

if (tba) {
  reads.push(
    b.getBalance({ address: tba }),
    b.readContract({ address: USDC_BASE, abi: erc20, functionName: 'balanceOf', args: [tba] }),
  );
}

const results = await Promise.all(reads);
const [l1Eth, baseEth, l1Usdc, baseUsdc, tbaEth, tbaUsdc] = results;

const out = {
  eoa: EOA,
  ethereumL1: { eth: formatEther(l1Eth), usdc: formatUnits(l1Usdc, 6) },
  baseMainnet: { eth: formatEther(baseEth), usdc: formatUnits(baseUsdc, 6) },
  at: new Date().toISOString(),
};

if (tba) {
  out.tba = {
    address: tba,
    eth: formatEther(tbaEth),
    usdc: formatUnits(tbaUsdc, 6),
  };
}

console.log(JSON.stringify(out, null, 2));
