# Hermes ↔ ageNFT (Unit-1)

Integración Fase 2.4: Hermes usa el **cerebro ageNFT** (manifiesto + Reflejos + memoria), no el LLM genérico.

## Arquitectura

```
Usuario (Telegram/Matrix/CLI)
        │
        ▼
   Hermes gateway
        │
        ├── skill agenft-core  →  npm run hermes:turn:pay
        │
        └── cron 15m           →  npm run hermes:doctor
                │
                ▼
        run-turn.mjs
        ├── ManifestLoader
        ├── BudgetTracker (Reflejos)
        ├── memory preload/autowrite
        └── brain-tx402 (x402.ai)
```

## Comandos

```bash
cd runtime

# Turno (JSON)
npm run hermes:turn -- "¿Quién eres?"

# Turno pagado (respuesta plain para gateway)
npm run hermes:turn:pay -- --plain "hola"

# Doctor (silent si healthy — para cron)
npm run hermes:doctor

# Instalar skill + scripts + cron en ~/.hermes
npm run hermes:install

# Verificar integración
npm run hermes:verify
```

## Variables de entorno

| Variable | Default | Uso |
|----------|---------|-----|
| `AGENFT_TOKEN_ID` | `115` | Selecciona manifiesto lab |
| `AGENFT_MANIFEST_PATH` | auto | Override ruta manifiesto |
| `AGENFT_USER_MESSAGE` | — | Mensaje en hermes-turn |
| `VALIDATION_PRIVATE_KEY` | — | Pago x402 (--pay) |

## Cron Doctor

Tras `npm run hermes:install`:

- Job: `agenft-unit1-doctor`
- Schedule: `every 15m`
- Mode: `--no-agent` (sin LLM)
- Log: `runtime/data/unit-1/doctor/latest-probe.json`
- Alerta solo si `impaired` o `dormant`

## Gateway Telegram (siguiente paso)

1. Configurar bot en `hermes gateway setup`
2. Activar skill `agenft-core` en el perfil del gateway
3. Workdir: `/home/openclaw/projects/ageNFT` (lee `AGENTS.md`)

Ver [`chat-habitats-messaging.md`](../../docs/research/chat-habitats-messaging.md).
