#!/usr/bin/env node
/**
 * Spike — firma EIP-3009 soberana desde TBA (ERC-1271 Tokenbound V3).
 *
 * Usage: node tba-sign-probe.mjs [tbaAddress]
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  getAddress,
  hashTypedData,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { verifyTypedDataSignature } from '../../runtime/node_modules/@x402/evm/dist/esm/index.mjs';
import { createTbaPayerSigner } from '../../runtime/src/tba-payer-signer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mint = JSON.parse(
  readFileSync(join(__dirname, '../../docs/research/lab/unit-mainnet-mint.json'), 'utf8'),
);
const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
);

const tba = getAddress(process.argv[2] ?? mint.tba);
const usdc = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

const authorizationTypes = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

const domain = {
  name: 'USD Coin',
  version: '2',
  chainId: 8453,
  verifyingContract: usdc,
};

const message = {
  from: tba,
  to: getAddress('0x0000000000000000000000000000000000000001'),
  value: 100n,
  validAfter: 0n,
  validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600),
  nonce: `0x${'ab'.repeat(32)}`,
};

const signer = createTbaPayerSigner({ tbaAddress: tba, ownerPrivateKey: creds.privateKey });
const signature = await signer.signTypedData({
  domain,
  types: authorizationTypes,
  primaryType: 'TransferWithAuthorization',
  message,
});

const digest = hashTypedData({
  domain,
  types: authorizationTypes,
  primaryType: 'TransferWithAuthorization',
  message,
});

const erc1271 = [
  {
    name: 'isValidSignature',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes4' }],
  },
];

const magic = await publicClient.readContract({
  address: tba,
  abi: erc1271,
  functionName: 'isValidSignature',
  args: [digest, signature],
});

const x402Ok = await verifyTypedDataSignature(
  {
    getCode: ({ address }) => publicClient.getBytecode({ address }),
    readContract: (args) => publicClient.readContract(args),
  },
  {
    address: tba,
    domain,
    types: authorizationTypes,
    primaryType: 'TransferWithAuthorization',
    message,
    signature,
  },
);

const owner = privateKeyToAccount(creds.privateKey);
const report = {
  tba,
  owner: owner.address,
  digest,
  isValidSignature: magic,
  erc1271Pass: magic.toLowerCase().startsWith('0x1626ba7e'),
  x402VerifyPass: x402Ok,
  verdict: x402Ok && magic.toLowerCase().startsWith('0x1626ba7e') ? 'PASS' : 'FAIL',
  at: new Date().toISOString(),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.verdict === 'PASS' ? 0 : 1);
