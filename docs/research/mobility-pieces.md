# Pieza movilidad — harness genérico + City Packs

> **Estado:** 📐 diseño · ✅ **prototipo funcionando con València** · **2026-09-19**  
> **Nombre de producto (provisional):** TranXp · Código: [`pieces/mobility/`](../../pieces/mobility/README.md) · Origen: proyecto Camino (Arnés / Hermes VPS).

## Idea

Un ageNFT que sabe **moverse por una ciudad**: buses, trenes, metro, en vivo cuando hay fuente y programado cuando no. La ciudad se describe en un **City Pack** (JSON); el **harness** (skill + CLI) es igual para todas. Cualquiera rellena el pack de su ciudad; el agente investiga y completa huecos con permiso (`discovery`).

## Por qué encaja en ageNFT

| Capa taxonomía | Pieza |
|---|---|
| **M3 Capability** | skill `mobility-harness` (procedimiento) — viaja y se puede curar al vender |
| **B Biblioteca** | `packs/<ciudad>/city-pack.json` — datos, IDs, pitfalls; exportable a IPFS |
| **Sentidos** (opcional) | adaptadores de tiempo real = percepción del mundo físico |
| **Hábitat** | Telegram/Matrix/dApp: «¿cuánto falta para el 112?» |

No toca TBA, `hands` ni presupuesto más allá del cerebro **cuando el modo pro está apagado**. Es la primera capacidad **útil y sin riesgo económico** para demostrar M3 + Biblioteca viajando con el token.

---

## Dualidad: pieza + Unit lite (decisión 2026-09-19)

**No es un o/u.** TranXp es **una pieza** (`mobility/v0` + City Packs + `reply`/`scan`). Misma implementación, dos empaquetados:

| Empaquetado | Qué es | Cuándo |
|-------------|--------|--------|
| **A — tool** | Capacidad en un AgeNFT completo (URUIRU / Unit-Mainnet): `capabilities` → `mobility/v0`, packs en Biblioteca | El cuerpo genérico ya existe; se enchufa transporte |
| **B — Unit lite** | Unit con canon = movilidad, cerebro off por defecto, mismo harness | Alguien quiere “solo transporte” |

```
pieza única (pieces/mobility/)
        │
        ├── A: AgeNFT completo ── capabilities / M3 + B
        └── B: Unit TranXp lite ── manifiesto plantilla (cerebro off)
```

**Prioridad:** pieza usable en un hábitat **ahora** (sin mint); AgeNFT Bloque 3 en paralelo; cable a URUIRU cuando la pieza demuestre; mint lite / NFT-capacidad solo si hay demanda de transferir.

**Qué no hacer:** dos codebases que diverjan; esperar a Hygiene/Presencia/mercado para preguntar el 112; decidir ya colección ERC-721 aparte vs mismo registry.

### Órganos (lite o tool)

- **Heredar:** identidad/manifiesto, gateways, Dashboard, Doctor (probes pack/adapters), memoria capas, hose opt-in, TBA/Reflejos si hay pro de pago.
- **Pre-cablear en lite:** capacidad fija, cerebro off, cron `scan`.
- **Recortar:** manos/trading, presencia TTS, voz x402 B2B, scout, Organ Studio, BYOA, cross-chain, OTP propio.

Hábitat básico (empaquetado B hoy): `runtime/src/telegram-tranxp-bot.mjs` → `mobility.py reply`. Tool en Unit-Mainnet (empaquetado A): comando `/tranx` o prefijo `tranx` en el bot URUIRU.

---

## Dos modos (decisión 2026-09-19)

TranXp **no necesita un LLM** para el caso de uso diario. El City Pack ya es el programa: reglas de red, paradas, adapters. El «agente» básico es un **bot determinista**.

| Modo | Qué es | Modelo | Cuándo |
|------|--------|--------|--------|
| **Básico (default)** | `mobility.py reply` / `bot` — o un bot Telegram/Matrix que solo llama a eso | Ninguno | Pack relleno a mano; pregunta de tablón («próximo 112», «C6 Cabanyal») |
| **Pro (opt-in)** | Skill Hermes + hose `llmRouter` del owner (FreeLLMAPI, OmniRoute, Ollama, custom…) | El que elija el usuario | Preguntas vagas, descubrimiento de fuentes, varias etapas, escribir diffs al pack |

```
pregunta
   │
   ├─ modo básico ── route(pack) ── board / scheduled ── texto plantilla
   │                      │
   │                      └─ caché incidencias (scan RSS/Atom)
   │
   └─ modo pro ──── mismo harness como herramienta + LLM para enrutar/descubrir
```

**Regla:** si el pack cubre la pregunta, el básico responde. El pro no sustituye al pack: lo usa. Sin pack, el básico dice qué falta; el pro puede investigar (`discovery`) y proponer un diff.

No es un «mini-LLM». Es un bot con instrucciones fijas. Encaja en ageNFT como órgano/capacidad G (gratis, local); el cerebro es E/hose y se enchufa después.

### Hábitat del básico

Mismo contrato HTTP/CLI para Telegram, Matrix o dApp:

```
POST/CLI  reply(pack, texto) → string
```

Un bot de Telegram de 30 líneas que reenvía `reply` ya es TranXp usable. El NFT/manifiesto puede llegar después (Fase 2–3).

---

## Scanner de incidencias

Retrasos **del vehículo** ya salen del tablón vivo (C6 `delayMinutes`, Met Go minutos). Lo que faltaba es el **aviso de red**: huelga, corte, obras, línea caída.

