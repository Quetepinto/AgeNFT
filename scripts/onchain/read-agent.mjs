#!/usr/bin/env node
/** Read Agent-NFT state from Base Sepolia identity registry. */
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { identityRegistryAbi, IDENTITY_REGISTRY, DEPLOYMENTS } from './abis.js';

const agentId = BigInt(process.argv[2]);
if (!process.argv[2]) {
  console.error('Usage: node read-agent.mjs <agentId>');
  process.exit(1);
}

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const [raw, owner, uri, royaltyRow] = await Promise.all([
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'agents',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'ownerOf',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'tokenURI',
    args: [agentId],
  }),
  publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: 'getCreatorRoyalty',
    args: [agentId],
  }),
]);

const [name, tbaAddress, createdAt, active, reputationAnchor] = raw;
const [creator, creatorRoyaltyBps] = royaltyRow;

console.log(
  JSON.stringify(
    {
      agentId: agentId.toString(),
      owner,
      name,
      tba: tbaAddress,
      active,
      createdAt: new Date(Number(createdAt) * 1000).toISOString(),
      reputationAnchor,
      tokenURI: uri,
      creator,
      creatorRoyaltyBps: creatorRoyaltyBps.toString(),
      registry: IDENTITY_REGISTRY,
      deployments: DEPLOYMENTS.proxies,
      explorer: `https://sepolia.basescan.org/token/${IDENTITY_REGISTRY}?a=${agentId.toString()}`,
      tbaExplorer: `https://sepolia.basescan.org/address/${tbaAddress}`,
    },
    null,
    2,
  ),
);
