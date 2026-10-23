# Probe pago tx402 / x402 — entorno cloud (2026-09-20)

## Resultado

| Check | Cloud agent | Máquina local (MetaMask / VPS) |
|-------|-------------|-------------------------------|
| `viem` en `runtime/node_modules` | ✅ tras `npm install` | según setup |
| `~/.credentials/agenft-base-sepolia.json` | ❌ ausente | requerido (owner key) |
| `VALIDATION_PRIVATE_KEY` / `AGENFT_PAYER_PRIVATE_KEY` | ❌ no inyectados | opcional |
| `npm run budget` | ✅ lee caps del manifiesto | idem |
| Pago real TBA → tx402 | **bloqueado** (`missing_key`) | ejecutar ahí |

## Cómo probar el pago de verdad

En la máquina donde importaste MetaMask (owner `0xeAf1…`):

```bash
# Credenciales owner (nunca en git / nunca en cloud sin vault)
# ~/.credentials/agenft-base-sepolia.json → { "privateKey": "0x…" }

cd /ruta/al/repo
node scripts/onchain/tba-x402-pay.mjs "Confirma en una frase el pago desde la TBA"

# o turn completo con pago
cd runtime && npm run hermes:turn:pay -- --plain --quiet "hola"
```

Salida esperada: `ok: true`, `payerMode` TBA, `usdcBefore`/`usdcAfter` en el report JSON bajo `docs/research/lab/`.

## Política cloud

Este entorno **no** lleva la private key del owner. El probe aquí solo documenta el bloqueo; no inventa hashes de tx.
