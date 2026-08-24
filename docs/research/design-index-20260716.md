# Índice de diseño ordenado — Jul 2026

> Mapa maestro de decisiones recientes. Cada bloque enlaza a su doc.  
> **Clasificación completa por pieza:** [`pieces-taxonomy.md`](pieces-taxonomy.md) ← empezar aquí para ubicar ideas.

---

## 1. Producto y economía

| # | Tema | Doc |
|---|------|-----|
| 1.1 | Autofinanciación (objetivo, sin garantía) | [`self-funding.md`](self-funding.md) |
| 1.2 | **Quién paga x402** — solo externos, no el owner | [`voice-external-income.md`](voice-external-income.md) |
| 1.3 | Especialización > chat genérico vs ChatGPT | [`voice-external-income.md`](voice-external-income.md) |
| 1.4 | Alquiler puntual / tarea fija / B2A | [`voice-external-income.md`](voice-external-income.md) |
| 1.5 | Gastos acumulados visibles en Dashboard | [`owner-dashboard.md`](owner-dashboard.md) · [`organ-service-tiers.md`](organ-service-tiers.md) |

---

## 2. Tres niveles por órgano (G · D · E)

| Nivel | Significado | Default |
|-------|-------------|---------|
| **G** Gratis | OSS, local, probes | ✅ |
| **D** Descentralizado / uso | x402, IPFS, **Akash**, io.net | Owner elige |
| **E** Fácil | SaaS + cuenta humana | Opt-in explícito |

Doc completo + matriz por órgano: [`organ-service-tiers.md`](organ-service-tiers.md)

---

## 3. Dos Doctores

| Doctor | Rol |
|--------|-----|
| **Vitality (Qi)** | Órganos despiertos, TBA alimentada, conexiones, failover, runway |
| **Hygiene (Shield)** | CVE, auditoría código, anti-fugas, cookies/metadatos, tier E con consentimiento |

Doc: [`dual-doctor.md`](dual-doctor.md)

---

## 4. Roadmap de implementación (orden global)

### Bloque 3 — Núcleo
`1 → 2 → 6 → 3 → 7` — cablear, memoria, fallbacks, estética, checklist  
Dashboard transversal desde paso 1.

### Bloque 4 — Presencia (opcional)
`4 → 5 → 7` — TTS, boca, lip-sync ML

### Bloque 5 — Sentidos
STT, OCR, visión, traductor

### Bloque 7 — Autofinanciación
Scout ahorro → tips → B2B → voice externo especializado → Zora → yield → trading ⚠️

Doc: [`lab/next-steps.md`](lab/next-steps.md)

**Wiring operativo (Lab → runtime):** [`lab/runtime-wiring.md`](lab/runtime-wiring.md) — panel visual acordado para producto final; protocolo vs pin: [`memory-storage-layers.md`](memory-storage-layers.md).

---

## 5. Dashboard (hub)

- ⚙️ accesible desde **todo hábitat** (web, Telegram `/ajustes`, embed)
- Secciones: tesoro, **gastos por órgano/tier**, ingresos externos, órganos G/D/E, dos doctores, presencia opcional

Doc: [`owner-dashboard.md`](owner-dashboard.md)

---

## 6. Identidad y foso (contexto)

- URUIRU / Gespenster — [`presence-optional.md`](presence-optional.md)
- Open source + servicio Doctor remoto **voluntario**
- Scout / ConvoHunter — leads para tareas especializadas, no chat genérico

---

## 7. Transferencia y hosting local

Doc: [`transfer-local-hosting.md`](transfer-local-hosting.md) — qué órganos van en local, problemas al transferir, wizard mudanza → default.

## 9. Memoria y transfer

Doc: [`memory-transfer-policy.md`](memory-transfer-policy.md) — Vault 0 nunca viaja; reset opcional vs full.

## 10. Capas M1/M2/M3, alquiler y trial on-chain

Doc: [`memory-layers-access.md`](memory-layers-access.md) — PII, clasificación al aprender, rental, `saleConfigHash`.

## 11. Biblioteca — documentos de consulta

Doc: [`library-storage-policy.md`](library-storage-policy.md) — IPFS con NFT vs local/nube owner; `libraryHash` en trial/venta; **no Karpathy**.

## 12. Runtime adapters (motor E1)

Doc: [`runtime-adapters.md`](runtime-adapters.md) — Hermes MVP · OpenClaw adapter · ElizaOS Fase 5; **un NFT, motor intercambiable**.

## 13. Companion / BYOA — agente en cualquier app

Doc: [`companion-agent-byoa.md`](companion-agent-byoa.md) — humano + ageNFT misma UI; WebMCP · browser MCP · slot BYOA; visión adopción.

## 14. Taxonomía de piezas (mapa completo)

Doc: [`pieces-taxonomy.md`](pieces-taxonomy.md) — **cada pieza en su sitio** · estados ✅ 📐 💡 ⏸ · sesión inspirada 16-jul.

**Vista gráfica coloquial:** canvas `agenft-mapa-pensado` (IDE → `Open Canvas`).

## 15. Organ Studio — control visual del cuerpo

Doc: [`organ-studio-visual.md`](organ-studio-visual.md) — grafo plug&play órganos y conexiones; medio-largo plazo; complementa Dashboard.

## 16. Migración cross-chain del agente

Doc: [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) — lock/wrap + mirror; órganos adaptados por red; wizard; visión largo plazo.

---

Doc: [`video-notes-gbascunana-20260716.md`](video-notes-gbascunana-20260716.md) — urgencia, nicho, ConvoHunter.

---

## Orden de lectura para mañana

1. Este índice  
2. `voice-external-income.md` — aclarar pagador  
3. `organ-service-tiers.md` — G/D/E + Akash  
4. `dual-doctor.md` — Qi + Hygiene  
5. `lab/next-steps.md` — qué cablear después  
