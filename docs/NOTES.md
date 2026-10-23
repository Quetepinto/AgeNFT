# Notas de diseño — log cronológico

Bitácora de decisiones. Docs temáticos en `docs/research/` y `docs/decisions/`.  
**Mapa de piezas:** [`research/pieces-taxonomy.md`](research/pieces-taxonomy.md) · índice: [`research/design-index-20260716.md`](research/design-index-20260716.md).  
**Inbox Krallo (preguntas en chat):** [`inbox-krallo.md`](inbox-krallo.md).

---

## 2026-09-20

### TRNXP (rename) + God's Eye View

- Marca producto: **TRNXP** (antes TranXp). IDs código `tranxp*` se mantienen en transición; alias `npm run telegram:trnxp`.
- Diseño GEV en VPS + wiring `presence.gods-eye-view` + skill Iggy por fases: [`research/trnxp-gods-eye-view.md`](research/trnxp-gods-eye-view.md).
- Lab: opción `gods-eye-view` en Presencia.

---

## 2026-09-19

### TRNXP — dualidad pieza + Unit lite (implementado)

- Docs: dualidad en [`research/mobility-pieces.md`](research/mobility-pieces.md); taxonomía actualizada.
- Hábitat B: `runtime/src/telegram-tranxp-bot.mjs` (`npm run telegram:tranxp`) → `mobility.py reply`.
- Hábitat A: `/tranx` en bot Unit-Mainnet + `capabilities` en `unit-mainnet.json`.
- Segundo pack `madrid-es` (Cercanías vivo vía mismo `radardetrenes`).
- Plantilla pre-mint: `docs/manifest/examples/unit-tranxp-lite.json`.
- Schema: campo `capabilities[]`.

### TRNXP — bot básico sin modelo + scanner de incidencias

- **Sí es posible** el mini-agente sin IA: no es un LLM pequeño, es un bot de reglas (`mobility.py reply` / `bot`) sobre el City Pack.
- Modo **pro** opcional = skill Hermes + hose `llmRouter` del owner (descubrimiento, preguntas vagas). Default = básico.
- Scanner de avisos de red: `incidents.sources` en el pack + `scan` (RSS/Atom a caché; web sin scrapear HTML). Banner en `reply` si la caché está fresca.
- Esbozo Camino: vigilante `transporte-valencia-semanal` + Adif/FGV. **Hermescortes** no está en este repo con ese nombre; se engancha como `source` cuando aparezca.
- Siguiente: hábitat (Telegram/Matrix) con pack fijo, no mintear el Unit todavía.

### Pieza movilidad — harness + City Packs (prototipo València)

- Nueva pieza `pieces/mobility/`: skill genérico `mobility-harness` + `tools/mobility.py` (stdlib) + `schema/city-pack.schema.json`.
- Pack `valencia-es`: MetroBus (API Met Go descubierta en el iframe de metgovalencia.com), EMT (TransitApp), C6 (RadarDeTrenes), Metrovalencia (programado). `validate --live` 3/3.
- Capa: **M3 Capability + B Biblioteca**. Sin cable a manifiesto ni TBA todavía.
- Doc: [`research/mobility-pieces.md`](research/mobility-pieces.md) · taxonomía actualizada.
- Origen: proyecto Camino (Arnés `plantillas/camino/`, Hermes VPS).

---

## 2026-09-18

### Piezas trading → AgeNFT (sin cablear TBA)

- Dashboard de estrategias (Mint) = pieza `trading-strategies/v1`: política futura de `hands`.
- Visor dragón = pieza `dragon-liquidity/v0`: liquidez como alimento; feed **sintético**.
- Independientes: se enchufan juntas o por separado cuando el cuerpo esté listo.
- Economía autosustentable: sigue bloque 7.7 **off** hasta opt-in humana.
- Doc: [`research/trading-pieces.md`](research/trading-pieces.md) · taxonomía actualizada.

### LLM router (hose) — FreeLLMAPI default

- Esquema: `$defs/llmRouter` + `organs.brain.hose.llmRouter` (presets `freellmapi` | `omniroute` | `openrouter` | `ollama` | `custom`)
- Runtime: `brain-hose.mjs` → `resolveHoseConfig` / `LLM_ROUTER_PRESETS`; default lab **FreeLLMAPI** `:3001` / `auto`
- Docs: [`lab/llm-router-hose.md`](research/lab/llm-router-hose.md) · OmniRoute histórico redirige desde [`omniroute-hose.md`](research/lab/omniroute-hose.md)
- Ejemplos: `unit-mainnet.json`, `unit-1-lab.json` · Lab Studio opción `llm-router`

---

## 2026-08-31

### Bloque 3.1–3.2 cableado + hose lab (VPS)

