# TRNXP trip spike — plan A→B (València)

> **Fecha:** 2026-10-01 · **Marca:** TRNXP · **Repo:** `pieces/mobility/`  
> Decisiones qtp: arrancar ahora; MVP **deep-link** oficial (no OTP en VPS); marca TRNXP en lo tocado.

## Qué entrega este spike

| Pieza | Rol |
|-------|-----|
| `tools/trip.py` | CLI `plan` / `parse` |
| `trip/intent_parser.py` | Reglas ES; LLM **off** (`AGENFT_TRIP_LLM` solo gancho) |
| `providers/osrm.py` | A pie (OSRM público o `AGENFT_OSRM_URL`) |
| `providers/deeplink.py` | PT multimodal → URL gvEnRuta / `tripProviders.officialPlannerUrl` |
| `providers/otp_proxy.py` | Gancho si `AGENFT_OTP_URL`; sin parse de itinerarios aún |
| `trip/ranker.py` | `fastest` y `fewest_transfers` (reglas) |
| Schemas | `trip-intent.schema.json`, `trip-plan.schema.json` |

**No toca** el camino crítico de `mobility.py reply` (tablón).

## Cómo probar (3 pasos)

```bash
cd pieces/mobility

# 1) Plan rápido (texto libre)
python3 tools/trip.py plan valencia-es "de Suècia a Estació del Nord lo más rápido"

# 2) Menos transbordos (flags) + JSON
python3 tools/trip.py plan valencia-es --from "Suècia" --to "Estació del Nord" \
  --criterion fewest_transfers --json

# 3) Regresión tablón
python3 tools/mobility.py reply valencia-es "próximo bus suecia"
```

Red: hace falta salida a OSRM demo (`router.project-osrm.org`) para la pierna a pie. Nominatim solo si el lugar no está en `places`/`stops` del pack.

## Deep-link vs OTP (límites honestos)

| | Deep-link (este spike) | OTP+GTFS (después) |
|--|------------------------|--------------------|
| Piernas PT | Placeholder + URL oficial | Itinerarios con tiempos/transbordos reales |
| Ranking | Heurística: walk medido vs “abrir oficial” | Score numérico real (`durationSec`, `transfers`) |
| Horarios | **No** se inventan | Programados / RT según OTP |
| Ops | Cero infra VPS | Self-host OTP + feeds GTFS VLC |
| Riesgo UX | Usuario debe abrir gvEnRuta | Complejidad ops + actualización GTFS |

gvEnRuta **no** expone API pública estable usable desde el arnés → el MVP no finge un proxy. Query params `from`/`to`/coords en la URL son best-effort; si la UI los ignora, la home del planificador sigue siendo el escape honesto.

## Gancho OTP (fase siguiente)

1. Desplegar OTP con GTFS València (Mobility Database / operadores).  
2. `export AGENFT_OTP_URL=https://…`  
3. Completar `providers/otp_proxy.py` para parsear `plan` GraphQL/REST → `ModeOffer.legs`.  
4. Apagar o relegar deep-link a `fallbacks[]`.

## Fuera de spike

Madrid trip, LLM IntentParser, GEV, feeds OSINT, tarifas reales, cable bot `/tranx plan`.
