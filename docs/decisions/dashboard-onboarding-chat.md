# Decisión — Dashboard: mini-chat guiado y arnés Hermes

> **Estado:** Aprobado · **Fecha:** 2026-09-01  
> Complementa [`owner-dashboard.md`](../research/owner-dashboard.md) · Precedente cableado: [P001](precedents/P001-telegram-handle-transfer.md)

---

## Preguntas que respondemos

| Pregunta | Respuesta corta |
|----------|-----------------|
| ¿Dónde interactuamos con el ageNFT? | **Dashboard** = `settings.html` (guía + ajustes) + `index.html` (ficha + chat completo) |
| ¿Mini-chat inmediato en dashboard? | **Sí** — sección «Probar aquí» en `settings.html` |
| ¿Modelo gratis por defecto o esperar cable? | **Híbrido:** guía estática sin backend → cerebro real cuando hay API + USDC |
| ¿Qué es Hermes (arnés)? | Gateway/cron/skills — **no** el cerebro. Instalación **opcional** para chat básico |
| ¿Hermes obligatorio? | **No** — bot Telegram directo o `chat-api` bastan |

---

## Mapa del dashboard hoy

```
dapp/
├── index.html      ← Ficha pública + chat web (técnico: URL API)
├── settings.html   ← ⚙️ Guía usuario + mini-chat + tesoro + mapa cuerpo
├── lab.html        ← Técnico: wiring (NO confundir con chat usuario)
└── transfer.html   ← Mudanza NFT
```

**Fase producto:** D1 en [`owner-dashboard.md`](../research/owner-dashboard.md) — lectura TBA, budget, órganos + mini-chat.

---

## Mini-chat guiado — arquitectura

### Dos modos (mismo widget)

| Modo | Cuándo | Qué responde |
|------|--------|--------------|
| **Guía estática** | GitHub Pages solo / sin API | Textos fijos + chips («¿Qué cables faltan?») |
| **Cerebro real** | `chat-api` en línea + wiring + USDC | `POST /v1/turn` → `runTurn` → tx402 (mismo que Telegram) |

**No hay un segundo LLM de onboarding.** Un solo cerebro; la guía estática es UI hasta que el cable exista.

### Flujo

```
Usuario abre settings.html
    ↓
Mini-chat monta (onboarding-chat.js)
    ↓
GET /health (si hay URL API en meta o localStorage)
    ├─ OK  → pill «Cerebro en línea» → chips envían a runTurn
    └─ fail → pill «Modo guía» → chips muestran STATIC_GUIDE
    ↓
Fallback visible: enlace Telegram (canal primario móvil)
```

### Archivos

| Archivo | Rol |
|---------|-----|
| `dapp/js/chat-widget.js` | Widget reutilizable |
| `dapp/js/onboarding-chat.js` | Chips + guía estática + fallback |
| `dapp/js/chat.js` | Chat completo en `index.html` (sin cambiar UX) |
| `runtime/src/chat-api.mjs` | API HTTP → runTurn |

### Producción

1. Operador: `npm run chat:api` en VPS + CORS hacia GitHub Pages.
2. Meta `<meta name="agenft-api-url" content="https://…">` — usuarios no pegan URL.
3. Telegram sigue siendo **primario** para no técnicos ([`onboarding-usuario-normal.md`](../research/lab/onboarding-usuario-normal.md)).

---

## Cerebro: ¿gratis, probe o pagado?

| Fase | Requisito | Comportamiento |
|------|-----------|----------------|
| **0 — Guía** | Ninguno | Chips estáticos en dashboard |
| **1 — Probe** | Cerebro cableado, sin USDC | tx402 → 402 «listo pero requiere pago» |
| **2 — Operativo** | TBA con USDC + Reflejos OK | Respuestas reales (Telegram / web) |

**No** prometemos modelo cloud gratis permanente — Reflejos + TBA son el modelo económico.  
**Sí** permitimos empezar sin wallet: guía estática + Telegram si el operador ya fundó la TBA.

Futuro opcional: tier **G** local (modelo pequeño en VPS) solo para onboarding — decisión aparte, no MVP.

---

## Hermes = arnés — aclaración importante (dos significados)

En el repo **«Hermes» aparece en dos sentidos**. Por eso dijimos «arnés opcional» y puede sonar contradictorio.

