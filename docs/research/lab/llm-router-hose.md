# LLM router + modo hose (lab)

> **Estado:** cableado runtime · **2026-09-18**  
> No sustituye tx402/TBA en producción.  
> OmniRoute histórico: [`omniroute-hose.md`](omniroute-hose.md) (redirige aquí).

## Esquema: `llmRouter`

Nombre genérico en el manifiesto (`organs.brain.hose.llmRouter`): un **endpoint OpenAI-compatible** que agrega modelos. El runtime resuelve un **preset** y permite override del owner.

| Campo | Rol |
|-------|-----|
| `preset` | `freellmapi` \| `omniroute` \| `openrouter` \| `ollama` \| `custom` |
| `endpoint` | Base URL (ej. `http://127.0.0.1:3001`) |
| `model` | Alias del router (`auto`, `auto/best-free`, …) |
| `apiKeyEnv` | Nombre de env con la key — **nunca** la key en el manifiesto público |

Schema: `$defs/llmRouter` en [`ageNFT-v1-provisional.schema.json`](../../manifest/ageNFT-v1-provisional.schema.json).  
Implementación: `runtime/src/brain-hose.mjs` → `resolveHoseConfig` / `LLM_ROUTER_PRESETS`.

## Qué es “hose”

**Manguera:** el owner enchufa un LLM externo al runtime ageNFT. **La TBA no paga.**

| Modo | Quién paga | Uso |
|------|------------|-----|
| **tx402 + TBA** | Cartera del NFT | Producto, Telegram `--pay`, chat-api |
| **hose + llmRouter** | Owner (FreeLLMAPI, OmniRoute, Ollama, OpenRouter, custom) | Lab, pruebas, dev |

## Presets por defecto (lab 2026-09)

| Preset | Endpoint | Model | Key env típica |
|--------|----------|-------|----------------|
| **freellmapi** (default) | `http://127.0.0.1:3001` | `auto` | `HERMES_CUSTOM_FREELLMAPI_API_KEY` / `FREELLMAPI_API_KEY` |
| omniroute | `http://127.0.0.1:20128` | `auto/best-free` | `HERMES_CUSTOM_OMNIROUTE_API_KEY` |
| openrouter | `https://openrouter.ai/api` | `openrouter/auto` | `OPENROUTER_API_KEY` |
| ollama | `http://127.0.0.1:11434` | `qwen2.5:3b` | cualquier Bearer |
| custom | (owner) | (owner) | `AGENFT_HOSE_API_KEY` |

**Preferencia lab actual:** FreeLLMAPI — OmniRoute free tiers suelen devolver 429/403.

## Overrides (prioridad alta → baja)

1. `AGENFT_HOSE_ENDPOINT` / `AGENFT_HOSE_MODEL` / `AGENFT_HOSE_API_KEY`
2. `AGENFT_HOSE_PRESET`
3. `AGENFT_HOSE_API_KEY_FILE`
4. Manifiesto `organs.brain.hose.llmRouter`
5. Defaults del preset

## ageNFT runtime

```bash
cd ~/projects/ageNFT/runtime
# default = freellmapi
npm run once:hose -- "Hola URUIRU"

# otro preset
AGENFT_HOSE_PRESET=omniroute npm run once:hose -- "ping"
AGENFT_HOSE_PRESET=ollama AGENFT_HOSE_MODEL=qwen2.5:3b npm run once:hose -- "ping"

npm run hermes:turn:hose -- --plain --quiet "Hola"
```

## FreeLLMAPI en el VPS

Dashboard: `ssh -L 3001:127.0.0.1:3001 vps-openclaw` → http://localhost:3001  

Misma key que Hermes (`HERMES_CUSTOM_FREELLMAPI_API_KEY` en `~/.hermes/.env`). El hose ageNFT la lee como fallback si no hay `AGENFT_HOSE_API_KEY`.

## URUIRU ≠ Hermesclaw

| | **URUIRU** (ageNFT) | **Hermesclaw** (Hermes VPS) |
|---|---------------------|----------------------------|
| Qué | NFT Unit-Mainnet #1 | Asistente personal en el VPS |
| Producto | tx402 + TBA | FreeLLMAPI / OmniRoute vía Hermes |
| Lab hose | `npm run once:hose` + `llmRouter` | `~/.hermes/config.yaml` |

No mezclar canales ni cerebros al probar.

## Riesgos

- Tiers gratis inestables; ToS de terceros.
- No usar hose en Telegram/chat público si quieres identidad “TBA soberana”.
- No commitear API keys reales.
