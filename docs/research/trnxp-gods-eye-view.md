# TRNXP + God's Eye View (GEV) — VPS e wiring

> **Estado:** 📐 diseño · **2026-09-20**  
> Producto movilidad: **TRNXP** (antes TranXp). GEV: [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view).  
> Complementa [`mobility-pieces.md`](mobility-pieces.md) · wiring [`lab/runtime-wiring.md`](lab/runtime-wiring.md).

## Idea

| Pieza | Rol |
|-------|-----|
| **TRNXP** | Tablones / City Pack / `mobility.py reply` — “¿cuánto falta el bus?” |
| **God's Eye View** | Globo 3D + capas live (vuelos, barcos, tráfico, CCTV…) — “dónde estoy / qué hay alrededor” |
| **Iggy** (Hermes) | Modo pro: skill que habla con GEV y/o con el harness TRNXP |

No se sustituyen. GEV es **superficie / sentido geo**; TRNXP es **capacidad mobility/v0**.

```
Owner
  ├── TRNXP bot / /tranx  →  City Pack  →  adapters transporte
  └── GEV (VPS)          →  globo 3D   →  capas OSINT públicas
              ▲
              └── Iggy skill (opt-in): “abre escena”, “resume viewport”, “ruta a pie”
```

## Decisión de producto (2026-09-20)

**GEV no es pieza clave de TRNXP.** Es una **opción visual** opt-in:

| Qué | Dónde |
|-----|--------|
| Transporte (bus/tren/metro) | City Packs — obligatorio para el valor TRNXP |
| OSINT texto (aviones, sismos…) | `geo-feeds` — sin Google |
| Globo 3D, ruta a pie “fly”, capas cinematic | GEV — **solo si el owner pega su API Google** |

El usuario **puede** poner su `GOOGLE_MAPS_API_KEY` (y opcionales) en el Dashboard / host prefs · Vault 0.  
Funciones “centralizadas en la app”: enlace Abrir mapa, share-link a una parada/ciudad, toggles de capas — **no** el cerebro del agente.

Sin clave Google → TRNXP y geo-feeds siguen; el toggle GEV queda deshabilitado o “falta key”.

### Dónde guarda la key (futuro settings)

```
Dashboard → Ajustes → Superficies → God's Eye View
  ☐ Activar mapa GEV
  URL host: https://gev.mi-vps/…
  GOOGLE_MAPS_API_KEY: ••••••   (solo en el host / V0, nunca onchain)
  TomTom (opcional): ••••••
```

Wiring: `presence.gods-eye-view` + prefs en `host-prefs` / env. Misma idea que settings-bridge.

## Instalar GEV en VPS (MVP operador)

Requisitos: Node **24.14+** o 26.x · clave **Google Maps** **solo si activas GEV** · OpenAI solo si quieres voz.

```bash
git clone https://github.com/bilawalsidhu/gods-eye-view.git
cd gods-eye-view
cp .env.example .env   # GOOGLE_MAPS_API_KEY=…  (+ caps de billing en Google)
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

**Seguridad (obligatorio en VPS):**

- No exponer `0.0.0.0` sin reverse proxy + auth: el servidor **brokeriza** las API keys.
- Presupuesto y cuotas en Google (y OpenAI si aplica).
- Throttles `GEV_*` del `.env` + ver `SECURITY.md` del repo GEV.
- Ideal: Caddy/nginx → `https://gev.tu-dominio` solo owner / VPN / basic auth.

Credenciales GEV = **Vault 0 / runtime-only**, nunca en `agentURI` ni wiring.

## Usar con Iggy (Hermes)

Hoy: GEV trae su propio agente de voz (OpenAI Realtime), **no** es un skill Hermes.

Cable AgeNFT previsto (fases):

