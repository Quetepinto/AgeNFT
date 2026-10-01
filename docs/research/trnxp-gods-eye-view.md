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

## Instalar GEV en VPS (MVP operador)

Requisitos: Node **24.14+** o 26.x · clave **Google Maps** (obligatoria para el planeta 3D) · OpenAI solo si quieres voz.

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

Dashboard settings (futuro): toggle “Mapa GEV” + URL del host (mismo patrón que settings-bridge).

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
- Depender de GEV para el MVP minteable de TRNXP (sigue siendo bot + packs).
