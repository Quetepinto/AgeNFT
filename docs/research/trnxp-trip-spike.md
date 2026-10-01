# TRNXP trip spike — plan A→B (València)

> **Fecha:** 2026-10-01 · **Marca:** TRNXP · **Repo:** `pieces/mobility/`  
> Decisiones qtp: arrancar ahora; MVP **deep-link** oficial (no OTP en VPS); marca TRNXP en lo tocado.  
> Capa tiempo: `leaveNow` / `departAt` / `arriveBy` (NL ES + flags CLI).

## Qué entrega este spike

| Pieza | Rol |
|-------|-----|
| `tools/trip.py` | CLI `plan` / `parse` / `smoke` |
| `trip/intent_parser.py` | Reglas ES + **when**; LLM **off** |
| `providers/osrm.py` | A pie (OSRM público o `AGENFT_OSRM_URL`) |
| `providers/deeplink.py` | PT → gvEnRuta + params time/date/arriveBy (best-effort) |
| `providers/otp_proxy.py` | Gancho si `AGENFT_OTP_URL` |
| `trip/ranker.py` | `fastest` y `fewest_transfers` |
| Schemas | `trip-intent` / `trip-plan` |

**No toca** `mobility.py reply` (tablón).

## Cómo probar

```bash
cd pieces/mobility

# Smoke offline (parser + URL when)
python3 tools/trip.py smoke valencia-es

# Salir ahora / a una hora / llegar antes de
python3 tools/trip.py plan valencia-es "de Suècia a Nord salir ahora"
python3 tools/trip.py plan valencia-es "de Suècia a Nord salir a las 18:30"
python3 tools/trip.py plan valencia-es "de Suècia a Nord llegar antes de las 20:00"
python3 tools/trip.py plan valencia-es --from "Suècia" --to "Nord" --depart-at 18:30
python3 tools/trip.py plan valencia-es --from "Suècia" --to "Nord" --arrive-by 20:00 --json

# Regresión tablón
python3 tools/mobility.py reply valencia-es "próximo bus suecia"
```

## When → TripIntent

| NL / flag | `when.type` | `iso` |
|-----------|-------------|-------|
| salir ahora · `--leave-now` · (default) | `leaveNow` | null |
| salir a las 18:30 · `--depart-at 18:30` | `departAt` | ISO local (si ya pasó → +1 día) |
| llegar antes de las 20 · `--arrive-by 20:00` | `arriveBy` | ISO local |

## Deep-link: qué puede / no puede

**Puede (TRNXP):**
- Parsear intención horaria y exponerla en `TripIntent.when` + texto del plan.
- Añadir a la URL: `timeType`, `date`, `time`, `arriveBy`, `departNow` (estilo OTP).

**No puede garantizar (gvEnRuta):**
- Que la UI lea esos query params (sin API pública documentada; a veces 503).
- Calcular itinerarios PT ni respetar “llegar antes de” en el arnés (solo deep-link).
- Inventar horarios: si la UI ignora params, el usuario ajusta salida/llegada en el planificador.

| | Deep-link (este spike) | OTP+GTFS (después) |
|--|------------------------|--------------------|
| Piernas PT | Placeholder + URL | Itinerarios reales |
| Hora salida/llegada | Best-effort en URL | Nativo en el grafo |
| Ranking | Walk medido vs “abrir oficial” | `durationSec` / `transfers` reales |

## Gancho OTP

`AGENFT_OTP_URL` + `providers/otp_proxy.py` — parse de piernas = fase siguiente.

## Fuera de spike

Madrid trip, LLM IntentParser, GEV, feeds OSINT, tarifas, cable bot `/tranx plan`.
