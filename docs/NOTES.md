# Notas de diseño — log cronológico

Bitácora de decisiones. Docs temáticos en `docs/research/` y `docs/decisions/`.  
**Mapa de piezas:** [`research/pieces-taxonomy.md`](research/pieces-taxonomy.md) · índice: [`research/design-index-20260716.md`](research/design-index-20260716.md).

---

## 2026-08-31

### Dashboard guía usuario no técnico

- `dapp/settings.html` reescrito: pasos Telegram, glosario, FAQ, hucha en castellano.
- `dapp/js/settings-guide.js` — datos dinámicos del agente.
- Protocolo de prueba: [`research/lab/onboarding-usuario-normal.md`](research/lab/onboarding-usuario-normal.md).

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
- **OpenClaw:** segundo adapter recomendado (workspace/Cursor); llama al mismo `runTurn()` — no reimplementar protocolo.
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
- [ ] OpenClaw adapter (skill → run-turn) — post-MVP
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
