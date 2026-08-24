# Runtime wiring — Lab Studio → runtime real

> **Estado:** Vivo (v1) · **Jul-2026**  
> Fuente de verdad operativa: **`runtime/wiring/{packId}.json`**

---

## Decisión de producto — panel visual (acordado Jul-2026)

**Sí:** el producto final incluye un **gráfico de configuración** como el Lab Studio (cuerpo humanoide, módulos, cables, colores de madurez). Es el **panel visual del agente** para el owner — no un extra de desarrollo.

**Dos capas distintas** (mismo motor `wiring.json`, distinta UI y permisos):

| Capa | Quién | Para qué | Hoy | Producto |
|------|-------|----------|-----|----------|
| **Construcción** | Dev / Cursor | Cablear código, probar órganos nuevos, inbox, CLI | **Lab Studio** + `lab-bridge` :8799 | Sigue en repo; no es lo que ve el usuario final |
| **Configuración** | Owner del ageNFT | Elegir entre **opciones que ofrecemos** (gateways, memoria, tiers…) | Lab Studio (prototipo) | **Organ Studio / Dashboard** — wallet + su `tokenId` |

El **bridge de lab** (`npm run lab:bridge`) es herramienta **interna de construcción**.  
El **bridge de configuración** del usuario será otro canal (API del Dashboard, autenticado por wallet) que escribe el **mismo** `runtime/wiring/{packId}.json` — o lo equivalente en hosting gestionado.

```
                    ┌─────────────────────────────────────┐
                    │   runtime/wiring/{packId}.json      │
                    │   (ficha de conexiones real)        │
                    └─────────────────────────────────────┘
                           ▲                 ▲
                           │                 │
              Lab + lab-bridge          Dashboard owner
              (construir)               (configurar producto)
              opciones sin filtrar        solo opciones finales
              Cursor / inbox              wallet + Guardar
```

**Reglas producto:**

- Owner **no** necesita Cursor, inbox ni `wiring:apply`.
- Owner **sí** ve el esquema, conecta wallet, edita **su** NFT, pulsa **Guardar**.
- Opciones custom / experimentales → solo capa construcción (Lab).
- El gráfico **no** corre 24/7 — solo la UI al configurar; el **motor** sí puede estar siempre encendido.

Ver también: [`owner-dashboard.md`](../owner-dashboard.md) · [`organ-studio-visual.md`](../organ-studio-visual.md)

---

## Para dummies

| Pieza | Qué es |
|-------|--------|
| **Lab Studio** | El dibujo — propones cambios |
| **wiring JSON** | La ficha de conexiones **real** |
| **wiring-loader** | El runtime **lee** la ficha antes de actuar |
| **lab-bridge** | Buzón dev entre Lab y disco (**construcción** — no producto final) |

---

## Archivo wiring

Ruta: `runtime/wiring/unit-mainnet.json`

Formato: `agenft-wiring/v1`

```json
{
  "type": "agenft-wiring/v1",
  "packId": "unit-mainnet",
  "nodes": [{ "id": "brain", "category": "alive", "option": "tx402", ... }],
  "edges": [{ "from": "runtime", "to": "brain", "category": "alive" }]
}
```

**Sin secretos** — tokens Telegram, keys, etc. van en V0/env, nunca aquí.

---

## Qué obedece el runtime

| Comprobación | Efecto si falla |
|--------------|-----------------|
| `NFT → Motor → Cerebro` cableados | `runTurn` → DORMANT |
| `Motor → Gateway` + gateway vivo | Bot Telegram **no arranca** |
| `Motor → Chat web` | `POST /v1/turn` → 503 |
| `Cerebro → Memoria` + pago | sync memoria automático según opción |
| Categoría **Apagado** | Órgano tratado como desconectado |

Si **no existe** archivo wiring → modo legacy (todo permitido).

---

## Flujo Cursor-first

```
1. Editas en Lab Studio (web) o en Cursor
2. Inbox → .cursor/lab-inbox/wiring-draft.json
3. cd runtime && npm run wiring:apply
4. Runtime lee runtime/wiring/unit-mainnet.json
```

### Comandos

```bash
cd runtime
npm run lab:bridge          # puerto 8799 — buzón + wiring API
npm run wiring:show         # ver wiring activo
npm run wiring:apply        # aplicar wiring-draft.json del inbox
```

### Lab bridge API (127.0.0.1)

| Método | Ruta | Qué hace |
|--------|------|----------|
| POST | `/v1/send` | Inbox markdown + wiring-draft |
| POST | `/v1/wiring` | Guardar draft; `{ apply: true }` aplica al runtime |
| GET | `/v1/wiring?packId=unit-mainnet` | Leer wiring activo |

Token opcional: `AGENFT_LAB_BRIDGE_TOKEN` → header `X-Lab-Token`.

---

## Lab Studio (web)

- Botón **«Aplicar al runtime»** → `POST /v1/wiring` con `apply: true` (requiere `lab:bridge`)
- Indicador **Bridge OK / offline** bajo el esquema
- **Inbox proyecto** → guarda borrador + `wiring-draft.json` (alternativa)
- Si bridge online al cargar → **lee** wiring real y sincroniza el esquema
- Fallback CLI: `npm run wiring:apply`

---

## Opciones memoria → provider runtime

| Lab option | Provider sync |
|------------|---------------|
| `lab-local` | `lab-remote` |
| `toju-ipfs` | `toju` |
| `kubo-ipfs` | `auto` |
| `w3stor-ipfs` | `w3stor` |
| `export-only` | sin sync auto |

---

## Docs relacionados

- [`memory-storage-layers.md`](memory-storage-layers.md) — protocolo vs pin
- [`../.cursor/lab-inbox/README.md`](../../.cursor/lab-inbox/README.md) — inbox
- [`../../runtime/README.md`](../../runtime/README.md) — comandos runtime