**URUIRU (ageNFT #1)** — distinto de **Hermesclaw** (asistente Matrix en `~/.hermes/`):

| Agente | Canal | Cerebro |
|--------|-------|---------|
| **URUIRU** | Telegram `@Unit1_agent_bot`, dApp chat-api | tx402 + TBA → minimax (producto) |
| **Hermesclaw** | Matrix `@hermesclaw:…` | OmniRoute lab (`auto/best-free`) — perfil Hermes, no ageNFT |

**En vivo (VPS):**

- Chat web: Caddy `https://bo5bvc.duckdns.org/agenft-api` → `agenft-chat-api.service` · wiring `chatweb=alive`
- Memoria: `kubo-ipfs` · `memory:sync --provider=kubo` + `memory:restart-test` PASSED · doc [`lab/memory-wiring.md`](research/lab/memory-wiring.md)
- **Hose:** `brain-hose.mjs` + `once:hose` / `hermes:turn:hose` · OmniRoute Docker `:20128` · doc [`lab/omniroute-hose.md`](research/lab/omniroute-hose.md)
- Telegram URUIRU: `AGENFT_TELEGRAM_DISPLAY_NAME`, `setMyName` al arrancar bot
- Pendientes: Matrix `@uruiru:…` (bot ageNFT, no Hermesclaw) · arreglar respuesta Hermesclaw Matrix — [`inbox-krallo.md`](inbox-krallo.md)

**Backup Caddy:** [`backups/caddyfile-20260831-pre-agenft-api.txt`](backups/caddyfile-20260831-pre-agenft-api.txt)

---

- Inbox: qué se edita on-chain post-mint (casi nada; transfer + TBA sí). Tester/auditor Cursor estilo arnés **no** está; Hygiene es diseño ⏸. Detalle: [`inbox-krallo.md`](inbox-krallo.md).

---

## 2026-07-16

### Sentidos — ageNFT escucha y ve

**Decisión:** Un ageNFT no es solo texto + voz de salida. Necesita **órgano Sentidos** (entrada):

- **Oídos (STT):** transcribir voz del humano (notas Telegram, mic web)
- **Traductor:** normalizar idioma antes del cerebro
- **Ojos (visión):** analizar imágenes (escena, contexto)
- **OCR:** extraer texto plano de fotos (carteles, documentos)

**Documentado:** `docs/research/senses-organ.md` · **Bloque 5** en roadmap · fila en catálogo órganos.

**Simetría:** Presencia = habla + cara (TTS, URUIRU). Sentidos = escucha + lectura visual.

**Roadmap:** Sentidos = **Bloque 5**. Presencia = **Bloque 4 opcional** (orden 4→5→7). Núcleo **1→2→6→3→7**. Ver [`lab/next-steps.md`](lab/next-steps.md).

**Dashboard:** configuración owner — [`owner-dashboard.md`](owner-dashboard.md); ⚙️ accesible desde todo hábitat.

### Roadmap, Presencia opcional y Dashboard

**Orden Bloque 3:** 1 → 2 → 6 → 3 → 7 (cablear → memoria → fallbacks → estética → checklist).

**Orden Presencia (Bloque 4, opcional):** 4 → 5 → 7 (TTS → boca → lip-sync ML).

**Dashboard:** transversal desde paso 1 — [`owner-dashboard.md`](owner-dashboard.md).

### Aclaraciones producto (2026-07-16 tarde)

**Pagador x402:** solo **externos** — el owner fondea TBA (gasto), no se paga a sí mismo. Doc: [`voice-external-income.md`](voice-external-income.md).

**Tiers por órgano:** G (gratis default) → D (x402, Akash, descentralizado) → E (SaaS fácil, opt-in). Doc: [`organ-service-tiers.md`](organ-service-tiers.md).

**Dos Doctores:** Vitality (Qi — órganos vivos, TBA, conexiones) + Hygiene (seguridad, fugas, CVE). Doc: [`dual-doctor.md`](dual-doctor.md).

**Índice ordenado:** [`design-index-20260716.md`](design-index-20260716.md).

### Memoria — capas, alquiler, trial (tarde)

- **PII** = datos personales identificables (nombre, email, etc.).
- Capas: V0 vault · M1 canon · M2 personal · M3 capability (aprendido, no personal).
- Clasificar **al aprender**, no solo al transferir.
- Alquiler: quitar M2/V0; mantener M3 (con bloqueos opcionales).
- **Curación M3:** excluir capacidades concretas al vender (ej. skills “sospechosas”); allowlist en `saleConfigHash`.
- **Biblioteca (B):** docs de consulta opcionales — IPFS con NFT vs local/nube owner; separada en trial (`libraryHash`).
- **Biblioteca ≠ Karpathy:** índice + blobs; no árbol de `.md` que el LLM mantenga (drift).
- Trial → compra: `saleConfigHash` onchain; lo probado = lo comprado.
- Doc: [`memory-layers-access.md`](memory-layers-access.md) · [`library-storage-policy.md`](library-storage-policy.md).

### Runtime — Hermes vs OpenClaw vs ElizaOS

- **Un solo tipo de ageNFT** — el motor no define otro contrato; campo `runtime.engine` en manifiesto.
- **MVP:** Hermes + `run-turn.mjs` (Telegram, Doctor, skill `agenft-core`, TBA x402 ✅).
- **OpenClaw:** segundo adapter recomendado (workspace/Cursor); llama al mismo `runTurn()` — no reimplementar protocolo. **2.0 (2026.8.1) anotado 2026-09-07 como opción** — skill delgado, no `AgentHarnessV2`; no sustituye Hermes; no implementar aún.
- **ElizaOS:** Fase 5 opcional — swap/bridge/ERC-8004; spike: gap TBA 6551 ↔ AgentAccountV2; **no** migrar solo por x402.
- Elección en mint wizard o post-transfer; trial vende manifiesto/memoria/biblioteca, no el laptop del vendedor.
- Doc: [`runtime-adapters.md`](runtime-adapters.md).

### Companion BYOA — llevar tu agente a cualquier app

- Humano usa web/app **acompañado** de su ageNFT — misma UI, mano a mano (no solo A2A backend).
- **Ya existe (parcial):** browser MCP extensions, WebMCP (W3C/Chrome), MCP, A2A, asistentes embebidos SaaS.
- **Hueco:** slot estándar “trae tu agente” + identidad portable (memoria, biblioteca, TBA, Reflejos).
- Dos vías: **A)** extensión ve/actúa en browser del humano · **B)** app abre entrada WebMCP/BYOA.
- Modos: sidecar, co-pilot, dual assistant (sitio + URUIRU), observador solo lectura.
- ageNFT como pasaporte: `agentURI`, ERC-8004, políticas M2/Biblioteca en rental.
- Fase 1 realista sin adopción masiva: extensión + OpenClaw; WebMCP cuando madure.
- Doc: [`companion-agent-byoa.md`](companion-agent-byoa.md).

