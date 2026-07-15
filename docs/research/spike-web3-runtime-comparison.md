# Spike Web3 runtime — Hermes vs ElizaOS vs ageNFT run-once

> **Fecha:** 2026-07-13 · **Agente lab:** Unit-1 #115  
> **Scripts:** `scripts/spike/`  
> **Reports JSON:** `docs/research/lab/spike-*.json`

---

## Objetivo

Comparar en la práctica:

1. **ElizaOS** — `elizaos-plugin-agentwallet` + `agentwallet-sdk`
2. **Hermes** — skills hub Web3 (EVM, MPP, x402 community)
3. **ageNFT run-once** — `@x402/fetch` + manifiesto + Reflejos (path actual)

---

## Resumen ejecutivo

| Track | Resultado | Veredicto |
|-------|-----------|-----------|
| ageNFT runtime baseline (7 tests) | **7/7 ✅** | Production-ready lab |
| `@x402/fetch` head-to-head (path A) | **200 OK**, ~$0.000025 | ✅ Ganador pagos EOA |
| `agentwallet-sdk` (path B) | **402** sin settle | ⚠️ Requiere AgentAccountV2 |
| Eliza plugin surface | 5 actions (balance, transfer, swap, bridge, x402) | ✅ Rico pero otro modelo wallet |
| Hermes EVM skill | Instalado (read-only 8 chains) | ✅ Util, no paga x402 |
| Hermes v0.14.0 vs hub | Sin skill x402/awal oficial local | ⚠️ Upgrade recomendado |
| ERC-8004 en agentwallet-sdk | `ERC8004Client` exportado | ✅ Eliza ventaja identidad |
| TBA Unit-1 + plugin | No mapeo directo 6551→AgentAccountV2 | ❌ Gap arquitectónico |

**Conclusión spike:** Para **Unit-1 hoy**, **ageNFT run-once gana** en x402 EOA. **Eliza gana en breadth Web3** si desplegáis AgentAccountV2 o mapeáis TBA. **Hermes alcanza** tras upgrade + skill x402/MCP, pero no supera a vuestra capa ya escrita.

---

## Tests ejecutados

### 1. ageNFT runtime harness (`spike-agenft-runtime.mjs`)

```bash
cd scripts/spike && node spike-agenft-runtime.mjs
```

| Test | ms | OK |
|------|-----|-----|
| validate-manifest | 78 | ✅ |
| budget | 464 | ✅ |
| budget:runway | 502 | ✅ |
| budget:dormant-test | 188 | ✅ |
| memory:restart-test | 269 | ✅ |
| transfer-checklist dry-run | 1566 | ✅ |
| run-once probe | 494 | ✅ |

Report: [`spike-web3-runtime.json`](lab/spike-web3-runtime.json)

### 2. x402 head-to-head (`spike-x402-headtohead.mjs`)

```bash
cd scripts/spike && node spike-x402-headtohead.mjs
```

| Path | Método | Resultado |
|------|--------|-----------|
| **A** | `@x402/fetch` + viem (mismo que run-once) | HTTP **200**, cost ~$0.000025 |
| **B** | `agentwallet-sdk` createX402Fetch + EOA como "account" | HTTP **402** — no smart wallet |

Report: [`spike-x402-headtohead.json`](lab/spike-x402-headtohead.json)

**Hallazgo crítico Eliza:** `elizaos-plugin-agentwallet` exige `AGENTWALLET_ACCOUNT_ADDRESS` = contrato **AgentAccountV2** con spend policies on-chain. La **TBA ERC-6551** de Unit-1 (`0x2FF43…`) **no es** ese contrato — hay que desplegar/mapear o usar otro adapter.

Plugin actions confirmadas (CJS):

- `WALLET_BALANCE`, `WALLET_TRANSFER`, `WALLET_SWAP`, `WALLET_BRIDGE`, `X402_PAY`

SDK exports Web3:

- `ERC8004Client`, `createX402Fetch`, `createX402Client`, CCTP bridge, spend policies

### 3. Hermes Web3 (`spike-hermes-web3.mjs`)

- Versión local: **v0.14.0** (may 2026) — hub tiene skills más nuevos
- Instalado: `official/blockchain/evm` (read-only wallets/tokens/gas, 8 chains)
- Hub x402: community skills (bankr-x402, spraay…) — no bundled en v0.14
- Hub payments: `official/payments/mpp-agent` (MPP protocol, ≠ x402 USDC Base)
- Upgrade path: `pip install --upgrade hermes-agent` → awal/x402 skills en releases recientes

### 4. Skill Hermes `agenft-core` (lab)

Instalado en: `~/.hermes/skills/agenft/core/SKILL.md`  
Fuente repo: `runtime/pack/unit-1/skills/agenft-core/SKILL.md`

Encadena comandos lab (manifest, budget, memory, transfer checklist).

---

## Matriz decisión post-spike

| Necesidad ageNFT | Mejor fit | Por qué |
|------------------|-----------|---------|
| Pagar tx402.ai **ya** | **run-once** | Probado 200 OK, budget integrado |
| Swap/bridge/multi-chain | **Eliza plugin** | 5 wallet actions + CCTP |
| ERC-8004 register/discover | **Eliza SDK** | `ERC8004Client` listo |
| TBA soberanía (6551) | **ageNFT scripts** | VIMS + transfer checklist |
| Gateway Telegram/cron | **Hermes** | Maduro en v0.14 |
| x402 en Hermes sin código propio | **Hermes upgrade + awal skill** | v0.14 no lo trae |

---

## Recomendación arquitectura (refinada)

```
ageNFT protocol layer (manifiesto, Reflejos, memoria, onchain)  ← mantener
        │
        ├── RuntimeAdapter
        │     ├── HermesAgentAdapter  ← MVP: gateway + cron + agenft-core skill
        │     └── ElizaOSAdapter      ← Fase 5: si queréis plugin-wallet + 8004
        │
        └── Web3 execution
              ├── Fase 2–3: @x402/fetch desde EOA lab → TBA (session key)
              └── Fase 5: evaluar AgentAccountV2 vs TBA 6551 unification
```

**No migrar a Eliza solo por x402** — ya lo tenéis mejor integrado con budget.  
**Sí evaluar Eliza** cuando toque swap/bridge/8004 masivo o multi-chain gaming.

---

## Comandos reproducir mañana

```bash
# Spike completo
cd /home/openclaw/projects/ageNFT/scripts/spike
npm install
node spike-agenft-runtime.mjs
node spike-hermes-web3.mjs
node spike-eliza-wallet.mjs
node spike-x402-headtohead.mjs          # gasta ~$0.00003 USDC
node spike-x402-headtohead.mjs --full   # + run-once CLI (~$0.001)

# Hermes skill lab
hermes skills list | rg -i agenft
```

---

## Pendiente spike fase 2

- [ ] `pip install --upgrade hermes-agent` + probar `official/payments/x402` o awal skill
- [ ] Desplegar AgentAccountV2 testnet y repetir path B
- [ ] ElizaOS full runtime con `@elizaos/core` + plugin (no solo SDK aislado)
- [ ] Mapear TBA 6551 → firma x402 (Fase 2 soberanía)
