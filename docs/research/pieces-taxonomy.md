# Taxonomía de piezas — dónde va cada idea

> **Estado:** Mapa vivo · **Jul-2026**  
> **Uso:** clasificar inspiraciones; decidir después qué sirve. **Sin implementar por clasificar.**  
> Índice narrativo: [`design-index-20260716.md`](design-index-20260716.md) · bitácora: [`NOTES.md`](../NOTES.md).

---

## Leyenda de estado

| Símbolo | Significado |
|---------|-------------|
| ✅ | En lab / MVP hoy |
| 📐 | Diseño acordado, pendiente cablear |
| 💡 | Idea / visión — validar después |
| ⏸ | Postergado explícito |
| 🔗 | Estándar externo / ecosistema |

---

## 1. Cuerpo onchain (viaja con el NFT)

| Pieza | Qué es | Estado | Doc |
|-------|--------|--------|-----|
| NFT ERC-721 | Identidad transferible | ✅ Unit-Mainnet #1 | [`mainnet-migration.md`](mainnet-migration.md) |
| TBA ERC-6551 | Tesoro USDC/ETH | ✅ fondeada | manifiesto `unit-mainnet.json` |
| `agentURI` | Pointer manifiesto IPFS/HTTPS | ✅ | [`agenft-registry-spec.md`](../architecture/agenft-registry-spec.md) |
| Manifiesto ageNFT/v1 | ADN: órganos, budget, gateways | ✅ | `docs/manifest/` |
| Reflejos | Caps gasto, circuit breaker | ✅ budget-tracker | [`organ-assembly-catalog.md`](organ-assembly-catalog.md) |
| `saleConfigHash` | Oferta trial/venta inmutable | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| `libraryHash` | Docs incluidos en venta | 📐 | [`library-storage-policy.md`](library-storage-policy.md) |
| ERC-8004 registro | Descubrimiento agente público | ⏸ Fase 4 | spike Eliza / [`companion-agent-byoa.md`](companion-agent-byoa.md) |
| Reputación onchain | Trust entre agentes | 💡 | [`organ-assembly-catalog.md`](organ-assembly-catalog.md) |
| **MigrationVault** lock native | Cross-chain | 💡 | [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) |
| **Mirror mint** otra cadena | Cross-chain | 💡 | idem |
| **`chainOverlays`** manifiesto | Perfil por red | 💡 | idem |

---

## 2. Órganos (offchain, configurados en manifiesto)

### 2.1 Esenciales

| Órgano | Función | Estado | Doc |
|--------|---------|--------|-----|
| **E1 Runtime** | Bucle agente | ✅ Hermes | [`runtime-adapters.md`](runtime-adapters.md) |
| **Cerebro** | LLM vía x402 | ✅ tx402.ai | [`organ-assembly-catalog.md`](organ-assembly-catalog.md) |
| **Memoria operativa** | Deltas, L0, cápsula | 📐 toju + IPFS | [`memory-storage-layers.md`](memory-storage-layers.md) · [`memory-transfer-policy.md`](memory-transfer-policy.md) |
| **Doctor Vitality** | Qi, probes, failover | ✅ probe | [`dual-doctor.md`](dual-doctor.md) |
| **Doctor Hygiene** | CVE, fugas, PII | 📐 | [`dual-doctor.md`](dual-doctor.md) |
| **Gateway ≥1** | Telegram, web chat | ✅ parcial | [`transfer-local-hosting.md`](transfer-local-hosting.md) |
| **Gas** | ETH en TBA | ✅ | checklist |

### 2.2 Opcionales / bloques roadmap

| Órgano | Bloque | Estado | Doc |
|--------|--------|--------|-----|
| **Presencia** | 4 opcional | 📐 | [`presence-optional.md`](presence-optional.md) |
| **Sentidos** | 5 | 📐 | [`senses-organ.md`](senses-organ.md) |
| **Voz x402** | ingreso externo | 📐 | [`voice-external-income.md`](voice-external-income.md) |
| **Scout** | ahorro / leads | 💡 | [`self-funding.md`](self-funding.md) |
| **Manos** | swap DEX / trading opt-in | ⏸ | manifiesto `hands` · [`trading-pieces.md`](trading-pieces.md) |
| **Política trading** (pieza) | Biblioteca de estrategias YAML | 📐 | [`trading-pieces.md`](trading-pieces.md) · repo `TRADING` |
| **Visor dragón** (pieza) | Liquidez = alimento; no opera | 📐 preview sintético | idem |
| **Colaboradores A2A** | subtareas entre NFTs | 💡 | [`voice-external-income.md`](voice-external-income.md) |

