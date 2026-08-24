# Próximos pasos — jul 2026 (post-mainnet)

> **Última revisión:** 2026-07-16

---

## Regla de oro

> **Un agente, una cadena, una cartera.**  
> Mainnet primero; Sepolia/VIMS = archivo lab.

---

## ★ Bloque 0 — Mainnet

| # | Tarea | Estado |
|---|-------|--------|
| 0a–0j | Deploy, mint #1, TBA, x402 soberano, checklist | ✅ **8/8** |

---

## Bloque 2 — MVP producto (cerrado)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | dApp mainnet + transfer | ✅ |
| 2 | Telegram Unit-mainnet | ✅ |
| 3 | URUIRU / Gespenster | ✅ |
| 4 | TBA ≥5 USDC | ✅ |
| 5 | Vídeo demo 2 min | ⏸ |

---

## Bloque 3 — Integración y resiliencia (orden acordado)

> Secuencia núcleo: **1 → 2 → 6 → 3 → 7**  
> **Dashboard** arranca en paralelo al paso 1 (crece con cada órgano).

| Orden | # | Etapa | Qué |
|-------|---|-------|-----|
| **1** | 3.1 | **Cablear piezas** | Chat web ↔ `chat-api.mjs` ✅ esbozo; export vivo; E2E |
| **2** | 3.2 | **Memoria que viaja** | toju + IPFS (primary); kubo lab; `--sync-toju`; transfer simulado |
| **6** | 3.3 | **Fallbacks servicios** | Cerebro, memoria, Doctor `autoTransplant`; probes |
| **3** | 3.4 | **Estética Gespenster** | CSS, textura, idle estático URUIRU (sin voz) |
| **7** | 3.5 | **Checklist ampliado** | Un comando valida integración + memoria + fallbacks |

**Dashboard (transversal):** [`owner-dashboard.md`](../owner-dashboard.md) — ⚙️ en dApp desde 3.1; `/ajustes` en Telegram; crece con Sentidos y Presencia.

---

## Bloque 4 — Presencia (avatar, movimiento, voz) — **OPCIONAL**

> **Sí:** Bloque 4 = avatar que **habla y se mueve** — separado del núcleo.  
> Orden acordado dentro de Presencia: **4 → 5 → 7** (del roadmap global).  
> Doc: [`presence-optional.md`](../presence-optional.md)

| Orden | # | Pieza | Qué |
|-------|---|-------|-----|
| **4** | 4.1 | **TTS x402** | URUIRU habla; TBA paga |
| **5** | 4.2 | **Boca / movimiento** | Frames Gespenster + sync audio |
| **7** | 4.3 | **Lip-sync ML** | Solo opt-in si el arte lo pide |
| — | 4.0 | Toggle + auto-OFF | Dashboard: owner ON/OFF; Reflejos apagan solos |
| — | 4.4 | Idle animado | Refuerzo estética (puede solaparse con 3.4) |
| — | 4.5 | Preview IPFS | Marketplace P1 |

**Regla producto:** un ageNFT **funciona sin Bloque 4**. Presencia es opt-in.

---

## Bloque 5 — Sentidos (entrada)

> Escucha y visión — **aparte** del orden 1–7. Cuando el núcleo (Bloque 3) esté estable.  
> Doc: [`senses-organ.md`](../senses-organ.md)

| # | Capacidad | Orden sugerido |
|---|-----------|---------------|
| 5a | OCR (foto → texto) | primero |
| 5b | STT (voz → texto) | |
| 5c | Visión (analizar imagen) | |
| 5d | Traductor | |
| 5e | Telegram voz + foto | |
| 5f | Caps + toggles Dashboard | |

---

## Bloque 6 — Mercado (Fase 4 lite)

OpenSea Base, orfanato, trial — después de Bloque 3 estable.

---

## Bloque 7 — Autofinanciación (intentar que se pague solo)

> **Sin garantías.** Objetivo: prolongar runway y cubrir cerebro con ingresos propios.  
> Doc: [`self-funding.md`](../self-funding.md)

| Fase | Vía | Riesgo | Default |
|------|-----|--------|---------|
| 7.1 | **Scout costes** — cerebro más barato | Bajo | off → on |
| 7.2 | **Voice x402** — micro-servicios a terceros | Bajo | off |
| 7.3 | **Tips** — fondeo voluntario visitantes | Bajo | on |
| 7.4 | **Scout social** (ConvoHunter-style) — leads | Medio | off |
| 7.5 | **Zora** — Creator Coin / posts → TBA | Medio | off |
| 7.6 | **Yield USDC** (Aave/savings bucket) | Medio | off |
| 7.7 | **Trading / DEX** (`hands`, risk 5 %) | Alto ⚠️ | **off** |

**Orden de intento:** 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6 → 7.7

**Loop:** gasto cerebro ↓ Scout · ingreso ↑ Voice/tips · Dashboard muestra runway.

---

## Descartado / pospuesto

- ❌ Expandir mint VIMS Sepolia
- ⏸ ERC-8004 marketplace
- ⏸ Nostr/Matrix hasta integración estable

---

## Mapa visual

```
Bloque 3 (núcleo)          Bloque 5 (entrada)       Bloque 4 (salida, OPCIONAL)
──────────────────         ──────────────────       ──────────────────────────
1 cablear                  Sentidos (después)         4 TTS
2 memoria                  OCR→STT→visión             5 boca / movimiento
6 fallbacks                                           7 lip-sync ML (opt-in)
3 estética estática        toggles en Dashboard
7 checklist

Dashboard ⚙️ — transversal, desde paso 1
```

---

## Docs clave

| Doc | Uso |
|-----|------|
| [`design-index-20260716.md`](../research/design-index-20260716.md) | **Índice maestro ordenado** |
| [`organ-service-tiers.md`](../research/organ-service-tiers.md) | G / D / E por órgano |
| [`voice-external-income.md`](../research/voice-external-income.md) | Quién paga x402 |
| [`dual-doctor.md`](../research/dual-doctor.md) | Vitality + Hygiene |
| [`self-funding.md`](../self-funding.md) | Autofinanciación TBA |
| [`presence-optional.md`](../presence-optional.md) | Avatar opcional (Bloque 4) |
| [`senses-organ.md`](../senses-organ.md) | Escucha y visión (Bloque 5) |
| [`organ-assembly-catalog.md`](../organ-assembly-catalog.md) | Órganos + sustitutos |
| [`mvp-status.md`](mvp-status.md) | Estado actual |
