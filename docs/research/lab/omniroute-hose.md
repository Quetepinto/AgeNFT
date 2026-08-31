# OmniRoute + modo hose (lab)

> **Estado:** probado VPS · **2026-08-31**  
> No sustituye tx402/TBA en producción.

## URUIRU ≠ Hermesclaw

| | **URUIRU** (ageNFT) | **Hermesclaw** (Hermes VPS) |
|---|---------------------|----------------------------|
| Qué | NFT Unit-Mainnet #1, Gespenster | Asistente personal en el VPS |
| Matrix | Pendiente `@uruiru:bo5bvc.duckdns.org` | `@hermesclaw:bo5bvc.duckdns.org` |
| Telegram | `@Unit1_agent_bot` → tx402/minimax | No cableado al gateway Hermes |
| Lab hose | `npm run hermes:turn:hose` | `~/.hermes/config.yaml` → OmniRoute |

No mezclar canales ni cerebros al probar.

## Qué es “hose”

**Manguera:** el owner conecta un LLM externo (gratis o con su key) al runtime ageNFT. **La TBA no paga.**

| Modo | Quién paga | Uso |
|------|------------|-----|
| **tx402 + TBA** | Cartera del NFT | Producto, Telegram `--pay`, chat-api |
| **hose** | Owner (OmniRoute, Ollama, OpenRouter key) | Lab, pruebas, dev |

## OmniRoute en el VPS

```bash
# Instalación mínima (script: scripts/omniroute/install-vps.sh)
docker run -d --name omniroute --restart unless-stopped \
  -p 127.0.0.1:20128:20128 \
  -v omniroute-data:/app/data \
  diegosouzapw/omniroute:latest
```

1. Túnel: `ssh -L 20128:127.0.0.1:20128 vps-openclaw`
2. Dashboard: http://localhost:20128/dashboard — contraseña admin, **Skip** proveedores si quieres
3. **API Keys** (`/dashboard/api-manager`) → crear key → copiar (solo se muestra una vez)
4. En VPS `~/.hermes/.env`: `HERMES_CUSTOM_OMNIROUTE_API_KEY=sk-…`

Proveedores gratis integrados (`auto/best-free`) funcionan sin conectar cuentas externas.

## ageNFT runtime

```bash
cd ~/projects/ageNFT/runtime
npm run once:hose -- "Hola URUIRU"
npm run hermes:turn:hose -- --plain --quiet "Hola"
```

| Variable | Default |
|----------|---------|
| `AGENFT_HOSE_ENDPOINT` | `http://127.0.0.1:20128` |
| `AGENFT_HOSE_MODEL` | `auto/best-free` |
| `AGENFT_HOSE_API_KEY` | key del dashboard OmniRoute |

Implementación: `runtime/src/brain-hose.mjs`

**Probado 2026-08-31:** `hermes:turn:hose` → OK · `/v1/models` con Bearer key → 479 modelos.

## Hermesclaw → OmniRoute

Script: `scripts/omniroute/wire-hermesclaw.sh` (backup en `~/.hermes/backups/`).

```yaml
model:
  provider: custom:omniroute
  base_url: http://127.0.0.1:20128/v1
  default: auto/best-free
  key_env: HERMES_CUSTOM_OMNIROUTE_API_KEY
```

```bash
systemctl --user restart hermes-gateway.service
```

Restaurar zenmux: `cp ~/.hermes/backups/config.yaml.pre-omniroute-* ~/.hermes/config.yaml`

**Matrix Hermesclaw:** gateway `connected` pero respuesta no verificada end-to-end — pendiente debug (separado de URUIRU).

## Riesgos

- Tiers gratis inestables; ToS de terceros.
- No usar hose en Telegram/chat público si quieres identidad “TBA soberana”.
- No commitear API keys reales.
