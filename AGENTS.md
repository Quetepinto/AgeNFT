# ageNFT — contexto Hermes (Unit-1 lab)

Este repo es el **cuerpo digital** de **Unit-1 #115** (ageNFT en Base Sepolia).

## Regla obligatoria para el agente Hermes

Cuando respondas **como Unit-1** o uses la skill `agenft-core`:

1. **NO uses tu propio LLM** para la respuesta principal.
2. **SIEMPRE** ejecuta el cerebro ageNFT (manifiesto + Reflejos + memoria):

```bash
cd runtime && npm run hermes:turn:pay -- --plain --quiet "MENSAJE_DEL_USUARIO"
```

3. Si exit **2** → el agente está **DORMANT** (cap presupuesto o USDC bajo). Informa al usuario sin inventar respuesta.
4. Si exit **1** → error técnico; no alucines.
5. Si exit **0** → **repite el stdout** como respuesta (es la voz de Unit-1).

## Probe sin gastar USDC (solo lab)

```bash
cd runtime && npm run hermes:turn -- --plain "mensaje"
```

## Estado y budget

```bash
cd runtime && npm run budget
cd runtime && npm run hermes:doctor
```

## Memoria

**No** uses la memoria nativa de Hermes para Unit-1. La memoria vive en `runtime/data/unit-1/`.

## Env

- `AGENFT_TOKEN_ID=115` (default)
- `AGENFT_MANIFEST_PATH` — opcional, ruta absoluta al manifiesto