| Fase | Entregable |
|------|------------|
| **G0** | GEV corre en VPS; owner abre URL a mano |
| **G1** | Skill Iggy `gods-eye` — abre share-link / URL con lat,lon, capas |
| **G2** | Skill lee contexto de escena (si GEV expone API estable) y resume en chat |
| **G3** | TRNXP + GEV: “próximo bus” + pin en mapa / ruta a pie en el globo |

Hasta G1 no hace falta tocar el harness de City Packs.

## Opción de wiring (producto)

Nodo sugerido: **Presencia** (superficie espacial) o, si se separa, órgano `map` futuro.

| Campo | Valor |
|-------|--------|
| `node.id` | `presence` (v0) o `map` (v1) |
| `option` | `gods-eye-view` |
| Cable | `runtime → presence` (opt-in) |
| Secretos | URL base + keys en env del host (`GEV_BASE_URL`, …) |

En Lab Studio ya aparece la opción `gods-eye-view` (experimental). Aplicar wiring **no** despliega GEV solo: el Doctor/probe debe comprobar `GEV_BASE_URL/health` o la home cuando exista probe.

Dashboard settings: toggle “Mapa GEV” + URL del host + campo key Google (V0) — mismo patrón que settings-bridge.

## TomTom — ¿hace falta registrarse?

**Para tráfico “de verdad” dentro de GEV: sí.** Cuenta en [developer.tomtom.com](https://developer.tomtom.com/), API key, cupos de desarrollador (revisar términos actuales).

| Modo | Registro TomTom | Qué ves / qué usa el agente |
|------|-----------------|------------------------------|
| GEV **sin** TomTom | No | Tráfico **simulado / aproximado** (GEV lo etiqueta así) |
| GEV **con** TomTom | Sí | Congestión real en el globo |
| TRNXP / geo-feeds **sin** TomTom | No | No dependemos de TomTom para bus/tren ni para MVP OSINT |

### Alternativas sin registro TomTom

| Necesidad | Alternativa | Notas |
|-----------|-------------|-------|
| Rutas a pie / bici A→B | **OSRM** / Valhalla (OSM), públicos o self-host | Mejor para el **agente** que GEV |
| Geocode | Nominatim | Con User-Agent y cache |
| “¿Hay atasco?” a nivel ciudad | Feeds oficiales / Open data local; o decir “sin dato vivo” | No inventar |
| Tráfico visual real en GEV | TomTom (o no usar esa capa) | Sin key = simulación |

**Recomendación producto:** no exigir TomTom. GEV opcional con Google; TomTom solo si el owner quiere jams reales en el mapa. El agente no debe presentar la simulación keyless como tráfico oficial.

## Relación con feeds “modo agente” (sin Google)

Si el objetivo es que Iggy/TRNXP **obtenga datos** (aviones cerca, sismos, meteo, ISS…), **no uses GEV**.  
Capa prevista: [`trnxp-agent-feeds.md`](trnxp-agent-feeds.md) — adapters públicos → JSON/texto.

GEV solo cuando el owner quiera **ver** el globo 3D (con `GOOGLE_MAPS_API_KEY`).

## Relación con TRNXP lite / mint

- Manifiesto lite: `capabilities[{ id: mobility/v0 }]` sigue siendo el alma TRNXP.
- GEV **no** va en la Biblioteca del City Pack; es órgano de host.
- Al vender el NFT: GEV del vendedor no viaja; el comprador cablea su propia instancia (como Telegram).

## Nombre de producto

- **UI / marca:** `TRNXP`
- **IDs código** (transición): `tranxp`, `telegram:tranxp`, paths `*tranxp*` — renombrar en oleada 2 si molesta
- Alias npm: `telegram:trnxp` → mismo bot

## No hacer

- Meter API keys GEV en el City Pack o en IPFS público.
- Presentar capas GEV (vuelos/AIS) como “próximo EMT”.
- Depender de GEV ni de Google/TomTom para el MVP minteable de TRNXP (sigue siendo bot + packs).
- Tratar el tráfico keyless de GEV como dato oficial de atascos.
