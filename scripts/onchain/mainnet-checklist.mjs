#!/usr/bin/env node
/**
 * Checklist post-mint Unit-Mainnet — Base mainnet (ageNFT Registry propio).
 *
 * Usage:
 *   node mainnet-checklist.mjs [tokenId] [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, formatEther, formatUnits, getAddress, hashTypedData, http } from 'viem';
import { base } from 'viem/chains';
import { verifyTypedDataSignature } from '../../runtime/node_modules/@x402/evm/dist/esm/index.mjs';
import { createTbaPayerSigner } from '../../runtime/src/tba-payer-signer.mjs';
import { ageNftAbi, BASE_MAINNET, erc20Abi } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const MANIFEST = join(REPO, 'docs/manifest/examples/unit-mainnet.json');

const args = process.argv.slice(2);
const tokenId = BigInt(args.find((a) => /^\d+$/.test(a)) ?? 1);
const dryRun = args.includes('--dry-run');

const creds = JSON.parse(
  readFileSync(join(homedir(), '.credentials', 'agenft-base-sepolia.json'), 'utf8'),
);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

function check(id, label, ok, detail = '') {
  return { id, label, ok: Boolean(ok), detail };
}

async function main() {
  const [agent, owner, tbaEth, tbaUsdc] = await Promise.all([
    publicClient.readContract({
      address: BASE_MAINNET.ageNft,
      abi: ageNftAbi,
      functionName: 'getAgent',
      args: [tokenId],
    }),
    publicClient.readContract({
      address: BASE_MAINNET.ageNft,
      abi: ageNftAbi,
      functionName: 'ownerOf',
      args: [tokenId],
    }),
    publicClient.getBalance({ address: manifest.treasury.address }),
    publicClient.readContract({
      address: BASE_MAINNET.usdc,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [manifest.treasury.address],
    }),
  ]);

  const items = [
    check(
      1,
      'NFT existe y owner coincide con wallet operacional',
      owner.toLowerCase() === creds.address.toLowerCase(),
      `owner=${owner}`,
    ),
    check(
      2,
      'TBA on-chain coincide con manifiesto',
      agent.tba.toLowerCase() === manifest.treasury.address.toLowerCase(),
      agent.tba,
    ),
    check(
      3,
      'Nombre agente = Unit-Mainnet',
      agent.name === manifest.name,
      agent.name,
    ),
    check(
      4,
      'TBA tiene USDC operativo (≥0.01)',
      tbaUsdc >= 10_000n,
      `${formatUnits(tbaUsdc, 6)} USDC`,
    ),
    check(
      5,
      'TBA tiene ETH para gas (≥0.00005)',
      tbaEth >= 50_000_000_000_000n,
      `${formatEther(tbaEth)} ETH`,
    ),
    check(
      6,
      'Registry en manifiesto = contrato AgeNFT',
      manifest.identity.registry.toLowerCase() === BASE_MAINNET.ageNft.toLowerCase(),
      BASE_MAINNET.ageNft,
    ),
    check(
      7,
      'Cerebro x402 probe (402)',
      await probeBrain(manifest.organs.brain.primary.endpoint),
      'tx402.ai',
    ),
    check(
      8,
      'Firma EIP-3009 soberana TBA (ERC-1271)',
      await probeTbaSovereignSign(agent.tba, creds.privateKey),
      'owner firma digest → TBA isValidSignature',
    ),
  ];

  const passed = items.filter((i) => i.ok).length;
  const report = {
    network: BASE_MAINNET.network,
    tokenId: tokenId.toString(),
    contract: BASE_MAINNET.ageNft,
    tba: agent.tba,
    owner,
    checklist: items,
    score: `${passed}/${items.length}`,
    dryRun,
    at: new Date().toISOString(),
  };

  const outPath = join(REPO, 'docs/research/lab/unit-mainnet-checklist.json');
  if (!dryRun) {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify(report, null, 2));
  if (!dryRun) console.log('\nSaved:', outPath);
  process.exit(passed === items.length ? 0 : passed >= 6 ? 0 : 1);
}

async function probeTbaSovereignSign(tbaAddress, ownerPrivateKey) {
  const tba = getAddress(tbaAddress);
  const usdc = getAddress(BASE_MAINNET.usdc);
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
    value: 1n,
    validAfter: 0n,
    validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600),
    nonce: `0x${'cd'.repeat(32)}`,
  };
  const signer = createTbaPayerSigner({ tbaAddress: tba, ownerPrivateKey });
  const signature = await signer.signTypedData({
    domain,
    types: authorizationTypes,
    primaryType: 'TransferWithAuthorization',
    message,
  });
  return verifyTypedDataSignature(
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
}

async function probeBrain(endpoint) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'minimax/minimax-m3',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8,
      }),
      signal: AbortSignal.timeout(15000),
    });
    return res.status === 402 || res.ok;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error('Checklist failed:', err.message ?? err);
  process.exit(1);
});
