/** VIMS / Agent-NFT contract ABIs for Base Sepolia lab. */
import { createHash } from 'node:crypto';
import { keccak256, stringToBytes } from 'viem';

export const IDENTITY_REGISTRY = '0xfE1ef66Ba95891d3cDf6FB83FE1444Bc3bB9FEeF';

export const identityRegistryAbi = [
  {
    type: 'function',
    name: 'mintWithFullStack',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'agentURI', type: 'string' },
      { name: 'royaltyBps', type: 'uint256' },
      { name: 'collection', type: 'address' },
      { name: 'tbaSalt', type: 'bytes32' },
      { name: 'serviceId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'tba', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'agents',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'tbaAddress', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'active', type: 'bool' },
      { name: 'reputationAnchor', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCreatorRoyalty',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'royaltyBps', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'royaltyVaultAddress',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AgentRegistered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'agentURI', type: 'string', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AgentTBASet',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'tba', type: 'address', indexed: false },
    ],
    anonymous: false,
  },
];

export const contextRegistryAbi = [
  {
    type: 'function',
    name: 'addFile',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'storageURI', type: 'string' },
      { name: 'contentHash', type: 'bytes32' },
      { name: 'fileType', type: 'uint8' },
      { name: 'category', type: 'uint8' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'index', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'fileCount',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFile',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'name', type: 'string' },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { name: 'name', type: 'string' },
          { name: 'storageURI', type: 'string' },
          { name: 'contentHash', type: 'bytes32' },
          { name: 'description', type: 'string' },
          { name: 'updatedAt', type: 'uint48' },
          { name: 'fileType', type: 'uint8' },
          { name: 'category', type: 'uint8' },
          { name: 'enabled', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllFiles',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        name: '',
        components: [
          { name: 'name', type: 'string' },
          { name: 'storageURI', type: 'string' },
          { name: 'contentHash', type: 'bytes32' },
          { name: 'description', type: 'string' },
          { name: 'updatedAt', type: 'uint48' },
          { name: 'fileType', type: 'uint8' },
          { name: 'category', type: 'uint8' },
          { name: 'enabled', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];

export const memoryRegistryAbi = [
  {
    type: 'function',
    name: 'addVersion',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'storageURI', type: 'string' },
      { name: 'contentHash', type: 'bytes32' },
      { name: 'versionType', type: 'uint8' },
      { name: 'category', type: 'uint8' },
      { name: 'tier', type: 'uint8' },
      { name: 'baseVersion', type: 'uint16' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'version', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'versionCount',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLatest',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      { name: 'version', type: 'uint256' },
      {
        type: 'tuple',
        name: 'v',
        components: [
          { name: 'storageURI', type: 'string' },
          { name: 'contentHash', type: 'bytes32' },
          { name: 'versionType', type: 'uint8' },
          { name: 'category', type: 'uint8' },
          { name: 'tier', type: 'uint8' },
          { name: 'baseVersion', type: 'uint16' },
          { name: 'timestamp', type: 'uint48' },
          { name: 'description', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];

export const x402ReceiverAbi = [
  {
    type: 'function',
    name: 'registerService',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'serviceId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getService',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'serviceId', type: 'bytes32' },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { name: 'token', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'quoteSplit',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'serviceId', type: 'bytes32' },
    ],
    outputs: [
      { name: 'gross', type: 'uint256' },
      { name: 'systemCut', type: 'uint256' },
      { name: 'creatorCut', type: 'uint256' },
      { name: 'agentCut', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowedTokens',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
];

export const DEPLOYMENTS = {
  network: 'base-sepolia',
  chainId: 84532,
  proxies: {
    AgentIdentityRegistry: IDENTITY_REGISTRY,
    AgentTBARegistry: '0x1383FA459907ce08f7A6c4619C40f672C0cA7D5e',
    AgentMemory: '0x2eEc7cB85a127D2f2B49EE1957d87797C961a2D1',
    AgentX402Receiver: '0xd180DC89270Df505F5d4B7B36e83318f330014A7',
    AgentContextRegistry: '0x816D8AA61c283d874ae6C9A9c380A43fd325f9D5',
    AgentReputationRegistry: '0x5563EE2939F6839CE82B3cA6E50AA285e8d1C316',
    AgentPaymentRouter: '0x1d4320d0cdcbA7d60dc1A76cE63AA13a2Cd43b97',
  },
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

export const CONTEXT = { FILE_MD: 0, CATEGORY_INSTRUCTION: 2 };
export const MEMORY = { TYPE_CAPSULE: 2, CATEGORY_SKILL: 6, TIER_L2: 2 };

export function contentHash(content) {
  return `0x${createHash('sha256').update(content).digest('hex')}`;
}

export function serviceId(label) {
  return keccak256(stringToBytes(label));
}
