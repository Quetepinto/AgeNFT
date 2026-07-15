# Próximos pasos — prioridad jul 2026

> **Estado:** Plan de acción · **Origen:** 2026-07-13  
> **Contexto:** Fase 2 ~80%; mucha investigación Fase 4–5 documentada; comercialización light definida.  
> Última revisión: 2026-07-13

---

## Regla de oro

> **Primero un agente que funciona de punta a punta para un humano no técnico.**  
> Después OpenSea, Zora, cara animada, trial masivo.

La investigación (presencia, Zora, Nostr, Livepeer, comercio) **no se tira** — se ejecuta en orden.

---

## Dónde estamos

| Hecho ✅ | Pendiente ⏸ |
|---------|-------------|
| Unit-1 mint + manifiesto | ~~Hermes integrado de verdad (2.4)~~ ✅ core + doctor cron |
| Pago x402 cerebro (EOA) | Gateway Telegram (2.4 resto) |
| Budget + dormant | dApp mínima |
| Memoria + restart test | Doctor / cron |
| Transfer 7/7 | Producto público |

**Decisión runtime:** Hermes MVP (no Eliza ahora).  
**Decisión producto:** OSS + OpenSea después del loop cerrado.  
**Decisión social:** Telegram → Nostr → Matrix; WhatsApp owner opt-in.

---

## Orden recomendado (4 bloques)

### Bloque 1 — Cerrar Fase 2 (1–2 semanas) ★ AHORA

Objetivo: **“Unit-1 vivo en Hermes”** sin scripts sueltos.

| # | Tarea | Por qué |
|---|-------|---------|
| 1 | **Hermes `agenft-core` operativo** — manifiesto + budget antes de cada inferencia | ✅ `hermes:turn` + skill + verify 6/6 |
| 2 | **Cron Doctor lite** — probe tx402 cada 15 min, log estado | ✅ `agenft-unit1-doctor` |
| 3 | **dApp estática mínima** — imagen NFT, saldo TBA, budget, enlace chat | ✅ `dapp/` + workflow Pages |
| 4 | **README quickstart** “habla con Unit-1 en 5 min” | Para promo temprana |

**No hacer aún:** Zora, OpenSea colección pública, MuseTalk, trial airdrop.

**Criterio “Fase 2 cerrada”:** owner abre web → ve Unit-1 → chatea vía Hermes/Telegram → budget se actualiza.

---

### Bloque 2 — Demostración vendible (2–3 semanas)

Objetivo: algo que puedas **enseñar o grabar** en un vídeo de 2 min.

| # | Tarea |
|---|-------|
| 5 | **Telegram bot** Unit-1 (gateway Hermes) |
| 6 | **Página `/terms` + disclaimer beta** (comercialización light) |
| 7 | **Vídeo idle** o imagen en dApp (tier P0–P1 presencia) |
| 8 | **1 página** “qué viaja al transferir” (UX onboarding 2.3) |

**Opcional si hay tiempo:** probe **dTelecom TTS** x402 (voz, sin UI compleja).

---

### Bloque 3 — Primer mercado (Fase 4 lite, 3–4 semanas)

Objetivo: **alguien que no eres tú** mintea o adopta.

| # | Tarea |
|---|-------|
| 9 | Colección **OpenSea Sepolia** o mainnet (2–5 agentes lab) |
| 10 | **Orfanato** narrativo (1–2 NFTs de prueba) |
| 11 | **Trial offchain** primero; mint trial después |
| 12 | Wallet proyecto separada + export txs |

Ver [`commercialization-light.md`](commercialization-light.md).

---

### Bloque 4 — Diferenciadores (cuando Bloque 3 tenga señal)

| Track | Cuándo |
|-------|--------|
| Presencia P2–P3 (voz + boca) | dTelecom + MuseTalk lab |
| Zora perfil Unit-1 | Fase 4.7 |
| Nostr npub agente | Tras Telegram estable |
| TBA paga x402 | Soberanía económica |
| ERC-8004 mainnet | Marketplace serio |
| Livepeer stream | Escala vídeo |

---

## Qué NO haría ahora

- ❌ Montar Eliza + AgentAccountV2 (spike ya respondió)
- ❌ Contratos TrialMint onchain (manual primero)
- ❌ Avatar IA Livepeer producción
- ❌ SL / marca registrada (hasta ingresos)
- ❌ WhatsApp gateway
- ❌ Documentar más sin ejecutar Bloque 1

---

## Si solo puedes 3 días esta semana

```
Día 1: Hermes agenft-core — un mensaje Telegram → run-once con budget
Día 2: dApp estática (balance + chat link + imagen Unit-1)
Día 3: Cron probe + grabar demo 90 s para ti mismo
```

---

## Métrica de éxito intermedia

> Un amigo no técnico conecta wallet, ve Unit-1, manda mensaje por Telegram, recibe respuesta, y entiende que **al comprar el NFT se lleva todo eso**.

Cuando eso pase → OpenSea y promo con confianza.

---

## Referencias sesión 2026-07-13

| Doc | Tema |
|-----|------|
| [`commercialization-light.md`](commercialization-light.md) | OSS, OpenSea, impuestos después |
| [`presence-organ.md`](presence-organ.md) | Cara y voz |
| [`chat-habitats-messaging.md`](chat-habitats-messaging.md) | Telegram, Nostr… |
| [`social-habitats-zora.md`](social-habitats-zora.md) | Zora |
| [`onboarding-airdrop-orphanage.md`](onboarding-airdrop-orphanage.md) | Trial y orfanato |
| [`spike-web3-runtime-comparison.md`](spike-web3-runtime-comparison.md) | Hermes vs Eliza |
