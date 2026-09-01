#!/usr/bin/env node
/**
 * Transferir ageNFT en Base mainnet + checklist corte Telegram.
 *
 * REGLA: transferir el ageNFT = finalizar acceso al bot del ex-owner.
 *
 * Uso:
 *   node transfer-mainnet.mjs <tokenId> <toAddress> [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  isAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { ageNftAbi, BASE_MAINNET } from './abis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

const POST_TRANSFER_EX_OWNER = [
  'PARAR servicio Telegram en este host (systemctl stop agenft-telegram-mainnet o equivalente).',
  'REVOCAR token del bot en @BotFather (/revoke o regenerar). Sin esto la API de Telegram sigue viva.',
  'NO reutilizar el mismo @handle — el comprador crea SU bot nuevo en BotFather.',
  'El runtime con wallet antigua dejará de operar (OWNER_GATE ownerOf).',
];

const POST_TRANSFER_NEW_OWNER = [
  'Verificar ownerOf en BaseScan.',
  'Crear bot NUEVO en @BotFather (nuevo token → Vault 0 del comprador).',
  'Configurar runtime en SU host con AGENFT_OPERATOR_ADDRESS = su wallet owner.',
  'Probar: cd runtime && npm run owner:gate && npm run hermes:turn:pay -- --plain "hola"',
  'Arrancar bot: npm run telegram:mainnet:pay',
];

function loadCredentials() {
  const path = join(homedir(), '.credentials', 'agenft-base-sepolia.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (!raw.privateKey) throw new Error(`Missing privateKey in ${path}`);
  return raw;
}

function printChecklist(title, items) {
  console.log(`\n=== ${title} ===`);
  items.forEach((line, i) => console.log(`${i + 1}. ${line}`));
}

async function main() {
  const tokenId = BigInt(process.argv[2] ?? '1');
  const toArg = process.argv[3];
  const dryRun = process.argv.includes('--dry-run');

  if (!toArg || !isAddress(toArg)) {
    console.error('Uso: node transfer-mainnet.mjs <tokenId> <toAddress> [--dry-run]');
    process.exit(1);
  }
  const to = getAddress(toArg);

  const creds = loadCredentials();
  const account = privateKeyToAccount(creds.privateKey);
  const transport = http(process.env.BASE_RPC_URL ?? 'https://mainnet.base.org');
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({ account, chain: base, transport });

  const owner = await publicClient.readContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  console.log('=== ageNFT transfer (Base mainnet) ===');
  console.log('Contract:', BASE_MAINNET.ageNft);
  console.log('tokenId:', tokenId.toString());
  console.log('from (owner):', owner);
  console.log('to:', to);
  console.log('signer:', account.address);

  if (getAddress(owner) !== account.address) {
    throw new Error(`Signer ${account.address} is not ownerOf(${tokenId}) — ${owner}`);
  }
  if (getAddress(owner) === to) {
    throw new Error('Destination is already owner');
  }

  printChecklist('EX-OWNER — OBLIGATORIO tras la tx (corte Telegram)', POST_TRANSFER_EX_OWNER);
  printChecklist('NUEVO OWNER — antes de chat público', POST_TRANSFER_NEW_OWNER);

  console.log('\n--- Política ---');
  console.log('Transferir el ageNFT = FINALIZAR acceso al bot.');
  console.log('No existe modo cooperativo de mismo @handle. Si necesitan hablar, usen Telegram humano o dos ageNFTs.');
  console.log('Doc: docs/decisions/transfer-telegram-gateway.md');

  if (dryRun) {
    console.log('\n--- dry-run: no se envió transacción ---');
    return;
  }

  const { request } = await publicClient.simulateContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'safeTransferFrom',
    args: [account.address, to, tokenId],
    account,
  });

  const hash = await walletClient.writeContract(request);
  console.log('\nTx:', hash);
  console.log('Explorer:', `https://basescan.org/tx/${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') throw new Error('Transfer reverted');

  const newOwner = await publicClient.readContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  const result = {
    network: BASE_MAINNET.network,
    tokenId: tokenId.toString(),
    txHash: hash,
    from: account.address,
    to: newOwner,
    transferredAt: new Date().toISOString(),
    policy: 'transfer-ends-telegram-access',
    exOwnerChecklist: POST_TRANSFER_EX_OWNER,
    newOwnerChecklist: POST_TRANSFER_NEW_OWNER,
  };

  const outDir = join(ROOT, 'docs/research/lab');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `transfer-mainnet-${tokenId}.json`);
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);

  console.log('\n=== Transfer OK ===');
  console.log('Nuevo owner:', newOwner);
  console.log('Saved:', outPath);
  printChecklist('AHORA — EX-OWNER', POST_TRANSFER_EX_OWNER);
}

main().catch((e) => {
  console.error('Transfer failed:', e.message ?? e);
  process.exit(1);
});
