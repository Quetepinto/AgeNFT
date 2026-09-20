# TRNXP / Iggy — feeds “modo agente” (sin God's Eye View)

> **Estado:** 📐 diseño · **2026-09-20**  
> Decisión: para **información** el agente no necesita el globo GEV ni clave Google.  
> GEV queda opt-in visual: [`trnxp-gods-eye-view.md`](trnxp-gods-eye-view.md).  
> Transporte urbano sigue en City Packs: [`mobility-pieces.md`](mobility-pieces.md).

## Principio

```
Pregunta del usuario
        │
        ├─ movilidad ciudad  →  TRNXP / mobility.py + City Pack
        ├─ contexto geo / OSINT vivo →  feeds modo agente (este doc)
        └─ “quiero ver el mapa 3D” →  GEV (Google key) opcional
```

Misma filosofía que el harness de movilidad: **adapters → JSON/texto**, sin scrapear apps, sin fingir vivo si es estimado.

## Lista corta MVP (v0)

Prioridad = útil + API pública estable + sin Google.

| ID adapter | Qué responde | Fuente | Auth | Notas |
|------------|--------------|--------|------|-------|
| `opensky-nearby` | Aviones cerca de lat/lon o ciudad | [OpenSky](https://opensky-network.org/) | 🟢 anónimo (límites) · 🟡 cuenta | Bounding box; rate-limit agresivo sin cuenta |
| `eq-usgs-recent` | Terremotos recientes (radio / mag) | USGS FDSN / GeoJSON | 🟢 | Buen smoke test de “feed vivo” |
| `sat-tle-iss` | Posición ISS (y opcional catálogo) | CelesTrak TLE | 🟢 | Propagación local (sgp4) o API simple |
| `nominatim-geocode` | Ciudad ↔ lat/lon | OSM Nominatim | 🟢 | **User-Agent** obligatorio; cachear; no martillar |
| `weather-openmeteo` | Tiempo actual / aviso simple | Open-Meteo | 🟢 | Sin key; útil para “¿llueve en la parada?” |

### Fase v1 (cuando v0 demuestre cable)

| ID | Qué | Fuente | Auth |
|----|-----|--------|------|
| `ais-vessels-bbox` | Barcos en caja | AISStream u otro | 🟡 key |
| `traffic-tomtom-flow` | Congestión vial | TomTom | 🟡 |
| `nws-or-aemet-alerts` | Alertas meteo oficiales | NWS / AEMET open | 🟢/🟡 según país |

**Fuera de MVP:** CCTV streams, scrapers de GEV, depender del proceso Vite de GEV.

## Forma de respuesta (contrato)

CLI / skill unificado (borrador):

```bash
# propuesto
python3 pieces/geo-feeds/tools/geo_feeds.py ask opensky-nearby --near "València" --radius-km 40
python3 pieces/geo-feeds/tools/geo_feeds.py ask eq-usgs-recent --near "Tokyo" --mag-min 4.5
```

Salida: texto corto para chat **o** JSON:

```json
{
  "adapter": "opensky-nearby",
  "query": { "near": "València", "radiusKm": 40 },
  "asOf": "2026-09-20T20:30:00Z",
  "live": true,
  "items": [
    { "id": "ICAO…", "callsign": "IBE12AB", "altFt": 32000, "distKm": 12.4 }
  ],
  "disclaimer": "Datos públicos; retardo posible; no uso ATC."
}
```

Reglas: declarar `live` vs estimado; nunca mezclar con tablón EMT/MetroBus.

## Dónde vive en AgeNFT

| Capa | Rol |
|------|-----|
| **Pieza** | `pieces/geo-feeds/` (harness + adapters) — hermano de `pieces/mobility/` |
| **M3** | skill Iggy `geo-feeds` / tool en Unit completo |
| **Wiring** | nodo `senses` opción `geo-feeds` (v0) o nodo `map` futuro |
| **Secretos** | solo keys 🟡 en env del host (`OPENSKY_*`, `AISSTREAM_*`) |
| **GEV** | no requerido; share-link opcional si el owner tiene GEV |

Lab (producto): opción **`geo-feeds`** en Sentidos — “capas OSINT vía adapters, sin globo Google”.

## Cable a Iggy / TRNXP

1. **TRNXP básico** no cambia: bus/tren = City Pack.
2. Si el mensaje huele a avión/sismo/ISS/meteo global → route a `geo-feeds` (keywords o skill pro).
3. Geocode (`nominatim`) solo para resolver “cerca de X”; resultado cacheado en host (no M2 personal salvo que el owner guarde favoritos explícitos).

## Fases

| Fase | Entregable |
|------|------------|
| **F0** | Este doc + opción Lab `geo-feeds` |
| **F1** | Repo `pieces/geo-feeds` + `ask` con `eq-usgs-recent` + `nominatim-geocode` |
| **F2** | `opensky-nearby` + `weather-openmeteo` + skill Hermes mínima |
| **F3** | `/geo` en bot Unit o TRNXP lite; probe Doctor |
| **F4** | Opcional: “abrir en GEV” si `GEV_BASE_URL` configurada |

## No hacer

- Arrancar GEV sin Google “solo para datos”.
- Meter lat/lon de casa del owner en City Packs.
- Presentar OpenSky como tráfico aéreo ATC operativo.

## Docs hermanos

- [`trnxp-gods-eye-view.md`](trnxp-gods-eye-view.md) — vista 3D opt-in  
- [`mobility-pieces.md`](mobility-pieces.md) — transporte ciudad  
- [`city-packs-worldwide.md`](city-packs-worldwide.md) — adapters urbanos  
- [`senses-organ.md`](senses-organ.md) — órgano sentidos  
