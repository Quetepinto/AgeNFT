# Pieza `mobility/v0` — transporte por ciudad (City Packs)

> **Estado:** 📐 diseño + **València + Madrid** · 2026-09-19  
> Capa: **M3 Capability** + **B Biblioteca**. Dualidad: tool en AgeNFT completo **o** Unit lite. Doc: [`docs/research/mobility-pieces.md`](../../docs/research/mobility-pieces.md).

Un harness genérico y un pack de datos por ciudad. La ciudad no tiene código propio: declara redes, fuentes, paradas y reglas; el harness enruta y consulta.

```
pieces/mobility/
├── harness/SKILL.md
├── schema/city-pack.schema.json
├── tools/mobility.py         # packs · validate · route · board · ask · reply · bot · scan
└── packs/
    ├── _template/city-pack.json
    ├── valencia-es/          # MetroBus, EMT, C6, Metrovalencia
    └── madrid-es/            # Cercanías (vivo) + Metro/EMT programado
```

## Probar

```bash
cd pieces/mobility
python3 tools/mobility.py validate valencia-es --live
python3 tools/mobility.py validate madrid-es --live
python3 tools/mobility.py reply valencia-es "próximo bus suecia"
python3 tools/mobility.py reply madrid-es "próximo tren atocha"
python3 tools/mobility.py bot valencia-es
```

`validate --live` ejecuta los `checks[]` del pack contra APIs reales.

## Hábitats (dualidad)

| Empaquetado | Cómo |
|-------------|------|
| **B — lite** | `cd runtime && npm run telegram:tranxp` · `TRANXP_TELEGRAM_BOT_TOKEN` · **sin ciudad por defecto** (`/ciudad`) · hint opcional `TRANXP_CITY_PACK` |
| **A — tool** | Bot URUIRU: `/tranx …` · `capabilities` en manifiesto · primer `packs[]` o `AGENFT_MOBILITY_PACK` |

Helper: [`runtime/src/mobility-reply.mjs`](../../runtime/src/mobility-reply.mjs).  
Favoritos personales (M2): [`runtime/src/tranxp-personal.mjs`](../../runtime/src/tranxp-personal.mjs) · doc [`docs/research/tranxp-personal-favorites.md`](../../docs/research/tranxp-personal-favorites.md).  
Packs globales (boceto): [`docs/research/city-packs-worldwide.md`](../../docs/research/city-packs-worldwide.md).  
Plantilla lite: [`docs/manifest/examples/unit-tranxp-lite.json`](../../docs/manifest/examples/unit-tranxp-lite.json).

## Qué es genérico y qué es del pack

| Harness (igual para todas) | City Pack (datos locales) | M2 personal (owner) |
|---|---|---|
| Confirmar ciudad → red → medio | `routing.rules` → red, parada, línea | Ciudad elegida por chat |
| Vivo ≠ programado | `networks.*.live` / `scheduled[]` | `/fav` casa/trabajo |
| Adapters reutilizables | IDs y pitfalls por ciudad | `personal-store.json` (no viaja) |
| Checks + `reply` sin LLM | `favorites[]` de ejemplo, `checks[]` | — |

Añadir ciudad = copiar `_template`, rellenar, `validate`.

## Relación con el cuerpo ageNFT

- Modo **básico:** `reply` / bot Telegram — cero LLM.
- Modo **pro:** skill Hermes + hose del owner.
- Capacidad en Unit-Mainnet: `capabilities[{ id: mobility/v0 }]` (esquema v1).
- Mint del Unit lite: más adelante; la pieza ya funciona sin NFT.

## Fuente València

Arnés `plantillas/camino/` · skills VPS (`board_c6.py`, `emt_board.py`, `metgo_board.py`).
