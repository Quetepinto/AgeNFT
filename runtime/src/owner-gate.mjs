/**
 * Gate ownerOf — operador del host debe ser owner onchain del tokenId.
 * Transferir el ageNFT = finalizar acceso al bot (sin medias tintas).
 */
import { createPublicClient, getAddress, http, isAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPayerAccount } from './payer-key.mjs';

const ownerOfAbi = [
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
];

export function ownerGateRequired(manifest) {
  return manifest?.transfer?.runtimeGate?.requireOwnerOfMatch === true;
}

/** @returns {string|null} */
export function resolveOperatorAddress() {
  const env = process.env.AGENFT_OPERATOR_ADDRESS?.trim();
  if (env && isAddress(env)) return getAddress(env);
  const acct = loadPayerAccount();
  return acct?.address ? getAddress(acct.address) : null;
}

function chainFromManifest(manifest) {
  const caip = manifest?.identity?.chain ?? 'eip155:8453';
  return caip === 'eip155:84532' ? baseSepolia : base;
}

function rpcForChain(chain) {
  if (process.env.BASE_RPC_URL?.trim()) return process.env.BASE_RPC_URL.trim();
  return chain.id === 8453 ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
}

function nftContract(manifest) {
  const c = manifest?.identity?.nft?.contract ?? manifest?.identity?.registry;
  return c && isAddress(c) ? getAddress(c) : null;
}

function tokenIdBigInt(manifest, tokenIdHint) {
  const raw = manifest?.identity?.agentId ?? tokenIdHint ?? process.env.AGENFT_TOKEN_ID ?? '1';
  return BigInt(raw);
}

/**
 * @param {{ manifest: object, tokenId?: string|number, force?: boolean }} opts
 */
export async function checkOwnerGate({ manifest, tokenId, force = false }) {
  if (force || !ownerGateRequired(manifest)) {
    return { ok: true, skipped: !ownerGateRequired(manifest) };
  }

  const operator = resolveOperatorAddress();
  if (!operator) {
    return {
      ok: false,
      code: 'owner_gate_no_operator',
      reason:
        'OWNER_GATE: configure AGENFT_OPERATOR_ADDRESS o ~/.credentials con la wallet que es ownerOf del NFT.',
    };
  }

  const contract = nftContract(manifest);
  if (!contract) {
    return {
      ok: false,
      code: 'owner_gate_no_contract',
      reason: 'OWNER_GATE: falta identity.nft.contract en el manifiesto.',
    };
  }

  try {
    const chain = chainFromManifest(manifest);
    const client = createPublicClient({ chain, transport: http(rpcForChain(chain)) });
    const onchainOwner = getAddress(
      await client.readContract({
        address: contract,
        abi: ownerOfAbi,
        functionName: 'ownerOf',
        args: [tokenIdBigInt(manifest, tokenId)],
      }),
    );

    if (onchainOwner !== operator) {
      return {
        ok: false,
        code: 'owner_mismatch',
        operator,
        onchainOwner,
        reason:
          `OWNER_GATE: wallet operadora ${operator} ≠ ownerOf=${onchainOwner}. ` +
          'Transferir el ageNFT finaliza el acceso al bot. Pare el servicio Telegram y revoque el token en BotFather.',
      };
    }

    return { ok: true, operator, onchainOwner };
  } catch (e) {
    return {
      ok: false,
      code: 'owner_gate_rpc',
      reason: `OWNER_GATE: no se pudo leer ownerOf — ${e.message ?? e}`,
    };
  }
}

async function main() {
  const { resolveAgentEnv } = await import('./agenft-env.mjs');
  const force = process.argv.includes('--force');
  const ctx = resolveAgentEnv();
  const gate = await checkOwnerGate({ manifest: ctx.manifest, tokenId: ctx.tokenId, force });

  if (gate.ok) {
    console.log('OWNER_GATE OK');
    if (gate.onchainOwner) console.log('ownerOf:', gate.onchainOwner);
    process.exit(0);
  }

  console.error(gate.reason);
  process.exit(force ? 0 : 3);
}

const isMain =
  process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) {
  main().catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  });
}
