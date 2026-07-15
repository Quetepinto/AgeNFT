# Notas de diseño — log cronológico

Bitácora de decisiones. Docs temáticos en `docs/research/` y `docs/decisions/`.

---

## 2026-07-15

### Sesión — Mainnet, TBA, fin VIMS lab

**Decisiones:**
- **Base mainnet** = cadena única del producto (`docs/decisions/chain-base-mainnet.md`)
- **VIMS** útil en Sepolia lab; **no** base mainnet → ageNFT Registry propio
- Unit-1 #115 = **legacy**; próximo agente = **Unit-mainnet** mint mainnet
- USDC/x402 **solo mainnet** — no pagar servicios en Sepolia

**Documentado:**
- `docs/research/mainnet-migration.md` — plan Bloques A–D
- `docs/research/vims-vs-agenft-registry.md` — por qué nuestro registro
- `docs/research/organ-assembly-catalog.md` — catálogo órganos (restaurado)
- `docs/research/lab/session-20260715-mainnet.md`
- `docs/research/lab/next-steps.md` — prioridad mainnet
- `docs/research/lab/tba-x402-pay-report.json` — prueba PARTIAL

**Pruebas TBA/x402 (Jul-15):**
- EOA ~0.045 USDC mainnet → pago tx402.ai OK (~$0.000654)
- TBA mainnet: **no contrato** en `0x2FF43…` → no enviar USDC ahí
- Pago soberano desde TBA: pendiente session key / smart wallet

**Catálogo órganos (sesión anterior mismo día):**
- Esencial vs opcional + sustitutos por órgano
- Script auditoría `organ-assembly-audit.mjs` (8/8 esenciales Unit-1 Sepolia)

**Siguiente:** x402 desde TBA (session key) + dApp/Telegram apuntando a Unit-Mainnet

### Sesión — Deploy + mint Unit-Mainnet (Jul-15 noche)

- **AgeNFT** desplegado Base mainnet: `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839`
- **Unit-Mainnet #1** minteado — TBA `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB`
- TBA fondeada: **0.02 USDC** + **0.00015 ETH** (gas futuro on-chain)
- Scripts: `mint-mainnet.mjs`, `fund-tba-mainnet.mjs`, `read-mainnet-agent.mjs`
- Manifiesto: `docs/manifest/examples/unit-mainnet.json`
- Runtime default → token **#1** mainnet

### Spike TBA x402 soberano (Jul-15 noche)

- **Hallazgo:** owner firma digest EIP-712 → TBA valida ERC-1271 (sin session key MVP)
- Runtime `AGENFT_PAYER=auto` → paga desde TBA si hay USDC
- Checklist **8/8** · reporte [`tba-x402-pay-report.json`](lab/tba-x402-pay-report.json)

### MVP producto (Jul-15 noche)

- dApp default Unit-Mainnet + `transfer.html`
- Export `npm run dapp:export` · Hermes `npm run hermes:install`
- Doc: [`lab/mvp-status.md`](lab/mvp-status.md)

### Sesión — Bridge L1→Base (Jul-15 tarde)

- Ethereum L1: ~0.001 ETH (~$1.93) → bridge **0.00065 ETH** a Base ✅
- Base post-bridge: ~0.00053 ETH + ~0.044 USDC (wallet proyecto)
- Scripts: `bridge-to-base.mjs`, `swap-eth-usdc-base.mjs`, `wallet-balances.mjs`
- Manifiesto borrador: `unit-mainnet-draft.json`
- Doc: `lab/bridge-funding-20260715.md`, `addresses.base-mainnet.json`
- Swap Uniswap ⚠️ sin USDC extra (ya había USDC; revisar multicall)

---

## Histórico (resumen pre-15)

Ver backups: `docs/backups/NOTES-20260713-0018.md`

Hitos clave:
- Base confirmada; x402 mainnet para cerebro/storage
- Unit-1 #115 VIMS Sepolia; transfer 7/7
- Hermes + Doctor + Telegram + dApp
- Spike: run-once gana vs Eliza para x402 EOA; gap TBA 6551 ↔ x402

---

## Decisiones abiertas

- [x] Chain producto → **Base mainnet**
- [ ] Spec + deploy ageNFT Registry
- [ ] TBA firma x402 (session key vs AgentAccountV2)
- [ ] ERC-8004 en mint público (Fase 4)

---

## Índice documentación activa

| Doc | Tema |
|-----|------|
| `decisions/chain-base-mainnet.md` | Cadena única |
| `research/mainnet-migration.md` | Plan migración |
| `research/vims-vs-agenft-registry.md` | Sustituto VIMS |
| `research/organ-assembly-catalog.md` | Órganos + servicios |
| `research/lab/next-steps.md` | Prioridad ejecución |
| `backups/*` | Archivo histórico completo |