| | **Motor ageNFT** (imprescindible) | **CLI Hermes de Nous** (opcional) |
|---|-----------------------------------|-------------------------------------|
| **Qué es** | Carpeta `runtime/` de **este repo** | Programa externo [`hermes-agent`](https://github.com/NousResearch/hermes-agent) |
| **Instalación** | `cd runtime && npm install` | Instalar CLI `hermes` + `npm run hermes:install` |
| **Qué hace** | Manifiesto, memoria, Reflejos, tx402, TBA, turnos | Gateway multi-canal, cron en `~/.hermes`, skills |
| **Scripts** | `npm run hermes:turn:pay` → **Node local** (`run-turn.mjs`) | `hermes gateway` → enruta a skills |
| **¿Hace falta?** | **Sí** — sin esto no hay agente | **No** para MVP — ya hay adaptadores propios |

**Tu intuición es correcta:** no queremos construir un agente entero desde cero. **Eso ya está hecho** en `runtime/` — es el motor/arnés del producto ageNFT.

Lo **opcional** es instalar **otro** programa (CLI Nous) encima, cuando quieras su gateway unificado. Hoy Telegram y chat web van **directo** al motor:

```
Telegram  →  telegram-unit-mainnet-bot.mjs  →  run-turn.mjs
Dashboard →  chat-api.mjs                   →  run-turn.mjs
(Hermes CLI → skill agenft-core → hermes:turn:pay → run-turn.mjs)  ← vía alternativa
```

**Resumen en una frase:** ageNFT **sí** usa un arnés (el runtime del repo); **no** obliga a instalar el paquete Hermes de Nous para funcionar.

---

## Hermes = arnés (diagrama)

```
Usuario
   ↓
┌──────────────────────────────────────┐
│  HÁBITAT (Telegram / web / CLI)      │
├──────────────────────────────────────┤
│  ARNÉS Hermes (opcional)             │  ← gateway, cron 15m, skill routing
│  o adaptador directo ageNFT          │  ← telegram-unit-mainnet-bot.mjs
│  o chat-api.mjs                      │  ← dashboard web
├──────────────────────────────────────┤
│  MOTOR runtime (Hermes OSS / Node)   │  ← run-turn.mjs
├──────────────────────────────────────┤
│  CEREBRO tx402 + memoria + Reflejos  │  ← manifiesto + TBA
└──────────────────────────────────────┘
```

### ¿Hay que instalar Hermes?

| Quieres… | Necesitas |
|----------|-----------|
| Chatear por **Telegram** (VPS actual) | `runtime` + npm + token bot — **bot directo**, Hermes CLI no obligatorio |
| **Chat web** en dashboard | `npm run chat:api` — **sin Hermes CLI** |
| Cron **Doctor** vía Hermes | `hermes` CLI (Nous Research) + `npm run hermes:install` |
| Multi-gateway unificado Hermes | Instalación completa arnés + skill `agenft-core` |

```bash
# Mínimo chat (sin arnés Hermes)
cd runtime && npm install
npm run chat:api                    # web
npm run telegram:mainnet:pay        # Telegram

# Arnés Hermes (opcional)
# 1. Instalar CLI: https://github.com/NousResearch/hermes-agent
cd runtime && npm run hermes:install
npm run hermes:verify
```

Skill `agenft-core` fuerza: **nunca LLM genérico de Hermes** — siempre `hermes:turn:pay` → cerebro ageNFT.

---

## Agente que guía el cableado

Cuando el cerebro **está** en línea, puede responder cosas como «te falta token Telegram» porque:

- `runTurn` carga manifiesto + memoria + soul (URUIRU).
- Roadmap: inyectar resumen de `transfer:vigilante` / `organ-status` en contexto del turno (Hygiene).
- Chips del dashboard pueden evolucionar a **acciones** («Ejecutar vigilante» → enlace Lab / instrucción).

Hoy: chips estáticos + cerebro libre si conectado.  
Mañana: turno con snapshot de cables rotos (Vigilante).

---

## Orden de cables (recordatorio)

1. **Runtime** — motor Node en VPS
2. **Cerebro** — tx402 + USDC TBA
3. **Memoria** — local / IPFS (opcional al inicio)
4. **Gateway** — Telegram bot nuevo (P001)
5. **Doctor** — `hermes:doctor` + `transfer:vigilante`

Principio: **menos cables sueltos** — Vigilante grita lo que falta.

---

## Fases implementación dashboard

| Fase | Entregable | Estado |
|------|------------|--------|
| D1a | Mini-chat guía en settings | ✅ |
| D1b | Pill estado cerebro + chips | ✅ |
| D1c | Meta `agenft-api-url` prod | ⏳ operador |
| D2 | Vigilante en contexto del turno | ⏳ |
| D3 | Wizard cableado paso a paso en UI | ⏳ |
| D4 | Wallet owner — fondeo TBA desde UI | ⏳ |

---

## Docs relacionados

- [`owner-dashboard.md`](../research/owner-dashboard.md)
- [`lab/chat-api-wiring.md`](../research/lab/chat-api-wiring.md)
- [`onboarding-usuario-normal.md`](../research/lab/onboarding-usuario-normal.md)
- [`dual-doctor.md`](../research/dual-doctor.md)
- [`runtime/hermes/README.md`](../../runtime/hermes/README.md)
- [`AGENTS.md`](../../AGENTS.md)