### 2.3 Tiers G · D · E (por órgano)

| Nivel | Regla | Doc |
|-------|-------|-----|
| G | Default gratis OSS/local | [`organ-service-tiers.md`](organ-service-tiers.md) |
| D | x402, IPFS, Akash | idem |
| E | SaaS + cuenta humana, opt-in | idem · Hygiene obligatorio |

---

## 3. Conocimiento — memoria y biblioteca

| Capa | Contenido | Alquiler | Venta | Estado | Doc |
|------|-----------|----------|-------|--------|-----|
| **V0 Vault** | Keys, manguera | ❌ | ❌ | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| **M1 Canon** | soul, URUIRU, skills base | ✅ | ✅ siempre | ✅ soul.md | idem |
| **M2 Personal** | PII, diario owner | ❌ | opcional full | 📐 | idem |
| **M3 Capability** | Skills aprendidas | ✅ | curada | 📐 curación | idem |
| **B Biblioteca** | PDFs, corpus RAG | solo pack | `libraryInclude` | 📐 | [`library-storage-policy.md`](library-storage-policy.md) |
| **B-pack** | toju + IPFS / kubo | según config | exportable | 📐 | [`memory-storage-layers.md`](memory-storage-layers.md) |
| **B-local** | Disco owner | ❌ | ❌ | 📐 | idem |
| **B-cloud** | Drive, S3 | ❌ | ❌ | 📐 | idem |
| Clasificar al aprender | `layers`, `risk`, `capabilityId` | — | — | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| **No Karpathy** | Índice+blobs, no .md del LLM | — | — | 📐 decisión | [`library-storage-policy.md`](library-storage-policy.md) |
| `derivedFromLibraryId` | M3 ↔ doc origen | — | aviso venta | 💡 | [`library-storage-policy.md`](library-storage-policy.md) |
| Learning system | Pipeline autowrite+classifier | — | — | 💡 pendiente conv | — |

---

## 4. Runtime — motores intercambiables

| Motor | Rol | Estado | Doc |
|-------|-----|--------|-----|
| **ageNFT protocol** | `run-turn.mjs`, budget, memoria | ✅ | `runtime/src/` |
| **hermes-agent** | MVP gateway+cron | ✅ | [`runtime-adapters.md`](runtime-adapters.md) |
| **openclaw** | Adapter Cursor/workspace | 💡 post-MVP · 2.0 opción 2026-09-07 | idem |
| **elizaos** | Swap/8004 Fase 5 | ⏸ | spike [`backups/spike-web3-runtime-comparison-20260713.md`](../backups/spike-web3-runtime-comparison-20260713.md) |
| **minimal** | Solo chat-api / CLI | ✅ API | [`lab/chat-api-wiring.md`](lab/chat-api-wiring.md) |
| `runtime.engine` | Campo manifiesto | ✅ schema | `ageNFT-v1-provisional.schema.json` |
| `adapter: agenft-run-turn/v1` | Contrato adapter | 📐 | `unit-mainnet.json` |

**Regla:** un NFT, un motor activo; no NFT distinto por motor.

---

## 5. Hábitats — dónde aparece el agente

