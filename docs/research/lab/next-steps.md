# Próximos pasos — jul 2026 (post-mainnet)

> **Prioridad:** Migrar a **Base mainnet** con registro propio.  
> **Última revisión:** 2026-07-15

---

## Regla de oro

> **Un agente, una cadena, una cartera.**  
> Mainnet primero; Sepolia/VIMS = archivo lab.

---

## ★ Bloque 0 — Mainnet (AHORA)

| # | Tarea | Estado |
|---|-------|--------|
| 0a | Decisión Base mainnet | ✅ [`chain-base-mainnet.md`](../decisions/chain-base-mainnet.md) |
| 0b | Doc VIMS → ageNFT Registry | ✅ [`vims-vs-agenft-registry.md`](../research/vims-vs-agenft-registry.md) |
| 0c | Plan migración | ✅ [`mainnet-migration.md`](../research/mainnet-migration.md) |
| 0c1 | Bridge ETH L1→Base | ✅ [`bridge-funding-20260715.md`](bridge-funding-20260715.md) |
| 0d | Spec + contratos `AgeNFT` | ✅ deploy [`addresses.base-mainnet.json`](lab/addresses.base-mainnet.json) |
| 0e | Deploy + mint Unit-mainnet | ✅ token **#1** — [`unit-mainnet-mint.json`](lab/unit-mainnet-mint.json) |
| 0f | Pago x402 desde TBA mainnet | ✅ ERC-1271 owner→TBA — [`tba-x402-sovereign-path.md`](tba-x402-sovereign-path.md) |
| 0g | ETH mainnet gas (wallet proyecto) | ✅ ~0.00037 ETH EOA + TBA fondeada |
| 0h | Fondeo TBA (0.02 USDC + gas ETH) | ✅ |
| 0i | Runtime default → Unit-Mainnet | ✅ manifiesto + `AGENFT_TOKEN_ID=1` |
| 0j | Checklist mainnet | ✅ **8/8** |

---

## Bloque 1 — Cerrar Fase 2 lab (paralelo / mantenimiento)

| Hecho ✅ | Legacy |
|---------|--------|
| Hermes + Doctor cron | Unit-1 Sepolia |
| dApp + Telegram | Pago EOA lab |
| Transfer 7/7 Sepolia | VIMS mint |
| Catálogo órganos | toju roto |

**No invertir más** en features Sepolia-only salvo lectura/export.

---

## Bloque 2 — Producto mainnet vendible (MVP)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | dApp muestra agente **mainnet** por defecto | ✅ |
| 2 | Telegram → Unit-mainnet (skill Hermes) | ✅ scripts; gateway operador |
| 3 | Página “qué viaja al transferir” | ✅ `dapp/transfer.html` |
| 4 | Vídeo demo 2 min con TBA pagando sola | ⏸ |

---

## Bloque 3 — Mercado (Fase 4 lite)

OpenSea Base, orfanato, trial — **después** de Unit-mainnet E2E.

---

## Descartado / pospuesto

- ❌ Expandir mint VIMS Sepolia
- ❌ Pagar cerebro en Sepolia
- ⏸ ERC-8004 marketplace (Fase 4)
- ⏸ Nostr/Matrix hasta Unit-mainnet estable

---

## Docs clave

| Doc | Uso |
|-----|-----|
| [`mainnet-migration.md`](../research/mainnet-migration.md) | Plan técnico |
| [`organ-assembly-catalog.md`](../research/organ-assembly-catalog.md) | Órganos + sustitutos |
| [`session-20260715-mainnet.md`](session-20260715-mainnet.md) | Resumen sesión |
