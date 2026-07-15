/**
 * Signer x402 soberano — TBA ERC-6551 (Tokenbound V3) + owner EOA.
 *
 * La TBA valida firmas del owner del NFT vía ERC-1271 (Solady).
 * El pagador on-chain es la TBA; la clave del owner solo firma off-chain.
 */
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  getAddress,
  hashTypedData,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { loadPayerKey } from './payer-key.mjs';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const DEFAULT_RPC = 'https://mainnet.base.org';

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
];

/**
 * @param {object} opts
 * @param {string} opts.tbaAddress
 * @param {string} [opts.ownerPrivateKey]
 * @param {string} [opts.rpcUrl]
 */
export function createTbaPayerSigner({
  tbaAddress,
  ownerPrivateKey = loadPayerKey(),
  rpcUrl = DEFAULT_RPC,
}) {
  if (!ownerPrivateKey) {
    throw new Error('TBA signer requiere clave del owner NFT (AGENFT_PAYER_PRIVATE_KEY)');
  }

  const owner = privateKeyToAccount(ownerPrivateKey);
  const tba = getAddress(tbaAddress);
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({ chain: base, transport });

  return {
    mode: 'tba',
    address: tba,
    owner: owner.address,
    signTypedData: async ({ domain, types, primaryType, message }) => {
      const digest = hashTypedData({ domain, types, primaryType, message });
      return owner.sign({ hash: digest });
    },
    readContract: (args) => publicClient.readContract(args),
    getCode: ({ address }) => publicClient.getBytecode({ address }),
  };
}

async function readUsdcBalance(publicClient, address) {
  return publicClient.readContract({
    address: USDC_BASE,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [getAddress(address)],
  });
}

/**
 * Resuelve modo de pago: TBA soberana si hay USDC en tesoro, si no EOA.
 * @param {object} manifest
 * @param {{ mode?: string, minUsdcMicro?: bigint }} [opts]
 */
export async function resolvePayerSigner(manifest, opts = {}) {
  const mode = opts.mode ?? process.env.AGENFT_PAYER ?? 'auto';
  const treasury = getAddress(manifest.treasury.address);
  const minUsdcMicro = opts.minUsdcMicro ?? 5_000n;

  const ownerPrivateKey = loadPayerKey();
  if (!ownerPrivateKey) return { kind: 'missing_key' };

  const owner = privateKeyToAccount(ownerPrivateKey);
  const publicClient = createPublicClient({
    chain: base,
    transport: http(DEFAULT_RPC),
  });

  const [tbaUsdc, eoaUsdc] = await Promise.all([
    readUsdcBalance(publicClient, treasury),
    readUsdcBalance(publicClient, owner.address),
  ]);

  const wantTba = mode === 'tba' || (mode === 'auto' && tbaUsdc >= minUsdcMicro);
  const wantEoa = mode === 'eoa' || (!wantTba && eoaUsdc >= minUsdcMicro);

  if (wantTba) {
    return {
      kind: 'tba',
      signer: createTbaPayerSigner({ tbaAddress: treasury, ownerPrivateKey }),
      balances: { tbaUsdc, eoaUsdc },
    };
  }

  if (wantEoa) {
    const client = createWalletClient({
      account: owner,
      chain: base,
      transport: http(DEFAULT_RPC),
    });
    const { publicActions } = await import('viem');
    const extended = client.extend(publicActions);
    return {
      kind: 'eoa',
      signer: {
        mode: 'eoa',
        address: owner.address,
        signTypedData: (args) => extended.signTypedData(args),
        readContract: extended.readContract,
      },
      balances: { tbaUsdc, eoaUsdc },
    };
  }

  return {
    kind: 'insufficient',
    balances: { tbaUsdc, eoaUsdc },
    reason: `USDC insuficiente — TBA ${formatUnits(tbaUsdc, 6)}, EOA ${formatUnits(eoaUsdc, 6)}`,
  };
}