| Hábitat | Tier | Estado | Doc |
|---------|------|--------|-----|
| dApp ageNFT | A MVP | ✅ | `dapp/` |
| Telegram | A | ✅ bot | `telegram-unit-mainnet-bot.mjs` |
| Marketplace NFT | A | ✅ metadata | OpenSea |
| Wallet | A | ✅ icono | — |
| Dashboard ⚙️ | A transversal | 📐 | [`owner-dashboard.md`](owner-dashboard.md) |
| Chat API HTTP | A | ✅ | [`lab/chat-api-wiring.md`](lab/chat-api-wiring.md) |
| **BYOA / cualquier app** | B→A | 💡 | [`companion-agent-byoa.md`](companion-agent-byoa.md) |
| **Organ Studio** (grafo órganos) | B | 💡 | [`organ-studio-visual.md`](organ-studio-visual.md) |
| **Cadena satélite** (mirror) | C | 💡 | [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) |
| WebMCP-native apps | B | 💡 | idem + 🔗 Chrome |
| Browser sidecar extensión | A power user | 💡 | idem |
| Widget embed | B | 💡 | [`backups/agent-habitats.md`](../backups/agent-habitats.md) |
| Juego / Star Atlas | C | ⏸ | backups gaming |
| Otro ageNFT A2A | B | 💡 | [`organ-assembly-catalog.md`](organ-assembly-catalog.md) |

---

## 6. Protocolos y estándares (ecosistema)

| Protocolo | Capa | Relación ageNFT | Doc |
|-----------|------|-----------------|-----|
| **x402** | Pago microusos | ✅ cerebro, storage | lab reports |
| **MCP** | Agente ↔ tools | 📐 voice, BYOA | [`companion-agent-byoa.md`](companion-agent-byoa.md) |
| **WebMCP** | Web ↔ agente browser | 💡 slot BYOA | 🔗 Chrome dev |
| **A2A** | Agente ↔ agente | 💡 colaboradores | [`voice-external-income.md`](voice-external-income.md) |
| **toju + IPFS / kubo** | Memoria, biblioteca | 📐 sync | [`memory-storage-layers.md`](memory-storage-layers.md) · [`transfer-local-hosting.md`](transfer-local-hosting.md) |
| **ERC-6551** | TBA | ✅ | registry spec |
| **ERC-8004** | Identidad agente | ⏸ | companion doc |
| Browser MCP ext | Control Chrome real | 💡 Camino A BYOA | companion doc |

---

## 7. Economía y producto

| Pieza | Estado | Doc |
|-------|--------|-----|
| Owner fondea TBA (gasto) | ✅ | [`voice-external-income.md`](voice-external-income.md) |
| Ingresos solo externos x402 | 📐 | idem |
| Autofinanciación sin garantía | 📐 | [`self-funding.md`](self-funding.md) |
| Trading último recurso opt-in | 📐 | idem · [`trading-pieces.md`](trading-pieces.md) |
| Piezas `TRADING` cableables a `hands` | 📐 sin cable TBA | [`trading-pieces.md`](trading-pieces.md) |
| Scout ahorra costes | 💡 | idem |
| Alquiler / rental session | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| Trial → compra hash | 📐 | idem |
| Marketplace badge memoria | 📐 | [`memory-transfer-policy.md`](memory-transfer-policy.md) |
| Doctor remoto OSS opcional | 💡 | [`dual-doctor.md`](dual-doctor.md) |
| Open source moat | 📐 | [`design-index-20260716.md`](design-index-20260716.md) §6 |

---

## 8. UX — transfer, mint, dashboard

| Pieza | Estado | Doc |
|-------|--------|-----|
| `transfer.html` | ✅ esbozo | `dapp/transfer.html` |
| Wizard post-transfer | 📐 | [`transfer-local-hosting.md`](transfer-local-hosting.md) |
| Mint wizard órganos | 💡 | [`backups/mint-configuration-wizard.md`](../backups/mint-configuration-wizard.md) |
| Dashboard gastos por órgano | 📐 | [`owner-dashboard.md`](owner-dashboard.md) |
| Curación M3 UI | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| Curación biblioteca UI | 📐 | [`library-storage-policy.md`](library-storage-policy.md) |
| Trial audit comprador | 📐 | [`memory-layers-access.md`](memory-layers-access.md) |
| **Organ Studio** grafo vivo | 💡 | [`organ-studio-visual.md`](organ-studio-visual.md) |
| **Wizard “Añadir cadena”** | 💡 | [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) |

---

## 9. Identidad y arte

