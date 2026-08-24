# Companion agent — llevar tu ageNFT a cualquier app (BYOA)

> **Estado:** Idea / visión · **Jul-2026**  
> **Origen:** inspiración producto — humano + agente compartiendo la misma UI.  
> **No implementar hoy** — solo mapa conceptual.

---

## La idea en una frase

El humano entra en **cualquier** web o app (banco, SaaS, juego, marketplace…) **acompañado** de **su** agente (ageNFT), no obligado al asistente genérico del sitio. Ambos comparten contexto de pantalla y tarea — **mano a mano**, no solo agente↔agente en backend.

**BYOA** = *Bring Your Own Agent* — traes tu agente como traes tu wallet.

---

## ¿Es loco? No — piezas sueltas ya existen

Lo que **aún no** existe como estándar unificado es la **“entrada”** clara en cada app para **tu** agente, con identidad portable y reglas de convivencia con el asistente del sitio.

```
Hoy (fragmentado)                    Visión (unificada)
─────────────────                    ──────────────────
Extensión controla browser    →      Slot BYOA en la app
WebMCP: app expone tools      →      + tu agente en el panel
MCP: agente usa herramientas  →      + mismo contexto UI humano
A2A: agente habla con agente  →      + Reflejos / presupuesto TBA
Asistente integrado del SaaS  →      Coexistencia o delegación
```

---

## Dos direcciones técnicas (complementarias)

### A — El agente **ve y actúa** en el browser del humano (lado cliente)

El humano navega con su sesión (cookies, login). El agente **no sustituye** al usuario — **observa y ayuda** (o actúa con permiso explícito).

| Pieza existente | Qué hace |
|-----------------|----------|
| **Real Browser MCP**, Webpage MCP | Extensión Chrome + MCP: agente controla pestaña real con sesión del humano |
| **Chrome DevTools MCP** | Depuración / control protocolo del browser |
| **OpenClaw / Cursor** | Agente en IDE que ya puede usar browser MCP |
| **ageNFT Sentidos** | OCR, visión — leer lo que el humano ve |

**Ventaja:** funciona **sin** que la app coopere.  
**Límite:** frágil (DOM scraping), ToS de sitios, Hygiene (el agente ve PII en pantalla).

### B — La app **abre un slot** para agentes externos (lado host)

La aplicación declara: *“aquí acepto un agente del usuario con estas capacidades”*.

| Pieza existente / emergente | Qué hace |
|----------------------------|----------|
| **WebMCP** (W3C draft, Chrome) | `navigator.modelContext` — la web expone tools estructurados al agente del browser |
| **MCP** (Anthropic) | Tools servidor; backend de la app |
| **MCP Apps** (2026) | Tools que devuelven UI interactiva en el cliente del agente |
| **A2A** (Google) | Agentes hablan entre sí |
| **ERC-8004** | Registro / descubrimiento de agentes onchain |

**Ventaja:** fiable, menos scraping, la app **elige** qué puede hacer un agente externo.  
**Límite:** requiere adopción por desarrolladores de apps.

**ageNFT encaja en A y B:** identidad NFT + manifiesto + TBA como “pasaporte” del agente que se presenta en el slot.

---

## Modelos de convivencia en la misma UI

| Modo | Descripción | Ejemplo |
|------|-------------|---------|
| **Sidecar** | Panel lateral: humano en app, agente comenta/sugiere/resume | Extensión o iframe BYOA |
| **Co-pilot** | Agente rellena borradores; humano confirma clic | Formulario + agente propone |
| **Delegado** | Humano autoriza una acción; agente ejecuta vía WebMCP/tool | “Reserva esto por mí” |
| **Dual assistant** | Asistente del sitio **+** tu ageNFT — negociación o especialización | Sitio: soporte; tuyo: tu memoria/biblioteca |
| **Observador** | Solo lectura de pantalla — consulta, no actúa | Hygiene estricto, rental |

Regla producto ageNFT: **Reflejos** aplican igual — el agente no gasta ni firma sin caps aunque la UI sea de un tercero.

---

## Flujo visionario (humano + ageNFT en app X)

```
1. Humano abre app.example.com (logueado)
2. Clic en “Conectar agente” o extensión detecta ageNFT en wallet
3. App (o extensión) lee agentURI / ERC-8004 → manifiesto
4. Slot BYOA:
   - identidad: URUIRU #1
   - modo: sidecar | copilot | read-only
   - memoria: M2 oculta (solo owner); M3 + biblioteca según política
5. Contexto compartido:
   - WebMCP tools de la app (si existen)
   - o snapshot/OCR de vista (si extensión)
6. Humano y agente resuelven tarea juntos
7. Gastos x402 (si la app cobra API agente): TBA o humano — según voice-external-income
```

---

## Qué existe en el ecosistema general (no solo ageNFT)

