# Fondeo Base mainnet — Jul 2026

> **Wallet proyecto:** `0xeAf1fe999633B70433cB6B506f9413f73e108C9f`  
> **Ejecutado:** 2026-07-15

---

## Situación inicial

| Red | ETH | USDC |
|-----|-----|------|
| Ethereum L1 | ~0.001 (~$1.93) | 0 |
| Base mainnet | 0 | ~0.044 |

El cerebro x402 y servicios operan en **Base mainnet**. Había USDC pero **sin ETH** en Base para gas.

---

## Acciones ejecutadas

### 1. Bridge L1 → Base ✅

```bash
cd scripts/onchain
node bridge-to-base.mjs --bridge-eth=0.00065
```

| Campo | Valor |
|-------|-------|
| TX L1 | [`0xe0657f…d869`](https://etherscan.io/tx/0xe0657f294916ec084d0cd5f1f4b3b6cabf4cc7612f0aedea9e5562f4fe69d869) |
| Cantidad | 0.00065 ETH |
| Tiempo llegada | ~70 s |
| Report | [`bridge-to-base-report.json`](bridge-to-base-report.json) |

Contrato: `L1StandardBridge` `0x3154Cf16ccdb4C6d922629664174b904d80F2C35`  
Función: `depositETH(minGasLimit, extraData)`

### 2. Swap ETH → USDC ⚠️ parcial

```bash
node swap-eth-usdc-base.mjs --eth=0.00012
```

- TX: `0x562fbfb0…eb2c` — success pero **USDC sin cambio** (multicall Uniswap necesita ajuste)
- **No crítico:** ya había ~0.044 USDC en Base para x402

### 3. Saldos finales (aprox.)

| Red | ETH | USDC |
|-----|-----|------|
| Ethereum L1 | ~0.00031 | 0 |
| **Base mainnet** | **~0.00053** | **~0.044** |

→ Base tiene **gas + USDC** para operar hasta mint TBA.

---

## Scripts

| Script | Uso |
|--------|-----|
| `wallet-balances.mjs` | Ver saldos L1 + Base |
| `bridge-to-base.mjs` | Puente ETH L1→Base |
| `swap-eth-usdc-base.mjs` | Swap ETH→USDC en Base |

---

## Próximo paso

1. Deploy **ageNFT Registry** mainnet
2. Mint **Unit-mainnet**
3. Mover USDC+ETH de wallet proyecto → **TBA** del nuevo NFT
4. Pago x402 desde TBA (session key)

→ [`mainnet-migration.md`](../mainnet-migration.md)