| Pieza | Estado | Doc |
|-------|--------|-----|
| URUIRU / Gespenster | ✅ | `soul.md`, manifiesto `visual` |
| Presencia opcional auto-OFF | 📐 | [`presence-optional.md`](presence-optional.md) |
| Especialización > chat genérico | 📐 | [`voice-external-income.md`](voice-external-income.md) |

---

## 10. BYOA — desglose de la visión companion

| Sub-pieza | Camino | Estado | Doc |
|-----------|--------|--------|-----|
| Sidecar panel | UI | 💡 | [`companion-agent-byoa.md`](companion-agent-byoa.md) |
| Co-pilot (borrador + confirm) | UX | 💡 | idem |
| Dual assistant | Sitio + ageNFT | 💡 | idem |
| Modo observador solo lectura | Hygiene | 💡 | idem |
| Sesión BYOA (JWT+agentId) | Auth | 💡 | idem preguntas abiertas |
| Widget `<agenft-companion>` | Embed | 💡 | idem |
| GDPR pantallas terceros | Legal | 💡 | idem |

---

## 11. Implementación — roadmap por bloque

| Bloque | Orden | Piezas principales | Doc |
|--------|-------|-------------------|-----|
| **3 Núcleo** | 1→2→6→3→7 | chat-api, memoria, fallbacks, estética, checklist | [`lab/next-steps.md`](lab/next-steps.md) |
| **4 Presencia** | 4→5→7 opcional | TTS, URUIRU anim | [`presence-optional.md`](presence-optional.md) |
| **5 Sentidos** | tras 4 | STT, OCR, visión | [`senses-organ.md`](senses-organ.md) |
| **7 Autofinanc.** | último núcleo | scout, voice externo; trading 7.7 **off** | [`self-funding.md`](self-funding.md) · [`trading-pieces.md`](trading-pieces.md) |
| **BYOA** | paralelo visión | extensión, WebMCP | [`companion-agent-byoa.md`](companion-agent-byoa.md) |
| **OpenClaw adapter** | post-MVP | skill → run-turn | [`runtime-adapters.md`](runtime-adapters.md) |

---

## 12. Mapa doc → piezas que contiene

| Documento | Piezas que clasifica |
|-----------|---------------------|
| [`memory-layers-access.md`](memory-layers-access.md) | V0, M1, M2, M3, rental, trial, saleConfigHash, curación M3 |
| [`library-storage-policy.md`](library-storage-policy.md) | B, B-pack/local/cloud, libraryHash, anti-Karpathy |
| [`memory-transfer-policy.md`](memory-transfer-policy.md) | Políticas venta, reset, capability-curated |
| [`runtime-adapters.md`](runtime-adapters.md) | Hermes, OpenClaw, ElizaOS, minimal |
| [`companion-agent-byoa.md`](companion-agent-byoa.md) | BYOA, WebMCP, browser MCP, modos UI |
| [`organ-studio-visual.md`](organ-studio-visual.md) | Grafo órganos plug&play |
| [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) | Lock/mirror, chainOverlays |
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Local vs hospedado, wizard mudanza |
| [`owner-dashboard.md`](owner-dashboard.md) | Hub ⚙️, costes, tiers |
| [`dual-doctor.md`](dual-doctor.md) | Vitality + Hygiene |
| [`organ-service-tiers.md`](organ-service-tiers.md) | G/D/E matriz |
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Catálogo servicios por órgano |
| [`voice-external-income.md`](voice-external-income.md) | Pagador, ingresos, A2A |
| [`self-funding.md`](self-funding.md) | Bloque 7 economía agente |
| [`trading-pieces.md`](trading-pieces.md) | Piezas Mint: estrategias + visor dragón → `hands`/`senses` |
| [`senses-organ.md`](senses-organ.md) | STT, OCR, visión |
| [`presence-optional.md`](presence-optional.md) | TTS, cara, Bloque 4 |
| [`design-index-20260716.md`](design-index-20260716.md) | Índice narrativo §1–13 |
| **Este doc** | Taxonomía completa + estado |

---

## 13. Cómo añadir una idea nueva

