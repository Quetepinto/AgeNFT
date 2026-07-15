#!/usr/bin/env node
/**
 * Puente ETH Ethereum L1 → Base mainnet (Standard Bridge OP Stack).
 * Opcional: swap parte del ETH bridged → USDC en Base.
 *
 * Usage:
 *   node bridge-to-base.mjs --dry-run
 *   node bridge-to-base.mjs --bridge-eth=0.00065
 *   node bridge-to-base.mjs --bridge-eth=0.00065 --swap-eth=0.00015
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
import { mainnet, base } from 'viem/chains';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LAB = join(__dirname, '../../docs/research/lab');

const L1_STANDARD_BRIDGE = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const bridgeAbi = [
  {
    type: 'function',
    name: 'depositETH',
    inputs: [
      { name: '_minGasLimit', type: 'uint32' },
      { name: '_extraData', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
];

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
];

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
}

const dryRun = process.argv.includes('--dry-run');
const bridgeEth = arg('bridge-eth', '0.00065');
const swapEth = arg('swap-eth', '0.00015');
const minGasLimit = Number(arg('min-gas-limit', '200000'));

const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials', 'agenft-base-sepolia.json'), 'utf8'),
);
const account = privateKeyToAccount(creds.privateKey);

const l1Transport = http('https://ethereum.publicnode.com');
const baseTransport = http('https://mainnet.base.org');

const l1Public = createPublicClient({ chain: mainnet, transport: l1Transport });
const l1Wallet = createWalletClient({ account, chain: mainnet, transport: l1Transport });
const basePublic = createPublicClient({ chain: base, transport: baseTransport });

async function balances(label) {
  const [l1Eth, baseEth, baseUsdc] = await Promise.all([
    l1Public.getBalance({ address: account.address }),
    basePublic.getBalance({ address: account.address }),
    basePublic.readContract({
      address: USDC_BASE,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address],
    }),
  ]);
  return {
    label,
    l1Eth: formatEther(l1Eth),
    baseEth: formatEther(baseEth),
    baseUsdc: formatUnits(baseUsdc, 6),
  };
}

const before = await balances('before');
console.log('=== bridge-to-base ===');
console.log('EOA:', account.address);
console.log('Before:', before);
console.log('Plan: bridge', bridgeEth, 'ETH L1→Base; swap', swapEth, 'ETH→USDC on Base');
console.log('dry-run:', dryRun);

const bridgeValue = parseEther(bridgeEth);
const l1Bal = await l1Public.getBalance({ address: account.address });
const reserve = parseEther('0.00028'); // gas L1 restante

if (l1Bal < bridgeValue + reserve) {
  console.error(
    `Insufficient L1 ETH: have ${formatEther(l1Bal)}, need ${formatEther(bridgeValue + reserve)} (bridge + reserve)`,
  );
  process.exit(1);
}

const report = {
  at: new Date().toISOString(),
  eoa: account.address,
  before,
  bridgeEth,
  swapEth,
  txs: {},
  after: null,
  dryRun,
};

if (!dryRun) {
  console.log('Bridging ETH to Base…');
  const bridgeHash = await l1Wallet.writeContract({
    address: L1_STANDARD_BRIDGE,
    abi: bridgeAbi,
    functionName: 'depositETH',
    args: [minGasLimit, '0x'],
    value: bridgeValue,
  });
  report.txs.bridge = bridgeHash;
  console.log('Bridge tx L1:', bridgeHash);
  const bridgeReceipt = await l1Public.waitForTransactionReceipt({ hash: bridgeHash });
  console.log('Bridge L1 status:', bridgeReceipt.status);

  console.log('Waiting for Base balance (up to 15 min)…');
  const beforeBase = await basePublic.getBalance({ address: account.address });
  const target = beforeBase + bridgeValue / 2n;
  let baseEthOk = false;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const b = await basePublic.getBalance({ address: account.address });
    if (b >= target) {
      baseEthOk = true;
      console.log('Base ETH arrived:', formatEther(b));
      break;
    }
    if (i % 4 === 0) console.log(`  …still waiting (${i * 15}s)`);
  }
  if (!baseEthOk) {
    console.warn('Bridge may still be in flight — run swap-eth-usdc-base.mjs later.');
  } else if (Number(swapEth) > 0) {
    console.log('Run swap separately: node swap-eth-usdc-base.mjs --eth=' + swapEth);
  }
} else {
  report.note = 'dry-run only';
}

report.after = await balances('after');
mkdirSync(LAB, { recursive: true });
const outPath = join(LAB, 'bridge-to-base-report.json');
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log('After:', report.after);
console.log('Report:', outPath);
