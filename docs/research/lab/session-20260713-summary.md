# Sesión nocturna 2026-07-13 — resumen para revisión

## Objetivo de la sesión

Continuar el plan Fase 2 de forma autónoma hasta bloqueo natural.

---

## Entregables nuevos

### Fase 2.3 — Transferencia ✅

| Archivo | Qué hace |
|---------|----------|
| `scripts/onchain/transfer-checklist.mjs` | Round-trip NFT + checklist 8 puntos |
| `scripts/onchain/recover-agent.mjs` | Recuperación manual si falla return transfer |

**E2E ejecutado:** Unit-1 #115 → temp owner → checklist → return → **7/7 PASS**

Doc: [`transfer-checklist-lab.md`](../transfer-checklist-lab.md)  
Report: [`lab/transfer-checklist-115.json`](lab/transfer-checklist-115.json)

### Runtime — utilidades extra

| Comando | Qué hace |
|---------|----------|
| `npm run budget:dormant-test` | Verifica bloqueo por cap |
| `npm run budget:runway` | Estimador requests restantes (balance + caps) |

### Docs actualizados

- `README.md` (raíz) — estado Fase 2 ~80%
- `development-roadmap.md` — 2.1, 2.2, 2.3 marcados
- `vims-exploration-loop.md` — transfer checklist
- `scripts/onchain/README.md` — comandos completos
- `NOTES.md` sesión 19 + backup `docs/backups/NOTES-20260713-0018.md`

---

## Estado Unit-1 (#115) al cierre

| Item | Valor |
|------|-------|
| Owner | `0xeAf1…C9f` (lab wallet) ✅ |
| TBA | `0x2FF43…e969` (estable) |
| Memoria offchain | `lab-remote://memory-remote/capsule.json` |
| USDC mainnet | ~0.048 (~167 inferencias estimadas) |
| Sepolia ETH owner | ~0.007 |

---

## Checklist digital-body (último dry-run)

```
✅ ownerOf correcto
✅ TBA unchanged
⚠️ TBA 0 ETH (warning)
✅ manifiesto valid
✅ memoria offchain + preload
✅ context onchain
✅ memory onchain VIMS
✅ x402 service active
⏸ pago desde TBA (defer)
```

---

## Bloqueos — no se puede avanzar sin

1. **toju API** — upload pagado 402 persistente (externo)
2. **Pago x402 desde TBA** — requiere session key / smart wallet TBA (diseño pendiente)
3. **Hermes skill `agenft-core`** — no hay fork Hermes en repo; Fase 2.4
4. **dApp / API HTTP** — Fase 2.5
5. **Runway UI perfil B** — estimador CLI existe; UI no

---

## Comandos rápidos para mañana

```bash
# Runtime
cd runtime
npm run once                    # probe sin USDC
npm run once:pay                # inferencia real
npm run budget                  # estado presupuesto
npm run budget:runway           # cuántas requests quedan
npm run memory:restart-test     # simula restart

# Onchain
cd scripts/onchain
node transfer-checklist.mjs 115 --dry-run
node probe-organs.mjs 115
node read-agent.mjs 115
```

---

## Siguiente paso recomendado (Fase 2.4)

Integrar runtime en **Hermes Agent** como skill `agenft-core`, o evaluar adapter ElizaOS si prefieres.

Alternativa paralela: **fondear TBA** con micro-USDC mainnet y prototipar pago x402 desde TBA.

---

## Sesión tarde 2026-07-13 — producto, presencia, comercio

### Decisiones

- **1 NFT = 1 agente**; colaboración vía otro ageNFT contratado (no subagentes)
- **Hermes** MVP runtime; Eliza Fase 5 si hace falta
- **ERC-8004** pospuesto a Fase 4
- **WhatsApp** excluido por defecto; owner opt-in
- **Comercialización:** OSS + OpenSea + promo; marca/impuestos si tracción

### Docs nuevos (investigación → infraestructura)

| Doc | Tema |
|-----|------|
| `presence-organ.md` | Cara, voz, tiers P0–P4 |
| `presence-context-layers.md` | Marketplace vs app vs chat |
| `presence-voice-stack.md` | dTelecom, MuseTalk, Kokoro |
| `agent-habitats.md` | Dónde vive el agente |
| `social-habitats-zora.md` | Zora Base |
| `chat-habitats-messaging.md` | Telegram, Nostr, Matrix, Simplex |
| `onboarding-airdrop-orphanage.md` | Trial, training, orfanato |
| `agenft-collaboration.md` | Contratos entre NFTs |
| `livepeer-video-habitat.md` | Streaming vídeo |
| `commercialization-light.md` | OSS, OpenSea, legal light |
| `next-steps-20260713.md` | **Prioridad ejecución** |

### Spike Web3 (completado)

- ageNFT runtime 7/7; x402 path A gana; Eliza requiere AgentAccountV2

### Prioridad actualizada

→ Ver [`next-steps-20260713.md`](next-steps-20260713.md): **Bloque 1** Hermes + dApp + Telegram antes de OpenSea/Zora.
