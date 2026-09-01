#!/usr/bin/env node
/** Mint ageNFT — AgeNFT Registry en Base mainnet. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
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
const ROOT = join(__dirname, '../..');

function parseArgs(argv) {
  const opts = {
    manifest: null,
    name: 'URUIRU',
    salt: null,
    dryRun: false,
    outMint: null,
  };
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--manifest' && argv[i + 1]) opts.manifest = resolve(argv[++i]);
    else if (a === '--name' && argv[i + 1]) opts.name = argv[++i];
    else if (a === '--salt' && argv[i + 1]) opts.salt = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--out' && argv[i + 1]) opts.outMint = resolve(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log(`Uso:
  node mint-mainnet.mjs [--manifest PATH] [--name NAME] [--salt LABEL] [--dry-run]

  --manifest   Manifiesto ageNFT/v1 (Lab Studio → wiring-to-manifest.mjs)
  --dry-run    Solo construye agentURI y muestra simulación — sin tx
  --name       Nombre onchain (default: URUIRU o manifest.name)
  --salt       Salt CREATE2 TBA (default: name)
`);
      process.exit(0);
    } else if (!a.startsWith('-')) positional.push(a);
  }
  if (!opts.name && positional[0]) opts.name = positional[0];
  if (!opts.salt && positional[1]) opts.salt = positional[1];
  return opts;
}

function loadCredentials() {
  const path = join(homedir(), '.credentials', 'agenft-base-sepolia.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (!raw.privateKey) throw new Error(`Missing privateKey in ${path}`);
  return raw;
}

function stripMintOnlyFields(manifest) {
  const m = structuredClone(manifest);
  delete m._wiringSource;
  if (m.identity) {
    m.identity.agentId = null;
    if (m.identity.nft) m.identity.nft.tokenId = 'PENDING';
  }
  if (m.treasury) m.treasury.address = 'PENDING_TBA';
  return m;
}

function buildAgentUriFromManifest(manifest) {
  const body = stripMintOnlyFields(manifest);
  return `data:application/json;base64,${Buffer.from(JSON.stringify(body)).toString('base64')}`;
}

function buildAgentUriLegacy(name) {
  const payload = {
    name,
    description: 'Primer ageNFT nativo Base mainnet — ageNFT Registry propio',
    external_url: 'https://github.com/Quetepinto/AgeNFT',
    attributes: [
      { trait_type: 'stack', value: 'ageNFT-Registry/v1' },
      { trait_type: 'chain', value: 'base-mainnet' },
    ],
  };
  return `data:application/json;base64,${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

function loadManifest(path) {
  if (!path || !existsSync(path)) throw new Error(`Manifiesto no encontrado: ${path}`);
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (raw.type !== 'ageNFT/v1') throw new Error('Manifiesto debe ser type ageNFT/v1');
  return raw;
}

async function main() {
  const opts = parseArgs(process.argv);
  const manifest = opts.manifest ? loadManifest(opts.manifest) : null;
  const name = opts.name ?? manifest?.name ?? 'Unit-Mainnet';
  const saltLabel = opts.salt ?? name;
  const salt = keccak256(stringToBytes(saltLabel));
  const agentURI = manifest ? buildAgentUriFromManifest(manifest) : buildAgentUriLegacy(name);

  console.log('=== ageNFT mint (Base mainnet) ===');
  console.log('Name:', name);
  console.log('Contract:', BASE_MAINNET.ageNft);
  console.log('Salt:', salt);
  console.log('agentURI bytes:', agentURI.length);
  if (manifest) console.log('Manifest:', opts.manifest);

  if (opts.dryRun) {
    console.log('\n--- dry-run ---');
    console.log('agentURI (truncado):', `${agentURI.slice(0, 120)}…`);
    if (manifest) {
      console.log('Órganos:', Object.keys(manifest.organs ?? {}).join(', '));
      console.log(
        'Gateways:',
        (manifest.gateways?.chat ?? []).map((g) => g.platform).join(', ') || 'ninguno'
      );
    }
    console.log('\nPara mint real: quita --dry-run y confirma wallet con ETH en Base.');
    return;
  }

  const creds = loadCredentials();
  const account = privateKeyToAccount(creds.privateKey);
  const transport = http('https://mainnet.base.org');
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({ account, chain: base, transport });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Signer:', account.address);
  console.log('Balance:', Number(balance) / 1e18, 'ETH');
  if (balance === 0n) throw new Error('Wallet has 0 ETH on Base mainnet.');

  const nextId = await publicClient.readContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'nextTokenId',
  });
  console.log('nextTokenId:', nextId.toString());

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
    manifestPath: opts.manifest ?? null,
    salt,
    contract: BASE_MAINNET.ageNft,
    erc6551Registry: BASE_MAINNET.erc6551Registry,
    tbaImplementation: BASE_MAINNET.tbaImplementation,
    mintedAt: new Date().toISOString(),
    explorer: `https://basescan.org/token/${BASE_MAINNET.ageNft}?a=${tokenId?.toString()}`,
    tbaExplorer: tba ? `https://basescan.org/address/${tba}` : null,
  };

  const outDir = join(ROOT, 'docs/research/lab');
  mkdirSync(outDir, { recursive: true });
  const outPath = opts.outMint ?? join(outDir, `mint-token-${tokenId?.toString() ?? 'new'}.json`);
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);

  if (manifest && tokenId != null) {
    const finalized = structuredClone(manifest);
    finalized.identity.agentId = Number(tokenId);
    finalized.identity.nft.tokenId = tokenId.toString();
    finalized.treasury.address = tba;
    finalized.updatedAt = new Date().toISOString();
    delete finalized._wiringSource;
    const manifestOut = join(ROOT, 'docs/manifest/examples', `unit-mainnet-${tokenId}.json`);
    writeFileSync(manifestOut, `${JSON.stringify(finalized, null, 2)}\n`);
    console.log('Manifiesto post-mint:', manifestOut);
  }

  console.log('\n=== Mint OK ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nSaved:', outPath);
  console.log('Siguiente: node fund-tba-mainnet.mjs && node mainnet-checklist.mjs', tokenId?.toString());
}

main().catch((err) => {
  console.error('Mint failed:', err.message ?? err);
  process.exit(1);
});