### Taxonomía — clasificar sin implementar

- Creado [`pieces-taxonomy.md`](research/pieces-taxonomy.md) — mapa completo: onchain, órganos, memoria/B, runtime, hábitats, protocolos, economía, BYOA.
- Estados: ✅ MVP · 📐 diseño · 💡 idea · ⏸ postergado · 🔗 externo.
- Regla: inspiración → clasificar → decidir después qué sirve.

### Organ Studio + migración cross-chain (noche 16-jul)

- **Organ Studio:** entorno visual plug&play — nodos órganos, cables, salud Qi; complementa Dashboard (formularios). Inspiración: Node-RED, React Flow; hueco: cuerpo NFT completo. Doc: [`organ-studio-visual.md`](research/organ-studio-visual.md).
- **Cross-chain:** lock native + mint mirror; memoria/biblioteca IPFS; `chainOverlays` adaptan TBA, gas, cerebro; wizard + Doctor transplante. Existe lock/mint NFT genérico (deBridge, CCIP); no migración de órganos agente. Doc: [`cross-chain-agent-migration.md`](research/cross-chain-agent-migration.md).

---

### Cableado + transfer + vídeo

- Chat web: `chat-api.mjs` + UI dApp — [`lab/chat-api-wiring.md`](lab/chat-api-wiring.md).
- Local vs hospedado al transferir: [`transfer-local-hosting.md`](transfer-local-hosting.md).
- Vídeo G Bascunana: [`video-notes-gbascunana-20260716.md`](video-notes-gbascunana-20260716.md).

### Bloque 4 Presencia (recordatorio)

---
- Owner activa/desactiva en Dashboard
- Auto-OFF: USDC bajo, caps, hábitat, DORMANT

**Bloque 5 = Sentidos** — separado de Presencia.

**Dashboard:** panel canonical en dApp `/settings`; botón ⚙️ en ≤2 clics desde web, Telegram (`/ajustes` → link), embed…

**Docs nuevos:** `presence-optional.md`, `owner-dashboard.md`; `next-steps.md` reestructurado.

---

## 2026-07-15

### Sesión — Mainnet, TBA, fin VIMS lab

**Decisiones:**
- **Base mainnet** = cadena única del producto (`docs/decisions/chain-base-mainnet.md`)
- **VIMS** útil en Sepolia lab; **no** base mainnet → ageNFT Registry propio
- Unit-1 #115 = **legacy**; próximo agente = **Unit-mainnet** mint mainnet
- USDC/x402 **solo mainnet** — no pagar servicios en Sepolia

