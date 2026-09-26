# Cableado memoria — memoria que viaja

> **Estado:** vivo (kubo lab) · **actualizado 2026-09-26** — transfer sim lab-remote

## Piezas

| Pieza | Ruta |
|-------|------|
| Cápsula | `runtime/src/memory-toju.mjs` → `agenft-memory-capsule/v1` |
| Sync / hydrate | `npm run memory:sync`, `npm run memory:hydrate` |
| Restart test | `npm run memory:restart-test` |
| Transfer simulado | `npm run memory:transfer-sim` (`--policy=full\|reset-total`, `--seed`) |
| Wiring | `runtime/wiring/unit-mainnet.json` → `memory` = `kubo-ipfs` |
| Probes Lab | `organ-status.mjs` → `GET /v1/organs/status?nodeId=memory` |

## Capas (no confundir)

- **IPFS** = protocolo (`ipfs://Qm…`)
- **kubo** = pin self-host (VPS lab)
- **toju** = pin producto (x402 TBA) — API upload pendiente fix
- **lab-local** = disco (`memory-remote/capsule.json`) — mismo servidor, no gateways

## Comandos

```bash
cd runtime

# Lab: pin en kubo local → pointer ipfs://
npm run memory:sync -- --provider=kubo

# Fallback disco (dev)
npm run memory:sync -- --provider=lab-remote

# Auto: toju → kubo → lab-remote
npm run memory:sync

# Borrar local y recuperar desde pointer
npm run memory:restart-test -- --skip-upload

# Transfer simulado (lab-remote, sin USDC / sin onchain)
npm run memory:transfer-sim -- --seed --policy=full
npm run memory:transfer-sim -- --seed --policy=reset-total

# Tras turno con pago + sync (wiring brain→memory)
npm run once:pay:sync
```

## Transfer simulado (Bloque 3.2)

Simula vendedor → comprador offline:

| Política | Comprador recibe |
|----------|------------------|
| `full` | Misma cápsula / mismo `experientialHash` |
| `reset-total` | Cuerpo limpio (hechos vacíos, hash nuevo) |

Vault 0 nunca viaja (`vault0Excluded: true`). **No** sustituye toju primary ni transfer onchain; cierra el hueco de “transfer simulado” en lab.

## E2E esperado (restart-test)

```
experientialHash match: ✅
L0 match: ✅
preload has memory: ✅
✅ RESTART TEST PASSED — memoria sobrevive offchain
```

Si falla hash: la cápsula offchain está vieja → `npm run memory:sync` primero.

## Wiring

```json
{ "id": "memory", "option": "kubo-ipfs", "category": "alive" },
{ "from": "brain", "to": "memory", "category": "alive" }
```

`kubo-ipfs` → provider runtime `kubo`. Post-turno sync automático solo con `--pay` y cable brain→memory.

## VPS Unit-Mainnet (ago-2026)

- `ipfs daemon` activo
- Sync kubo genera CID pinneado localmente + legible vía gateways
- toju upload sigue en fallback hasta fix API
