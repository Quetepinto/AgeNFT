# Validación práctica — Fase 0

Scripts **exploratorios**, no forman parte del MVP ageNFT. Sirven para resolver dudas antes de fijar arquitectura.

## Requisitos

- Node.js 20+
- Red saliente

## Uso

```bash
cd scripts/validation
npm install
node probe-services.mjs
```

Solo probes sin pago (default):

```bash
node probe-services.mjs --quick
```

Prueba end-to-end con wallet **tuya** (mainnet, céntimos USDC):

```bash
export VALIDATION_PRIVATE_KEY=0x...   # wallet de prueba, NO producción
node probe-services.mjs --pay
```

**No commitear** claves. Usar wallet efímera + faucet manual si hace falta.

## Qué valida

| Probe | Qué confirma |
|-------|----------------|
| Base Sepolia RPC | Chain accesible |
| tx402.ai | HTTP 402 + header x402 |
| toju pricing + 402 | Storage agent-native |
| agent.vims.com | Mint UI live |
| toju staging | Sepolia path (puede fallar) |

Resultados documentados en [`docs/research/validation-results.md`](../../docs/research/validation-results.md).
