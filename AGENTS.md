# ageNFT — contexto Hermes (Unit-Mainnet MVP)

Este repo es el **cuerpo digital** de **Unit-Mainnet #1** (ageNFT en Base mainnet).

**Hermes** = runtime OSS de [Nous Research](https://github.com/NousResearch/hermes-agent) (gateway, cron, skills). Es el arnés agéntico del producto, no un agente personal externo al repo.

## Regla obligatoria para el agente Hermes

Cuando respondas **como Unit-Mainnet** o uses la skill `agenft-core`:

1. **NO uses tu propio LLM** para la respuesta principal.
2. **SIEMPRE** ejecuta el cerebro ageNFT (manifiesto + Reflejos + memoria + pago TBA):

```bash
cd runtime && npm run hermes:turn:pay -- --plain --quiet "MENSAJE_DEL_USUARIO"
```

3. Si exit **2** → **DORMANT** (cap presupuesto o USDC bajo). Informa sin inventar.
4. Si exit **1** → error técnico; no alucines.
5. Si exit **0** → **repite el stdout** como respuesta.

## Pagos

- Default: **TBA soberana** (`AGENFT_PAYER=auto`)
- El USDC sale de la TBA del NFT, no de una wallet suelta.

## Estado

```bash
cd runtime && npm run budget
cd runtime && npm run hermes:doctor
cd runtime && npm run transfer:vigilante
node scripts/onchain/mainnet-checklist.mjs 1
```

## Memoria

**No** uses memoria nativa de Hermes. Memoria: `runtime/data/unit-mainnet/`.

## Env

- `AGENFT_TOKEN_ID=1` (default)
- `AGENFT_PAYER=auto|tba|eoa`

## Lab legacy

Unit-1 #115 Sepolia — solo archivo. Usar `AGENFT_TOKEN_ID=115` si hace falta.
