# Plan de desarrollo por fases — ageNFT

> Hoja de ruta para pasar de diseño (Fase 0) a MVP funcional y producto.
> **Chain ancla:** Base (Sepolia contratos / mainnet servicios x402).
> **Runtime:** Hermes Agent (MIT).
>
> Última revisión: 2026-07-13

---

## Visión del entregable final (recordatorio)

```
Mint → NFT + TBA + agentURI (manifiesto)
     → Runtime lee tokenId → órganos ensamblados
     → Agente conversa, paga x402, memoria persiste
     → Transfer 1 TX → nuevo owner opera sin reconfigurar
```

---

## Resumen de fases

| Fase | Nombre | Objetivo | Duración orientativa |
|------|--------|----------|----------------------|
| **0** | Diseño | Principios, arquitectura, validación probes | ✅ Hecho |
| **1** | Esqueleto | Manifiesto + mint test + 1 inferencia x402 | 2–3 semanas |
| **2** | Cuerpo mínimo | Memoria, TBA, presupuesto, transfer check | 3–4 semanas |
| **3** | Autonomía | Router, Doctor, Olfato básico | 4–6 semanas |
| **4** | Producto | dApp, voz x402, onboarding | 6–8 semanas |
| **4.5** | Presencia visual | Cara animada, voz, lip-sync (tiers) | 3–5 semanas |
| **4.6** | Onboarding trial | Airdrop invitación, training, orfanato (MVP offchain) | 4–6 semanas |
| **4.7** | Social Zora | Perfil Base, Creator Coin, posts desde agente | 2–4 semanas |
| **5** | Escala | Multi-fallback, privacidad, verticals | Continuo |

Las duraciones son orientativas para un dev/part-time; ajustar según recursos.

---

## Fase 0 — Diseño ✅

**Estado:** completada.

### Entregables
- [x] Principios, anatomía, economía, stack cripto
- [x] Validación probes (tx402, toju, agent.vims)
- [x] Decisión Base como chain ancla
- [x] Gastos/límites por órgano (`spending-budgets.md`)
- [x] Manifiesto provisional v1 (schema + ejemplo)

### Salida
Documentación en `docs/` — **no código producto**.

---

## Fase 1 — Esqueleto (MVP técnico mínimo)

**Objetivo:** demostrar que un token onchain + manifiesto + runtime pueden **pagar 1 inferencia LLM** desde la TBA.

### 1.1 Manifiesto y tipos
- [x] Schema `docs/manifest/ageNFT-v1-provisional.schema.json`
- [x] Ejemplo `docs/manifest/examples/minimal.json` + `unit-1-lab.json`
- [x] Validador CLI: `scripts/validate-manifest.mjs`

