# Pieza `mobility/v0` — transporte por ciudad (City Packs)

> **Estado:** 📐 diseño + **funciona con València** · 2026-09-19  
> Capa: **M3 Capability** (skill que viaja con el NFT) + **B Biblioteca** (packs por ciudad). No toca TBA ni dinero.

Un harness genérico (procedimiento + herramienta) y un pack de datos por ciudad. La ciudad no tiene código propio: declara redes, fuentes, paradas y reglas; el harness enruta y consulta.

```
pieces/mobility/
├── harness/SKILL.md          # procedimiento del agente (Hermes / cualquier runtime)
├── schema/city-pack.schema.json
├── tools/mobility.py         # CLI stdlib: packs · validate · route · board · ask
└── packs/
    ├── _template/city-pack.json
    └── valencia-es/city-pack.json   # MetroBus (Met Go), EMT, C6, Metrovalencia
```

## Probar (València)

```bash
cd pieces/mobility
python3 tools/mobility.py validate valencia-es --live
python3 tools/mobility.py reply valencia-es "próximo bus suecia"
python3 tools/mobility.py ask valencia-es "cuánto falta para el tren en cabanyal"
python3 tools/mobility.py board valencia-es emt 169 81
python3 tools/mobility.py scan valencia-es
python3 tools/mobility.py bot valencia-es   # REPL, sin modelo
```

`validate --live` ejecuta los `checks[]` del pack contra las APIs reales (smoke test = verificador distinto del que redacta el pack).

## Qué es genérico y qué es del pack

| Harness (igual para todas las ciudades) | City Pack (datos locales) |
|---|---|
| Confirmar ciudad → red → medio antes de buscar | `routing.rules`: palabras → red, parada y línea por defecto |
| Vivo vs programado; nunca vender GTFS como tiempo real | `networks.*.live` (adapter) y `scheduled[]` (PDF, GTFS, planner) |
| Adaptadores reutilizables: `softour-metrobus`, `transitapp-bgtfs`, `radardetrenes`, `custom` | Qué adapter usa cada red y con qué IDs |
| Descubrimiento: web oficial → iframe/XHR → agregador → escribir al pack | `discovery` (permiso, política, write-back) y `pitfalls[]` |
| Checks y salida uniforme (`Row`: línea, destino, minutos, hora, ⚡) | `favorites[]`, `checks[]` |

Añadir ciudad = copiar `_template`, rellenar, `validate`. Añadir adapter = una función en `mobility.py` con la misma salida `Row`.

## Relación con el cuerpo ageNFT

- **Hoy:** pieza local. `mobility.py reply` / `bot` es el modo **básico** (cero LLM). El skill Hermes es el modo **pro** (modelo del owner vía hose).
- **Cable futuro (📐, sin tocar schema del manifiesto aún):** referencia tipo `capabilities: [{ "id": "mobility/v0", "packs": ["valencia-es"] }]`, los packs en Biblioteca (IPFS) y el skill en M3. Viaja con el token al vender/transferir.
- **AgeNFT vertical TranXp (nombre provisional):** un Unit cuyo default es el bot de reglas; el cerebro LLM es opt-in. Ver [`docs/research/mobility-pieces.md`](../../docs/research/mobility-pieces.md).

## Fuente de los datos València

Descubierto y verificado en Arnés (`plantillas/camino/docs/04-metgo-api-vivo.md`, `03-enrutado-preguntas.md`) y skills vivos del VPS (`board_c6.py`, `emt_board.py`). El pack es la versión portable de ese conocimiento.