| Capa | Qué | Estado |
|------|-----|--------|
| Pack `incidents.sources[]` | URLs por ciudad (RSS/Atom/web) | ✅ schema + València (web, sin parser HTML) |
| `mobility.py scan` | RSS/Atom → `incidents-cache.json`; web se anota, no se scrapea | ✅ v0 |
| Banner en `reply` | Si la caché tiene < `maxAgeMin` minutos, se antepone al tablón | ✅ |
| Cron | Equivalente al vigilante Camino `transporte-valencia-semanal` | 📐 |
| Parser HTML (FGV, Adif, Met Go home) | Solo con adapter explícito, sin scraping agresivo | 📐 |

**Esbozo que ya existía (Camino):** cron semanal + Adif «estado de la red» en larga distancia + Metrovalencia «publica incidencias; sin adapter». El scanner es esa pieza, portable por City Pack.

**Hermescortes:** no aparece con ese nombre en este repo ni en Arnés/Camino. El candidato vivo es el vigilante `~/.hermes/scripts/transporte_valencia_semanal.py` (VPS) y, si Hermescortes era otro perfil/job de noticias, se declara como una `source` más del pack. Cuando localicemos el esbozo, se engancha aquí, no se reimplementa aparte.

---

## Lo que ya funciona

### València (`valencia-es`)

| Red | Vivo | Fuente |
|---|---|---|
| MetroBus (Met Go) | ✅ | `api.softoursistemas.com/metrobus/estimacion/ocupacion/{stop}` |
| EMT València | ✅ | TransitApp bgtfs (`is_real_time`) |
| Cercanías C6 | ✅ | RadarDeTrenes (retrasos, ~30 s) |
| Metrovalencia | ❌ (programado) | web FGV; candidato a adapter |

### Madrid (`madrid-es`) — prueba de genericidad

| Red | Vivo | Fuente |
|---|---|---|
| Cercanías Madrid | ✅ | Mismo adapter `radardetrenes` (Atocha `18000`, Sol `10200`) |
| Metro Madrid | ❌ (programado) | metro.madrid.es |
| EMT Madrid | ❌ (programado) | emtmadrid.es — **112 aquí es EMT Madrid, no MetroBus València** |

`validate --live` València 3/3 · Madrid ≥1 check cercanías (mismo harness, cero código de ciudad).

## Principios que exporta (aprendidos en Camino)

1. **Red antes que número**: 112 Madrid ≠ 112A València; Suècia es MetroBus aunque haya EMT en la misma calle.
2. **Vivo ≠ programado**: GTFS/PDF nunca se presentan como tiempo real; si no hay vivo, se dice.
3. **Documentación primero**: el conocimiento vive en el pack, no en el chat ni en MEMORY del agente.
4. **Descubrir y devolver**: si el agente encuentra una fuente nueva, la propone al pack (`writeBack: propose-diff`).

## Fases

| Fase | Qué | Estado |
|---|---|---|
| **0** | Harness + pack València + smoke checks | ✅ prototipo |
| **0b** | Bot básico sin modelo (`reply` / `bot`) + scanner RSS | ✅ v0 |
| **1** | Hábitat Telegram → `reply` (`telegram-tranxp-bot.mjs`); segundo pack `madrid-es` | ✅ |
| **1b** | Instalar skill en Hermes (perfil Iggy) como **modo pro**; sustituir el enrutado manual de Camino | 📐 |
| **2** | `capabilities` en manifiesto Unit-Mainnet + `/tranx` en bot URUIRU; packs IPFS / `libraryInclude` al vender | ✅ esbozo manifiesto · 📐 IPFS |
| **3** | Unit vertical TranXp (mint): default = bot reglas; LLM opt-in; dApp con favoritos | 💡 |
| **4** | Enlaces a planificadores oficiales (gvEnRuta, OTP públicos) → **no** clonar Google Maps | 💡 |
| **5** | Mapa/routing propio (OTP self-host, OSM) | ⏸ producto entero, fuera de MVP |

## Qué **no** es

- No es un planificador multimodal ni un mapa. Da tablones y enrutado textual.
- No garantiza cobertura mundial: cada ciudad la cubre quien rellena su pack.
- No hace scraping agresivo: consultas bajo demanda, APIs que la propia web oficial expone o agregadores públicos.

## Preguntas abiertas

- Formato de **write-back** cuando el agente (modo pro) descubre una fuente: PR al repo del pack vs. `notes` firmadas en la Biblioteca.
- **Licencia de datos** por pack (fuentes oficiales vs agregadores; declararla en el pack).
- Cómo declarar en el manifiesto una capacidad con datos externos sin romper `additionalProperties: false`.
- Dónde vive Hermescortes / el job de noticias exacto del VPS, para copiar selectores y no inventar parsers.
- Matrix como segundo hábitat del bot básico (Telegram TranXp + `/tranx` en URUIRU ya cubren A/B).

## Docs hermanos

- Taxonomía: [`pieces-taxonomy.md`](pieces-taxonomy.md) § M3 / Biblioteca
- Memoria por capas: [`memory-layers-access.md`](memory-layers-access.md) · Biblioteca: [`library-storage-policy.md`](library-storage-policy.md)
- Favoritos personales M2: [`tranxp-personal-favorites.md`](tranxp-personal-favorites.md)
- Packs mundiales (boceto): [`city-packs-worldwide.md`](city-packs-worldwide.md)
- Patrón hermano: [`trading-pieces.md`](trading-pieces.md)
- Origen operativo: Arnés `plantillas/camino/` · `recetas/transporte.md`
