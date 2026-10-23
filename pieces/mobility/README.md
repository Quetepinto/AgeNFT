# Pieza `mobility/v0` — TRNXP (City Packs + tablón + plan A→B)

> **Estado:** tablón València/Madrid + **spike plan multimodal** · 2026-10-01  
> Capa: **M3 Capability** + **B Biblioteca**. Doc: [`docs/research/mobility-pieces.md`](../../docs/research/mobility-pieces.md) · spike: [`docs/research/trnxp-trip-spike.md`](../../docs/research/trnxp-trip-spike.md).

Un harness genérico y un pack de datos por ciudad. La ciudad no tiene código propio: declara redes, fuentes, paradas y reglas; el harness enruta y consulta.

```
pieces/mobility/
├── harness/SKILL.md
├── schema/city-pack.schema.json
├── schema/trip-intent.schema.json
├── schema/trip-plan.schema.json
├── tools/mobility.py      # packs · validate · route · board · ask · reply · bot · scan
├── tools/trip.py          # plan A→B (TRNXP spike)
├── trip/                  # IntentParser · geocode · planner · ranker
├── providers/             # osrm · deeplink · otp_proxy (gancho)
└── packs/
    ├── _template/city-pack.json
    ├── valencia-es/          # MetroBus, EMT, C6, Metrovalencia + tripProviders
    └── madrid-es/            # Cercanías (vivo) + Metro/EMT programado
```

## Probar

### Tablón (sin cambios)

```bash
cd pieces/mobility
python3 tools/mobility.py validate valencia-es
python3 tools/mobility.py reply valencia-es "próximo bus suecia"
```

### Plan A→B (spike TRNXP)

```bash
cd pieces/mobility
python3 tools/trip.py plan valencia-es "de Suècia a Estació del Nord lo más rápido"
python3 tools/trip.py plan valencia-es --from "Suècia" --to "Estació del Nord" --criterion fewest_transfers --json
```

MVP: **a pie** (OSRM/OSM) + **PT** vía deep-link honesto a gvEnRuta.  
Cuando: `leaveNow` / `departAt` / `arriveBy` (NL o `--leave-now` / `--depart-at` / `--arrive-by`).  
Sin keys Google. OTP = gancho (`AGENFT_OTP_URL`). Smoke: `python3 tools/trip.py smoke valencia-es`.

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
| Adapters: softour-metrobus, transitapp-bgtfs, radardetrenes, custom | IDs y pitfalls por ciudad | `personal-store.json` (no viaja) |
| Checks + `reply` sin LLM | `favorites[]` de ejemplo, `checks[]`, `incidents` | — |
| `trip.py` IntentParser + Ranker | `tripProviders`, `places` | — |

Añadir ciudad = copiar `_template`, rellenar, `validate`.


Añadir ciudad = copiar `_template`, rellenar, `validate`.

## Relación con el cuerpo ageNFT

- Modo **básico:** `reply` / bot Telegram — cero LLM; `trip.py plan` también cero LLM.
- Modo **pro:** skill Hermes + hose del owner (IntentParser LLM opt-in, off por defecto).
- Capacidad en Unit-Mainnet: `capabilities[{ id: mobility/v0 }]` (esquema v1).

## Fuente València

Arnés `plantillas/camino/` · skills VPS (`board_c6.py`, `emt_board.py`, `metgo_board.py`).