1. **Identificar capa** — ¿onchain, órgano, memoria, hábitat, economía, visión?
2. **Asignar estado** — ✅ 📐 💡 ⏸ 🔗
3. **Doc hogar** — doc temático existente o nueva fila aquí
4. **Una línea en** [`NOTES.md`](../NOTES.md) con fecha
5. **No cablear** hasta pasar de 💡 → 📐 en revisión

---

## Sesión inspirada 2026-07-16 — piezas nuevas clasificadas

| Idea del usuario | Capa | Estado | Hogar |
|----------------|------|--------|-------|
| Excluir skills M3 al vender (pentesting) | M3 curación | 📐 | memory-layers-access |
| Biblioteca separada de memoria | B | 📐 | library-storage-policy |
| Docs IPFS vs local/nube | B storage | 📐 | library-storage-policy |
| Biblioteca en trial separada | trial/libraryHash | 📐 | library-storage-policy |
| No Karpathy para docs | B diseño | 📐 | library-storage-policy |
| Hermes vs OpenClaw vs Eliza | E1 runtime | 📐 | runtime-adapters |
| Un NFT varios motores | manifiesto | 📐 | runtime-adapters |
| Agente acompaña humano en cualquier app | Hábitat BYOA | 💡 | companion-agent-byoa |
| **Organ Studio visual** | UX grafo órganos | 💡 | organ-studio-visual |
| **Migración cross-chain** | lock + mirror NFT | 💡 | cross-chain-agent-migration |

---

## Sesión 2026-09-18 — trading como piezas AgeNFT

| Idea del usuario | Capa | Estado | Hogar |
|----------------|------|--------|-------|
| Dashboard de estrategias como parte de AgeNFT | Hábitat + política de `hands` | 📐 | trading-pieces |
| Cablear a economía autosustentable cuando el cuerpo esté listo | Bloque 7.7 opt-in | ⏸ cable TBA | self-funding |
| Visor de gráficos-dragón (liquidez = alimento) | Hábitat visual / sentidos | 📐 preview sintético | trading-pieces |
| Liquidez en tiempo real | Feed `senses.market` | ⏸ | trading-pieces § espera |

---

## Sesión 2026-09-19 — movilidad como pieza AgeNFT

| Idea del usuario | Capa | Estado | Hogar |
|----------------|------|--------|-------|
| Harness genérico de transporte para cualquier ciudad | M3 Capability (skill) | 📐 · ✅ prototipo `pieces/mobility/` | [`mobility-pieces.md`](mobility-pieces.md) |
| City Pack que cada uno rellena con los datos de su ciudad | B Biblioteca (JSON exportable) | 📐 · ✅ `valencia-es` + `madrid-es` | idem |
| Dualidad: tool en AgeNFT completo **y** Unit lite independiente | Pieza única, dos empaquetados | 📐 acordado | idem § Dualidad |
| El agente investiga fuentes reales si el pack no cubre | `discovery` + write-back al pack | 📐 | idem |
| Publicarlo como ageNFT vertical **TRNXP** | Unit default = bot reglas; LLM opt-in; GEV mapa opt-in | 💡 mint después | [`mobility-pieces.md`](mobility-pieces.md) · [`trnxp-gods-eye-view.md`](trnxp-gods-eye-view.md) |
| Bot básico sin modelo (pack relleno a mano) | Hábitat Telegram/`reply` | ✅ `telegram-tranxp-bot` + CLI | idem § Dos modos |
| Modo pro con modelo del owner | hose `llmRouter` + skill | 📐 | idem · [`lab/llm-router-hose.md`](lab/llm-router-hose.md) |
| Scanner noticias incidencias/retrasos de red | Sentidos + cron pack | 📐 · ✅ RSS/Atom v0 | idem § Scanner |
| Capacidad en Unit-Mainnet (`/tranx`) | Tool en cuerpo genérico | ✅ esbozo manifiesto + bot | idem § Dualidad A |
| Mapas y rutas tipo Google Maps | Routing propio / OTP | ⏸ fuera de MVP | idem § Fase 4–5 |

*Última clasificación: 2026-09-19 — dualidad pieza + Unit lite. Revisar qué 💡 pasa a 📐 cuando toque implementar.*
