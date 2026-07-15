#!/usr/bin/env node
/**
 * Pago x402 real desde TBA soberana — Unit-Mainnet.
 *
 * Usage: node tba-x402-pay.mjs ["mensaje"]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, formatUnits, getAddress, http } from 'viem';
import { base } from 'viem/chains';
import { createTbaPayerSigner } from '../../runtime/src/tba-payer-signer.mjs';
import { inferBrain } from '../../runtime/src/brain-tx402.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mint = JSON.parse(
  readFileSync(join(__dirname, '../../docs/research/lab/unit-mainnet-mint.json'), 'utf8'),
);
const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
);

const tba = getAddress(mint.tba);
const usdc = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
const userMessage =
  process.argv[2] ?? 'Confirma en una frase que el pago x402 sale de la TBA soberana de Unit-Mainnet.';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});
const erc20 = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
];

const before = await publicClient.readContract({
  address: usdc,
  abi: erc20,
  functionName: 'balanceOf',
  args: [tba],
});

const signer = createTbaPayerSigner({ tbaAddress: tba, ownerPrivateKey: creds.privateKey });
const result = await inferBrain({
  brain: {
    primary: {
      endpoint: 'https://tx402.ai/v1/chat/completions',
      model: 'minimax/minimax-m3',
    },
  },
  systemPrompt: 'Eres Unit-Mainnet, agente ageNFT en Base mainnet. Responde breve.',
  userMessage,
  pay: true,
  signer,
});

const after = await publicClient.readContract({
  address: usdc,
  abi: erc20,
  functionName: 'balanceOf',
  args: [tba],
});

const report = {
  network: 'base-mainnet',
  tba,
  tokenId: mint.tokenId,
  payer: result.payer,
  payerMode: result.payerMode,
  ok: result.ok,
  status: result.status,
  costUsd: result.costUsd,
  usdcBefore: formatUnits(before, 6),
  usdcAfter: formatUnits(after, 6),
  usdcDelta: formatUnits(before - after, 6),
  content: result.content,
  verdict: result.ok && before > after ? 'PASS — pago soberano TBA' : 'FAIL',
  at: new Date().toISOString(),
};

const outDir = join(__dirname, '../../docs/research/lab');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'tba-x402-pay-report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
process.exit(report.verdict.startsWith('PASS') ? 0 : 1);
