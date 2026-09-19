# OmniRoute + modo hose (lab) — histórico

> **2026-09-18:** el doc canónico es [`llm-router-hose.md`](llm-router-hose.md)  
> (`organs.brain.hose.llmRouter`, preset default **freellmapi**).  
> OmniRoute sigue siendo un preset válido (`AGENFT_HOSE_PRESET=omniroute`).

## URUIRU ≠ Hermesclaw

| | **URUIRU** (ageNFT) | **Hermesclaw** (Hermes VPS) |
|---|---------------------|----------------------------|
| Qué | NFT Unit-Mainnet #1, Gespenster | Asistente personal en el VPS |
| Matrix | Pendiente `@uruiru:bo5bvc.duckdns.org` | `@hermesclaw:bo5bvc.duckdns.org` |
| Telegram | `@Unit1_agent_bot` → tx402/minimax | No cableado al gateway Hermes |
| Lab hose | `npm run hermes:turn:hose` → **llmRouter** | `~/.hermes/config.yaml` → FreeLLMAPI / OmniRoute |

No mezclar canales ni cerebros al probar.

## Qué es “hose”

**Manguera:** el owner conecta un LLM externo (gratis o con su key) al runtime ageNFT. **La TBA no paga.** Detalle y presets: [`llm-router-hose.md`](llm-router-hose.md).

## OmniRoute en el VPS (preset `omniroute`)

```bash
# Instalación mínima (script: scripts/omniroute/install-vps.sh)
docker run -d --name omniroute --restart unless-stopped \
  -p 127.0.0.1:20128:20128 \
  -v omniroute-data:/app/data \
  diegosouzapw/omniroute:latest
```

1. Túnel: `ssh -L 20128:127.0.0.1:20128 vps-openclaw`
2. Dashboard: http://localhost:20128/dashboard
3. API Keys → crear key → `HERMES_CUSTOM_OMNIROUTE_API_KEY` en `~/.hermes/.env`

```bash
cd ~/projects/ageNFT/runtime
AGENFT_HOSE_PRESET=omniroute npm run once:hose -- "Hola URUIRU"
```

**Nota 2026-09:** free tiers OmniRoute a menudo 429/403; lab default = FreeLLMAPI (`:3001`, model `auto`).

## Hermesclaw → OmniRoute (opcional)

Script: `scripts/omniroute/wire-hermesclaw.sh` (backup en `~/.hermes/backups/`).  
Perfil actual preferido: FreeLLMAPI — ver Arnés `docs/modelos.md`.

## Riesgos

- Tiers gratis inestables; ToS de terceros.
- No usar hose en Telegram/chat público si quieres identidad “TBA soberana”.
- No commitear API keys reales.
