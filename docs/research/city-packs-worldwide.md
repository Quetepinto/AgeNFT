# City Packs mundiales — boceto de fuentes y adaptadores

> **2026-09-20** · Complementa [`mobility-pieces.md`](mobility-pieces.md) · schema [`pieces/mobility/schema/city-pack.schema.json`](../../pieces/mobility/schema/city-pack.schema.json)

Objetivo: cubrir ciudades sin inventar scrapers por país. El harness sigue igual; cada ciudad = pack + adapters reutilizables.

## Capas de dato (prioridad)

| Prioridad | Tipo | Uso | Ejemplos |
|-----------|------|-----|----------|
| 1 | API oficial / GTFS-RT del operador | Tablón vivo | Softour MetroBus, TransitApp bgtfs (EMT VLC) |
| 2 | Agregador público estable | Cuando el oficial bloquea VPS | RadarDeTrenes (Cercanías ES), TransitApp |
| 3 | GTFS estático | Horario programado (nunca fingir vivo) | mobilitydata.org / operadores |
| 4 | RSS/Atom incidencias | Banner en `reply` vía `scan` | Feeds Adif, metros, ayuntamientos |
| 5 | Web HTML | Solo con adapter nombrado | FGV, metros sin API |

## Catálogo de adapters (reutilizar)

| Adapter id | Dominio | Cobertura típica |
|------------|---------|------------------|
| `softour-metrobus` | Softour | Redes Met Go / similares ES |
| `transitapp-bgtfs` | TransitApp | Muchas EMT / buses con feed embebido |
| `radardetrenes` | RadarDeTrenes | Cercanías Renfe (ES) |
| `gtfs-static` | GTFS zip | Cualquier ciudad con GTFS |
| `gtfs-rt` | GTFS-Realtime | Operadores que publiquen protobuf |
| `rss-incidents` | RSS/Atom | Avisos de red genéricos |
| `otp-proxy` (futuro) | OpenTripPlanner público | Enlaces, no clonar Maps |
| `naptan-uk` (futuro) | NaPTAN / BODS | UK buses |
| `gtfs-us-transitland` (futuro) | Transitland / Mobility Database | NA / global index |

## Fuentes índice (descubrimiento, no runtime)

Usar en modo **pro / discovery** para proponer diffs al pack; no hardcodear en el harness:

- [Mobility Database](https://database.mobilitydata.org/) — catálogo GTFS mundial
- [Transitland](https://www.transit.land/) — feeds + operadores
- [OpenMobilityData](https://openmobilitydata.org/) — espejo GTFS
- EU: NAP nacionales (ES: datos.gob / NAP transporte)
- UK: BODS · DE: VDV / DELFI · FR: transport.data.gouv.fr · US: transitfeeds legacy → Mobility Database

## Plantilla de pack nuevo

```text
1. Copiar pieces/mobility/packs/_template → packs/<ciudad>-<cc>
2. Rellenar networks + routing.rules (idioma local en keywords)
3. Preferir live.type ∈ adapters conocidos; si no, scheduled gtfs
4. incidents.sources[] con RSS oficial si existe
5. favorites[] del pack = ejemplos de ciudad (NO datos del owner)
6. python3 tools/mobility.py validate <id> --live
```

Favoritos del usuario → M2 [`tranxp-personal-favorites.md`](tranxp-personal-favorites.md).

## Roadmap de packs (boceto)

| Pack | Prioridad | Adapter inicial |
|------|-----------|-----------------|
| `valencia-es` | ✅ vivo | softour + transitapp + radardetrenes |
| `madrid-es` | ✅ parcial | radardetrenes (+ metro/EMT programado) |
| `barcelona-es` | siguiente ES | GTFS TMB / Radardetrenes Rodalies |
| `lisboa-pt` | Iberia | Carris / Metro Lisboa GTFS |
| `london-gb` | EU big | BODS / TfL unified (API key) |
| `nyc-us` | NA | MTA GTFS-RT |
| `cdmx-mx` | LATAM | GTFS CDMX / RTP |

Orden = demanda + adapter ya existente. No abrir 50 packs vacíos.

## Anti-patrones

- No scrapear apps móviles con TLS pinning.
- No presentar GTFS estático como «próximo en X min» sin `is_real_time`.
- No meter paradas «casa/trabajo» en el City Pack del repo.
- No asumir una ciudad default en bots lite (picker `/ciudad`).
