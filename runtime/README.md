# ageNFT runtime — Fase 1 (mínimo)

Un turno completo: **manifiesto → preload context/memory → cerebro → autowrite**.

## ¿Necesito USDC?

| Modo | USDC | Comando |
|------|------|---------|
| **Probe (default)** | **No** | `npm run once` — tx402 responde 402, memoria local igual se escribe |
| **Pago real** | **Sí** — Base **mainnet**, centimos | `npm run once:pay` + `VALIDATION_PRIVATE_KEY` |

El pago Fase 1 usa wallet **EOA de prueba**, no la TBA aún (soberanía TBA = Fase 2).

## Setup

```bash
cd runtime
npm install
```

## Presupuesto (Reflejos)

Antes de cada inferencia, el runtime comprueba caps del manifiesto (`budget.organs.brain`, `global.perDayUsdHardCap`).

```bash
npm run budget
npm run once:pay    # registra gasto real (delta USDC wallet)
```

Si supera el límite → **DORMANT** (exit 2). Bypass lab: `--force`.

Ledger: `runtime/data/unit-1/budget/ledger.json`

## Memoria offchain (Fase 2.1)

Tras cada turno la memoria vive en `data/unit-1/memory/`. Sync offchain:

```bash
npm run memory:sync                    # auto: toju → lab-remote si falla
npm run memory:sync -- --provider=lab-remote
npm run memory:restart-test            # simula restart (wipe + hydrate)
npm run once:pay:sync                  # turno + sync memoria
```

Cápsula: `agenft-memory-capsule/v1` en toju/IPFS o `memory-remote/capsule.json` (lab).  
Pointer: `data/unit-1/memory/remote-pointer.json`

> **Nota jul-2026:** toju `/upload/agent` devuelve 402 incluso con `PAYMENT-SIGNATURE` válido (tx402.ai sí funciona). El runtime usa fallback lab-remote hasta que toju corrija el API.

## Uso

```bash
# Sin USDC — valida pipeline + probe tx402
npm run once

# Mensaje custom
AGENFT_USER_MESSAGE="¿Qué es una TBA?" npm run once

# Con pago real (~0.001–0.01 USDC en Base mainnet)
export VALIDATION_PRIVATE_KEY=0x...
npm run once:pay
```

Manifiesto por defecto: `docs/manifest/examples/unit-1-lab.json`

Context pack: `runtime/pack/unit-1/{soul,skills}.md`  
Memoria auto: `runtime/data/unit-1/memory/` (gitignored)

## Flujo

```
ManifestLoader → preload soul/skills + L0/L1
              → inferBrain (tx402 probe o --pay)
              → autowrite delta + latest.json
```

Ver [`docs/architecture/memory-context-strategy.md`](../docs/architecture/memory-context-strategy.md).

## Hermes (Fase 2.4)

Motor gateway + skill `agenft-core`. El cerebro ageNFT **no** es el LLM de Hermes.

```bash
npm run hermes:turn -- "mensaje"      # probe
npm run hermes:turn:pay -- --plain "mensaje"
npm run hermes:doctor
npm run hermes:install   # skill + cron 15m en ~/.hermes
npm run hermes:verify
```

Detalle: [`hermes/README.md`](hermes/README.md)