| Estándar / producto | Rol en BYOA |
|---------------------|-------------|
| **MCP** | Agente ↔ herramientas (local, servidor, browser) |
| **WebMCP** | Página ↔ agente del browser (tools declarativos) |
| **A2A** | Agente ↔ agente (subtareas, colaboración) |
| **NLWeb** (Microsoft) | Contenido web consultable en lenguaje natural |
| **Browser MCP extensions** | BYOA “sin permiso del sitio” — control del Chrome real |
| **ChatGPT / Claude / Gemini** en apps | Asistente **del proveedor**, no portable ni tuyo |
| **ERC-8004** | Identidad agente onchain — “este es mi agente” |
| **WalletConnect / Sign-In with Ethereum** | Humano identificado; extensión natural a “agente del wallet” |

**Hueco de mercado:** identidad **portable** del agente (memoria, biblioteca, presupuesto, persona) que **sobrevive** al cambiar de app — el NFT como ancla.

---

## Conexión con ageNFT (moat)

| Capacidad ageNFT | Por qué importa en BYOA |
|------------------|-------------------------|
| **NFT + agentURI** | Pasaporte verificable — no un chatbot anónimo |
| **TBA + Reflejos** | El agente paga microusos en apps x402 sin vaciar al humano |
| **M1/M2/M3 + Biblioteca** | Tu agente **recuerda** y **consulta tus docs** en cualquier sitio (con política) |
| **Curación venta/trial** | En BYOA público: mismo filtro rental — sin PII del owner |
| **Doctor Hygiene** | Alerta si el agente ve/filtra PII de pantallas ajenas |
| **Dual assistant** | URUIRU especializado + asistente genérico del SaaS |

**No es solo ageNFT** — es un patrón de industria. ageNFT puede ser **implementación soberana** del agente portable (Web3 + memoria que viaja).

---

## Hábitat nuevo (mapa producto)

Añadir a [`agent-habitats`](../backups/agent-habitats.md) conceptualmente:

| Hábitat | Tier | Descripción |
|---------|------|-------------|
| **Cualquier app web (BYOA slot)** | B → A si adopción | Panel / extensión; humano+agente misma UI |
| **WebMCP-native apps** | B | Apps que declaran tools — ageNFT como cliente |
| **Browser sidecar (extensión)** | A con extensión | Sin coop del sitio; OCR + MCP |

---

## Riesgos y límites (ser realistas)

| Riesgo | Mitigación |
|--------|------------|
| App prohíbe automatización (ToS) | Modo solo lectura; sidecar sin clicks |
| Agente ve passwords/PII en pantalla | Hygiene + no autowrite M2 sin clasificar |
| Confusión: ¿quién habla? | UI clara: avatar URUIRU vs bot del sitio |
| Seguridad: agente malicioso en slot | Allowlist manifiesto; permisos por sesión |
| Sin adopción WebMCP | Camino A (extensión) primero |
| Latencia / coste cerebro | Presupuesto TBA; modo dormant |

---

## Fases si hubiera adopción

| Fase | Enfoque | Dependencia |
|------|---------|-------------|
| **0** | Documentar visión (este doc) | — |
| **1** | ageNFT + browser MCP (OpenClaw/Hermes) — “llevo mi agente yo” | Extensión existente |
| **2** | Sidecar UI propia (panel flotante) + OCR Sentidos | runtime |
| **3** | WebMCP en dApp ageNFT como **referencia** para terceros | Chrome / estándar |
| **4** | Slot BYOA en marketplace / partners | adopción B2B |
| **5** | ERC-8004 + `agentURI` como login de agente en apps | registry |

---

## Preguntas abiertas (para siguientes sesiones inspiradas)

- [ ] ¿Extensión ageNFT propia o integrar Real Browser MCP / Webpage MCP?
- [ ] ¿Protocolo de “sesión BYOA” (JWT + agentId + sale/rental mode)?
- [ ] ¿Widget `<agenft-companion>` embeddable en webs partner?
- [ ] ¿Dual assistant: API para que asistente del sitio delegue en ageNFT vía A2A/x402?
- [ ] ¿Qué memoria puede leer el agente de pantallas de terceros sin violar GDPR?

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`runtime-adapters.md`](runtime-adapters.md) | OpenClaw = host natural para browser MCP |
| [`senses-organ.md`](senses-organ.md) | OCR/visión — leer UI ajena |
| [`memory-layers-access.md`](memory-layers-access.md) | Qué memoria en modo “acompañante” |
| [`voice-external-income.md`](voice-external-income.md) | Quién paga si la app cobra al agente |
| [`dual-doctor.md`](dual-doctor.md) | Hygiene en pantallas ajenas |
| [`../backups/agent-habitats.md`](../backups/agent-habitats.md) | Mapa hábitats |

## Referencias externas (ecosistema)

- [WebMCP — Chrome for Developers](https://developer.chrome.com/docs/ai/webmcp)
- [Real Browser MCP](https://github.com/ofershap/real-browser-mcp) — agente en Chrome real del usuario
- [Webpage MCP](https://github.com/mcpland/webpage-mcp) — extensión + sidepanel agente
- MCP · A2A · MCP Apps — familia protocolos agente (2025–2026)