### 1.2 Identidad onchain (sin fork AGPL inicial)
- [x] Mint agente prueba en [agent.vims.com](https://agent.vims.com) (Base Sepolia) — **Unit-0 #114**, script `scripts/onchain/mint-vims-agent.mjs`
- [x] Documentar addresses canónicos Agent-NFT — `docs/research/vims-lab-unit-0.md`
- [x] Script: leer `tokenId` → TBA address → agentURI — `scripts/onchain/read-agent.mjs`

### 1.3 Runtime mínimo (`runtime/`)
- [x] `ManifestLoader`: load + validate manifiesto local
- [x] `OrganResolver`: brain.primary / fallbacks (`resolveBrain`)
- [x] Script Node standalone (`runtime/src/run-once.mjs`) — sin Hermes fork aún
- [x] Memory stub local: preload soul/skills + autowrite delta
- [ ] `@x402/fetch` desde **TBA** (Fase 2) — Fase 1: wallet EOA con `--pay`

### 1.4 Cerebro (1 request)
- [x] Pago E2E tx402.ai desde wallet test (mainnet micro-USDC) — Unit-1 2026-07-12
- [ ] Log: coste real vs `budget.organs.brain` estimado (≈0.0015 USDC observado)

### 1.5 Scripts
- [ ] `scripts/validation/` — ya existe; ampliar con `--pay`
- [x] `scripts/onchain/read-agent.mjs` — inspeccionar agente minteado

### Criterios de aceptación Fase 1
```
✓ NFT minteado en Sepolia con TBA conocida
✓ Manifiesto validado contra schema
✓ 1 chat completion pagada vía x402 (tx hash / receipt log)
✓ README actualizado con quickstart Fase 1
```

### Fuera de scope Fase 1
- Doctor, scout, manguera, voz, contratos propios, mainnet producto

---

## Fase 2 — Cuerpo mínimo viable

**Objetivo:** cuerpo **transferible** con memoria, presupuesto y diagnóstico post-transfer.

### 2.1 Memoria
- [x] Cápsula `agenft-memory-capsule/v1` + sync offchain (`memory-toju.mjs`)
- [x] toju x402 upload (mainnet) — **regresión API 402 jul-2026**; fallback `lab-remote`
- [x] Restart test: wipe local → hydrate → preload OK (`npm run memory:restart-test`)
- [ ] `memory.primary` / CID en manifiesto onchain (post-toju fix)
- [ ] Snapshot Arweave opcional (archivo permanente)

### 2.2 Tesoro y Reflejos
- [x] Contadores gasto por órgano (JSON ledger local) — `budget-tracker.mjs`
- [x] Enforce caps desde `budget.organs.brain` + global (run-once preflight)
- [x] Modo **dormant** si cap superado o saldo USDC insuficiente
- [x] CLI `npm run budget` — status + caps + eventos recientes
- [ ] API HTTP `GET /budget/status` (Fase 2.5 dApp)

### 2.3 Transferencia
- [x] Script round-trip + checklist digital-body — `transfer-checklist.mjs`
- [x] Unit-1 #115 E2E jul-2026: **7/7** post-transfer-back — ver [`transfer-checklist-lab.md`](../research/transfer-checklist-lab.md)
- [x] Recovery script `recover-agent.mjs` si falla return transfer
- [ ] Nuevo owner solo recarga TBA (opcional); documentar UX onboarding

### 2.4 Runtime Hermes integrado
- [x] Skill `agenft-core` — routing obligatorio a `hermes:turn` (manifiesto + budget)
- [x] `run-turn.mjs` + `hermes-turn.mjs` + `doctor-probe.mjs`
- [x] Cron Doctor lite cada 15m (`agenft-unit1-doctor`, `--no-agent`)
- [x] Config por `AGENFT_TOKEN_ID` / `AGENFT_MANIFEST_PATH`
- [ ] Gateway Telegram cableado al perfil Unit-1

### 2.5 dApp mínima (opcional Fase 2)
- [x] Página estática: TBA balance, runway, estado órganos — `dapp/`
- [x] Workflow GitHub Pages — `.github/workflows/pages.yml`
- [ ] Publicar repo + activar Pages en GitHub

### Criterios de aceptación Fase 2
```
✓ Memoria escrita y releída tras restart runtime
✓ Cap cerebro bloquea request cuando supera límite (budget-dormant-test)
✓ Transfer Sepolia: checklist 7/7 verde post-transfer-back (x402-TBA defer)
⏸ Estimador runway coherente con perfil B — pendiente dApp
```

---

## Fase 3 — Autonomía operativa

**Objetivo:** órganos que mantienen el cuerpo sin intervención constante del owner.

### 3.1 Router cerebro
- [ ] Prioridad: oportunista → x402 primary → fallback → manguera → dormant
- [ ] Registrar coste real desde headers x402

### 3.2 Olfato (scout)
- [ ] Fuentes: directorio x402, lista estática, 1–2 feeds
- [ ] Validación activa (402 probe) antes de añadir a fallbacks
- [ ] Cap `budget.organs.scout`

### 3.3 Doctor
- [ ] Skill `agenft-doctor` + scripts probe
- [ ] Failover automático primary → fallback (manifiesto)
- [ ] `setAgentURI` solo si `doctor.autoTransplant` permite
- [ ] Estados: healthy / impaired / dormant

### 3.4 Runtime hosting
- [ ] Evaluar Akash CPU deploy desde script (AKT)
- [ ] Documentar migración runtime URL en manifiesto

### 3.5 Manguera (opcional)
- [ ] Owner conecta OpenRouter key cifrada
- [ ] Límites `hose.ownerLimits`; no cuenta TBA

### Criterios de aceptación Fase 3
```
✓ Simular caída primary cerebro → fallback en &lt; 1 ciclo Doctor
✓ Scout encuentra y valida 1 gateway alternativo (testnet/mainnet)
✓ 24h unattended: agente responde o degrada gracefully (no drain TBA)
```

---

## Fase 4 — Producto

**Objetivo:** experiencia **cuerpo digital** para owner y compradores.

### 4.1 Mint pipeline propio (evaluar)
- [ ] ¿Contratos clean-room vs Agent-NFT canonical?
- [ ] Factory ageNFT + registro ERC-8004 (pospuesto: ver watchlist §4 — Fase 4, no antes)

### 4.2 Voz (ingresos)
- [ ] Endpoint x402 `/ask` → pago a TBA
- [ ] Registro en agentURI + ERC-8004 services

### 4.3 UI / marketplace
- [ ] **Mint wizard:** paso a paso — runtime (Hermes/OpenClaw/…), cerebro, memoria, **chat multi-gateway**, presencia, presupuesto → manifiesto IPFS
- [ ] Presets: `docs/manifest/presets/{lab-hermes,openclaw}.json`
- [ ] Dashboard: órganos, gastos, recarga TBA
- [ ] Transfer UX: "qué viaja en 1 TX"

### 4.4 Mainnet
- [ ] Audit contratos (si fork)
- [ ] Mainnet mint + runbook operación

### Criterios de aceptación Fase 4
```
✓ Usuario no técnico mintea, recarga, chatea, transfiere
✓ Al menos 1 ingreso x402 demostrado (aunque simulado)
```

---

## Fase 4.5 — Presencia visual (cara y voz del personaje)

**Objetivo:** el ageNFT **se ve y se oye** como un personaje; degradación automática si falta presupuesto o potencia.

> Spec completa: [`presence-organ.md`](../research/presence-organ.md)

### 4.5.1 Manifiesto y assets
- [x] Borrador órgano `presence` en schema + ejemplo Unit-1
- [ ] Generar `idleAsset` (vídeo bucle IPFS o paquete Live2D) desde `image` del NFT
- [ ] Documentar pipeline offline imagen-a-vídeo (una vez)

### 4.5.2 Servidor de Presencia
- [ ] Microservicio `presence-server` (separado del motor Hermes)
- [ ] Entrada: `{ text, emotion, energy }` desde runtime
- [ ] Salida: stream audio + visual (WebRTC / HLS / WebSocket)
- [ ] Selector `liveMode: auto` — tiers P0→P4 según budget + GPU

### 4.5.3 Voz
- [ ] TTS (texto a voz) con cap `budget.organs.presence`
- [ ] Integración x402 para APIs de voz si aplica
- [ ] Fallback: solo subtítulos + imagen/bucle

### 4.5.4 Animación avanzada (opcional)
- [ ] Lip-sync (MuseTalk / Wav2Lip local o API)
- [ ] Emoción desde tags LLM → expresión (Live2D / Rive)
- [ ] Idle procedural aleatorio (parpadeo, mirada) en modo reposo

### 4.5.5 Cliente
- [ ] Componente dApp: muestra presencia según tier activo
- [ ] Indicador de modo (static / loop / live) para el owner

### Criterios de aceptación Fase 4.5
```
✓ Unit-1 muestra imagen NFT en dApp (P0)
✓ Modo idle-loop reproduce bucle IPFS (P1)
✓ Respuesta del cerebro se escucha en voz (P2)
✓ Si cap presence superado → degrada a P1/P0 sin error visible
✓ Documentado qué tier requiere GPU vs API vs gratis
```

### Fuera de scope Fase 4.5
- Avatar 3D completo
- Generación imagen-a-vídeo en tiempo real en móvil (solo offline o API con budget)

---

## Fase 4.6 — Onboarding trial y orfanato

**Objetivo:** promoción por invitación — probar un ageNFT, entrenarlo, ganar propiedad; abandonados al orfanato.

> Spec: [`onboarding-airdrop-orphanage.md`](../research/onboarding-airdrop-orphanage.md)

### 4.6.1 Trial mint
- [ ] Flujo invitación (código / allowlist)
- [ ] Estado `lifecycle: trial` en metadata
- [ ] Reflejos estrictos durante trial

### 4.6.2 Entrenamiento
- [ ] Métricas training level (conversaciones, misiones, recarga mínima)
- [ ] UI barra de progreso en dApp
- [ ] Graduación → `transfer` al usuario

### 4.6.3 Orfanato
- [ ] Página `/orphanage` + listado OpenSea collection
- [ ] Precio adopción simbólico
- [ ] Contexto presencia `orphanage` (preview + badge)

### 4.6.4 Contratos (Fase 5 defer)
- [ ] `TrialMint` + `graduate` + `adopt` onchain

### Criterios de aceptación Fase 4.6
```
✓ Usuario invitado mintea trial sin ser técnico
✓ Completa training level N → NFT en su wallet
✓ Agente abandonado aparece en orfanato con preview
✓ Adopción simbólica funciona (manual o contrato)
```

---

## Fase 4.7 — Social Zora (Base)

**Objetivo:** perfil social del ageNFT en Zora — Creator Coin, posts, ingresos a TBA.

> Spec: [`social-habitats-zora.md`](../research/social-habitats-zora.md)

### 4.7.1 Perfil
- [ ] Vincular wallet TBA (o delegación owner) a Zora
- [ ] Activar Creator Coin (irreversible — requiere aprobación owner)
- [ ] `social.profiles[]` en manifiesto

### 4.7.2 Publicación
- [ ] Skill `agenft-zora` — CLI `@zoralabs/cli` con Reflejos
- [ ] Posts: imagen + `previewAsset` teaser
- [ ] Link en bio → app ageNFT (experiencia completa)

### 4.7.3 Soberanía
- [ ] Fase A: owner publica en nombre del agente
- [ ] Fase B: TBA firma posts directamente

### Criterios de aceptación Fase 4.7
```
✓ Perfil Zora visible con imagen ageNFT
✓ Al menos 1 post publicado
✓ Ingresos Creator Coin ruteados a TBA (o plan documentado)
```

---

## Fase 5 — Escala y research

**Objetivo:** diferenciadores y robustez long-term.

| Track | Entregables |
|-------|-------------|
| **ERC-8181 híbrido** | Recovery / anchoring sin romper transfer |
| **ElizaOS adapter** | RuntimeAdapter alternativo |
| **Privacidad** | Nym transport opcional; memoria cifrada |
| **Multi-chain** | Solana satélite; NEAR intents |
| **Verticals** | Gaming module, Star Atlas app repo |
| **W3Stor / Filecoin Pin** | Fallback storage cuando API estable |
| **Session keys onchain** | Caps alineados con manifiesto |

---

## Stack congelado para Fase 1–2

| Pieza | Elección | Alternativa documentada |
|-------|----------|-------------------------|
| Chain identidad | Base Sepolia → mainnet | Arbitrum (descartado ancla) |
| Contratos ref | Agent-NFT canonical | Clean-room Fase 4 |
| TBA | ERC-6551 | — |
| Identidad agente | VIMS testnet (Fase 1–3) → ERC-8004 mainnet Fase 4 | Manifiesto solo (privado) |
| Cerebro | tx402.ai (Base mainnet) | GPU-Bridge |
| Memoria ops | toju x402 | W3Stor, IPFS |
| Memoria archivo | Arweave | Filecoin Pin |
| Runtime | Hermes Agent | ElizaOS Fase 5 |
| Pagos | USDC x402 | — |

---

## Estructura repo objetivo (Fase 1+)

```
ageNFT/
├── docs/
│   ├── manifest/           # schema + ejemplos  ← NUEVO
│   └── architecture/
│       └── development-roadmap.md
├── contracts/              # Fase 4 (vacío Fase 1)
├── runtime/
│   ├── loader/             # manifiesto + órganos
│   ├── budget/             # contadores + caps
│   └── adapter-hermes/     # skills + cron
├── scripts/
│   ├── validation/
│   ├── read-agent.mjs
│   └── validate-manifest.mjs
└── dapp/                   # Fase 4
```

---

## Riesgos por fase

| Fase | Riesgo | Mitigación |
|------|--------|------------|
| 1 | x402 solo mainnet | Micro-budget; Sepolia solo contratos |
| 1 | Agent-NFT AGPL | Usar deployments sin fork |
| 2 | toju TTL expira | Doctor re-pin; alertas |
| 3 | Bucles LLM | Reflejos + caps estrictos |
| 4 | Confusión marca Hermes | "Built on Hermes Agent" |
| 5 | W3Stor infra | toju primary |

---

## Próximo paso inmediato (jul 2026)

Ver **[`docs/research/lab/next-steps-20260713.md`](../research/lab/next-steps-20260713.md)** — Bloque 1: Hermes `agenft-core` + dApp mínima + Telegram.

---

## Referencias

- [`spending-budgets.md`](spending-budgets.md)
- [`digital-body.md`](digital-body.md)
- [`validation-results.md`](../research/validation-results.md)
- [`../manifest/ageNFT-v1-provisional.schema.json`](../manifest/ageNFT-v1-provisional.schema.json)
