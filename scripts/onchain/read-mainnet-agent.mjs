#!/usr/bin/env node
/** Leer agente ageNFT en Base mainnet por tokenId. */
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { ageNftAbi, BASE_MAINNET } from './abis.js';

const tokenId = BigInt(process.argv[2]);
if (!process.argv[2]) {
  console.error('Usage: node read-mainnet-agent.mjs <tokenId>');
  process.exit(1);
}

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

const [agent, owner, uri] = await Promise.all([
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
  publicClient.readContract({
    address: BASE_MAINNET.ageNft,
    abi: ageNftAbi,
    functionName: 'tokenURI',
    args: [tokenId],
  }),
]);

console.log(
  JSON.stringify(
    {
      tokenId: tokenId.toString(),
      owner,
      name: agent.name,
      tba: agent.tba,
      tokenURI: uri,
      contract: BASE_MAINNET.ageNft,
      explorer: `https://basescan.org/token/${BASE_MAINNET.ageNft}?a=${tokenId.toString()}`,
      tbaExplorer: `https://basescan.org/address/${agent.tba}`,
    },
    null,
    2,
  ),
);
