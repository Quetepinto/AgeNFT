# Backup — deploy + mint Unit-Mainnet (2026-07-15)

Snapshot tras deploy AgeNFT y mint token #1 en Base mainnet.

## Contratos

| Componente | Dirección |
|------------|-----------|
| AgeNFT | `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839` |
| ERC-6551 Registry | `0x000000006551c19487814612e58FE06813775758` |
| TBA impl (Tokenbound V3) | `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` |

## Unit-Mainnet #1

| Campo | Valor |
|-------|-------|
| tokenId | 1 |
| owner | `0xeAf1fe999633B70433cB6B506f9413f73e108C9f` |
| TBA | `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB` |
| deploy tx | `0x7eea1a5ba586f7793d5b1ccfb6ac1d3256f4afd01dd6685ecaa33f48d82076ea` |
| mint tx | `0x15c195568dbeaebdc43ed774746cdb6a5bc5dac95c2837b6b43d45c2043eae9c` |
| fund USDC | `0x50aad347746c5b5880cd7b7ad68eb22fce8edfa716bb94cd2bc41e0deac8fa70` |
| fund ETH | `0x792b1864bea21707c67f851e10a4bd62ef5bee47d002472331e5bf41a8f85206` |

## Saldos post-fondeo (aprox.)

| Cartera | ETH | USDC |
|---------|-----|------|
| EOA | ~0.00037 | ~0.024 |
| TBA | ~0.00015 | 0.02 |

## Pendiente

- Pago x402 **desde TBA** (session key / ERC-1271)
- dApp + Telegram → Unit-Mainnet
- Verificar contrato en Basescan (opcional)

## Scripts nuevos

- `scripts/onchain/mint-mainnet.mjs`
- `scripts/onchain/fund-tba-mainnet.mjs`
- `scripts/onchain/read-mainnet-agent.mjs`