**Documentado:**
- `docs/research/mainnet-migration.md` — plan Bloques A–D
- `docs/research/vims-vs-agenft-registry.md` — por qué nuestro registro
- `docs/research/organ-assembly-catalog.md` — catálogo órganos (restaurado)
- `docs/research/lab/session-20260715-mainnet.md`
- `docs/research/lab/next-steps.md` — prioridad mainnet
- `docs/research/lab/tba-x402-pay-report.json` — prueba PARTIAL

**Pruebas TBA/x402 (Jul-15):**
- EOA ~0.045 USDC mainnet → pago tx402.ai OK (~$0.000654)
- TBA mainnet: **no contrato** en `0x2FF43…` → no enviar USDC ahí
- Pago soberano desde TBA: pendiente session key / smart wallet

**Catálogo órganos (sesión anterior mismo día):**
- Esencial vs opcional + sustitutos por órgano
- Script auditoría `organ-assembly-audit.mjs` (8/8 esenciales Unit-1 Sepolia)

**Siguiente:** x402 desde TBA (session key) + dApp/Telegram apuntando a Unit-Mainnet

### Sesión — Deploy + mint Unit-Mainnet (Jul-15 noche)

- **AgeNFT** desplegado Base mainnet: `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839`
- **Unit-Mainnet #1** minteado — TBA `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB`
- TBA fondeada: **0.02 USDC** + **0.00015 ETH** (gas futuro on-chain)
- Scripts: `mint-mainnet.mjs`, `fund-tba-mainnet.mjs`, `read-mainnet-agent.mjs`
- Manifiesto: `docs/manifest/examples/unit-mainnet.json`
- Runtime default → token **#1** mainnet

### Spike TBA x402 soberano (Jul-15 noche)

- **Hallazgo:** owner firma digest EIP-712 → TBA valida ERC-1271 (sin session key MVP)
- Runtime `AGENFT_PAYER=auto` → paga desde TBA si hay USDC
- Checklist **8/8** · reporte [`tba-x402-pay-report.json`](lab/tba-x402-pay-report.json)

### MVP producto (Jul-15 noche)

- dApp default Unit-Mainnet + `transfer.html`
- Export `npm run dapp:export` · Hermes `npm run hermes:install`
- Doc: [`lab/mvp-status.md`](lab/mvp-status.md)

### Sesión — Bridge L1→Base (Jul-15 tarde)

- Ethereum L1: ~0.001 ETH (~$1.93) → bridge **0.00065 ETH** a Base ✅
- Base post-bridge: ~0.00053 ETH + ~0.044 USDC (wallet proyecto)
- Scripts: `bridge-to-base.mjs`, `swap-eth-usdc-base.mjs`, `wallet-balances.mjs`
- Manifiesto borrador: `unit-mainnet-draft.json`
- Doc: `lab/bridge-funding-20260715.md`, `addresses.base-mainnet.json`
- Swap Uniswap ⚠️ sin USDC extra (ya había USDC; revisar multicall)

---

## Histórico (resumen pre-15)

Ver backups: `docs/backups/NOTES-20260713-0018.md`

Hitos clave:
- Base confirmada; x402 mainnet para cerebro/storage
- Unit-1 #115 VIMS Sepolia; transfer 7/7
- Hermes + Doctor + Telegram + dApp
- Spike: run-once gana vs Eliza para x402 EOA; gap TBA 6551 ↔ x402

---

## Decisiones abiertas

- [x] Chain producto → **Base mainnet**
- [ ] Spec + deploy ageNFT Registry
- [ ] TBA firma x402 (session key vs AgentAccountV2)
- [ ] OpenClaw adapter (skill → run-turn) — post-MVP · 2.0 anotado como opción 2026-09-07 (no AgentHarnessV2)
- [ ] ElizaOS adapter — Fase 5 (swap/8004)
- [ ] ERC-8004 en mint público (Fase 4)

---

## Índice documentación activa

| Doc | Tema |
|-----|------|
| `decisions/chain-base-mainnet.md` | Cadena única |
| `research/mainnet-migration.md` | Plan migración |
| `research/vims-vs-agenft-registry.md` | Sustituto VIMS |
| `research/organ-assembly-catalog.md` | Órganos + servicios |
| `research/library-storage-policy.md` | Biblioteca B, Karpathy no |
| `research/runtime-adapters.md` | Hermes / OpenClaw / ElizaOS |
| `research/companion-agent-byoa.md` | BYOA — agente en cualquier app |
| `research/pieces-taxonomy.md` | **Mapa piezas + estados** |
| `research/organ-studio-visual.md` | Organ Studio grafo |
| `research/cross-chain-agent-migration.md` | Migración multi-cadena |
| `backups/*` | Archivo histórico completo |
