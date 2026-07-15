# Migración a Base mainnet

> **Estado:** Plan activo · **Inicio:** 2026-07-15  
> **Cadena objetivo:** `eip155:8453` (Base mainnet)  
> **Relacionado:** [`chain-base-mainnet.md`](../decisions/chain-base-mainnet.md), [`vims-vs-agenft-registry.md`](vims-vs-agenft-registry.md)

---

## Objetivo

Un agente ageNFT donde **identidad, tesoro y pagos x402 viven en la misma cadena** — sin wallet lab EOA como pagador permanente.

**Criterio de éxito (MVP mainnet):**
1. Mint en Base mainnet con TBA desplegada
2. TBA con ≥5 USDC + gas ETH
3. `run-turn --pay` con **payer = TBA** (no EOA lab)
4. Manifiesto `agentURI` resuelve en IPFS/HTTPS
5. Transfer checklist 8/8 incluyendo **pago x402 desde TBA**

---

## Estado actual (post-deploy 2026-07-15 noche)

| Pieza | Hoy | Problema |
|-------|-----|----------|
| Unit-Mainnet #1 | Base mainnet AgeNFT | ✅ minteado |
| TBA `0x9BF1…3CCB` | Contrato + 0.02 USDC + gas | ✅ fondeada |
| AgeNFT registry | `0x76FC…eB839` | ✅ desplegado |
| Cerebro tx402.ai | Base mainnet USDC | ✅ funciona |
| Pagador real | EOA lab ~0.024 USDC | ❌ no soberano (TBA tiene USDC) |
| Unit-1 #115 Sepolia | VIMS lab | legacy |
| Memoria | local unit-mainnet | ⚠️ toju pendiente |

Checklist: [`lab/unit-mainnet-checklist.json`](lab/unit-mainnet-checklist.json) — **7/8**.

Reporte prueba TBA anterior: [`lab/tba-x402-pay-report.json`](lab/tba-x402-pay-report.json) — veredicto **PARTIAL** (pre-mint).

---

## Arquitectura objetivo

```
Base mainnet (8453)
├── ageNFT #N (ERC-721 propio)
├── TBA (ERC-6551 / smart account + session key)
│   ├── USDC → paga cerebro, memoria, voz
│   └── ETH  → gas
├── agentURI → manifiesto ageNFT/v1 (IPFS)
└── x402 services → tx402.ai, toju, …
```

**Runtime** (Hermes + `agenft-core`) lee `chainId: 8453` y firma desde TBA.

---

## Bloques de trabajo

### Bloque A — Registro propio (sustituto VIMS) ★ PRIMERO

| # | Tarea | Entregable |
|---|-------|------------|
| A1 | Spec contratos mínimos | ✅ `docs/architecture/agenft-registry-spec.md` |
| A2 | Deploy `AgeNFT.sol` Foundry | ✅ Base mainnet |
| A3 | Deploy Base mainnet | ✅ [`addresses.base-mainnet.json`](lab/addresses.base-mainnet.json) |
| A4 | Script `mint-mainnet.mjs` | ✅ token #1 + TBA |
| A5 | Sin fee VIMS en x402 receiver | split: creador + TBA only |

**Contratos mínimos MVP:**
- `AgeNFT` — ERC-721 + `agentURI` + `tokenURI`
- `TBACreate` — ERC-6551 deterministic
- `X402Receiver` (opcional v1) — cobrar chat
- *(Fase 4)* ERC-8004 wrapper

---

### Bloque B — Runtime y manifiesto

| # | Tarea | Entregable |
|---|-------|------------|
| B1 | Manifiesto `unit-mainnet.json` chain 8453 | ✅ |
| B2 | `payer-key.mjs` → resolver TBA + session key | ⏳ |
| B3 | `brain-tx402.mjs` signer TBA (ERC-1271 o session EOA delegada) | probe + pay OK |
| B4 | Memoria: toju/W3Stor mainnet; quitar lab-remote como primary | `memory:sync` |
| B5 | Actualizar dApp export — mainnet RPC + USDC | GitHub Pages |

---

### Bloque C — Fondeo y prueba E2E

| # | Tarea | Notas |
|---|-------|-------|
| C1 | Wallet proyecto: ETH mainnet gas | ✅ |
| C2 | USDC → TBA (≥5 USDC operativo) | ⚠️ 0.02 USDC (MVP parcial) |
| C3 | `mainnet-checklist.mjs` | ✅ 7/8 |
| C4 | Transfer round-trip mainnet | ⏳ |
| C5 | Telegram bot apunta a Unit-mainnet | ⏳ |

**Fondeo Jul-15:** ver [`lab/bridge-funding-20260715.md`](lab/bridge-funding-20260715.md)

```bash
node scripts/onchain/wallet-balances.mjs
node scripts/onchain/bridge-to-base.mjs --bridge-eth=0.00065
```

---

### Bloque D — Deprecar lab Sepolia

| # | Tarea |
|---|-------|
| D1 | Documentar Unit-1 como “legacy lab” en README |
| D2 | Congelar scripts VIMS Sepolia (solo lectura) |
| D3 | dApp: pestaña o badge “mainnet” vs “lab sepolia” |
| D4 | Export memoria Unit-1 → seed Unit-mainnet (opcional) |

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| TBA no firma EIP-3009 x402 | Session key limitada; o AgentAccountV2; spike Eliza path |
| Coste deploy mainnet | Una colección pequeña; ~$5–50 gas según contratos |
| AGPL Agent-NFT | Clean-room spec o fork compliant con atribución |
| toju upload roto | W3Stor fallback; Arweave archivo |
| Pérdida historial Unit-1 | Export cápsula antes de switch |

---

## Orden de ejecución (resumen)

```
1. Spec ageNFT Registry (A1)
2. Contratos + deploy mainnet (A2–A4)
3. Mint Unit-mainnet + fund TBA (C1–C2)
4. Runtime payer TBA (B2–B3)
5. E2E pay + transfer (C3–C4)
6. dApp + Telegram (B5, C5)
7. Retirar dependencia VIMS (D)
```

---

## Comandos (cuando existan scripts)

```bash
# Deploy (pendiente)
cd contracts && npm run deploy:base-mainnet

# Mint
node scripts/onchain/mint-mainnet.mjs --name "Unit-Mainnet"

# Fund TBA
node scripts/onchain/fund-tba.mjs <agentId> --mainnet-usdc=5

# Pago cerebro desde TBA
node scripts/onchain/tba-x402-pay.mjs <agentId>

# Checklist transfer
node scripts/onchain/transfer-checklist.mjs <agentId>
```

---

## Documentación relacionada

| Doc | Tema |
|-----|------|
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Órganos y servicios |
| [`validation-results.latest.json`](validation-results.latest.json) | Probes x402/toju |
| [`lab/tba-x402-pay-report.json`](lab/tba-x402-pay-report.json) | Prueba Jul-15 |
