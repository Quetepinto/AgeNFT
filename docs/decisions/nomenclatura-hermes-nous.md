# Nomenclatura — Hermes (Nous) y capas ageNFT

> **Estado:** Aprobado · **Fecha:** 2026-09-01  
> **Regla:** dentro de este repo solo existe **un** Hermes: el agente OSS de [Nous Research](https://github.com/NousResearch/hermes-agent).

---

## Qué NO nombrar en este proyecto

| Nombre | Estado |
|--------|--------|
| **Hermesclaw** | Agente personal VPS del owner — **fuera** del repo y de la documentación producto |
| «Hermes genérico» ambiguo | Evitar — siempre «Hermes (Nous)» o enlace al repo |

---

## Qué SÍ es «Hermes» aquí

**Hermes (Nous)** = producto OSS completo: gateway (Telegram, Matrix, CLI…), cron, skills, tools, MCPs, configuración versátil. Es el **motor/arnés agéntico** sobre el que decidimos construir ageNFT (MVP).

No es «solo una opción más» en la visión de producto — es el **primer runtime** elegido. Alternativas futuras (OpenClaw, ElizaOS) son **otros motores**, no otro «Hermes». Ver [`runtime-adapters.md`](../research/runtime-adapters.md).

---

## Tres capas (no confundir)

```
┌─────────────────────────────────────────────────────────┐
│  ageNFT — protocolo / cuerpo (SIEMPRE nuestro)          │
│  NFT · TBA · manifiesto · Reflejos · memoria M1-M3 ·    │
│  soul · Doctor · Vigilante · wiring                     │
│                          │                              │
│                   runTurn()  ← API única                  │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│  Hermes (Nous) — arnés   ▼                              │
│  gateway · cron · skills · tools · MCPs · multi-step    │
│  skill agenft-core → obliga a llamar runTurn            │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Cerebro (LLM) — «mente»                                │
│  tx402.ai / modelo del manifiesto · pago desde TBA      │
└─────────────────────────────────────────────────────────┘
```

| Capa | Quién la aporta | ¿Construir desde cero? |
|------|-----------------|------------------------|
| **Cerebro LLM** | Proveedor tx402 (Minimax, etc.) | ❌ No — pagamos/inferimos |
| **Arnés agéntico** | **Hermes (Nous)** | ❌ No — lo instalamos y configuramos |
| **Protocolo ageNFT** | **Este repo** (`run-turn.mjs`, …) | ✅ Sí — es nuestro valor diferencial |

**Hermes no sustituye al LLM** — lo **encauza** (tools, MCPs, multi-paso, gateways).  
**ageNFT no sustituye a Hermes** — añade **soberanía** (NFT, TBA, Reflejos, memoria policy).

---

## Decisión de producto vs atajo MVP (importante)

### Decisión (Jul-2026, sigue vigente)

> MVP = **Hermes (Nous)** + adapter `agenft-run-turn/v1` + skill `agenft-core`.

Manifiesto declara `"runtime": { "engine": "hermes-agent" }`.

### Atajo temporal (no confundir con estrategia)

Para arrancar rápido en VPS existen **puentes directos** que **saltan** el gateway Hermes:

| Puente | Archivo | Qué pierdes al saltar Hermes |
|--------|---------|------------------------------|
| Bot Telegram directo | `telegram-unit-mainnet-bot.mjs` | tools/MCPs Hermes, gateway unificado |
| Chat web directo | `chat-api.mjs` | idem |

Estos llaman `runTurn()` igual — **mismo cerebro ageNFT** — pero **no aprovechan** el ecosistema agéntico de Nous.

**Corrección terminológica:** decir «Hermes opcional» fue impreciso. Lo correcto:

- **Hermes (Nous) es el arnés objetivo del MVP.**
- Los puentes directos son **MVP pragmático** hasta cablear gateway Hermes + skill.

Roadmap: Telegram y cron Doctor **primarios** vía `hermes gateway` + `agenft-core`; puentes directos como fallback o `engine: minimal`.

---

## ¿Estamos construyendo todo un sistema agéntico?

**Respuesta honesta:** construimos **dos cosas distintas**:

| Qué | ¿Lo construimos? | Notas |
|-----|------------------|-------|
| Gateway, tools, MCPs, skills, cron multi-canal | **No** — es Hermes (Nous) | Instalar + skill `agenft-core` |
| NFT, TBA, Reflejos, memoria capas, owner gate, Vigilante, wiring | **Sí** — `runtime/src/*` | Protocolo ageNFT — no lo da Hermes |
| Adapter delgado | **Sí** — skill + scripts en `runtime/hermes/` | ~100 líneas de glue |

**No tiene sentido reimplementar Hermes.** Tampoco tiene sentido **solo** un script que llama al LLM — perderíamos tools, MCPs y gateways.

El equilibrio acordado ([`runtime-adapters.md`](../research/runtime-adapters.md)):

> Toda lógica ageNFT vive en `runTurn()`. Los motores son **wrappers delgados**.

---

## Scripts `npm run hermes:*` en este repo

Los nombres llevan «hermes» por historia del adapter, pero:

| Script | Qué ejecuta realmente |
|--------|------------------------|
| `hermes:turn:pay` | Node local → `run-turn.mjs` (protocolo ageNFT) |
| `hermes:doctor` | Node local → `doctor-probe.mjs` |
| `hermes:install` | Copia skill a `~/.hermes` + cron **del CLI Hermes (Nous)** |

La skill `agenft-core` conecta **Hermes (Nous)** → `hermes:turn:pay` → `runTurn()`.

---

## Alternativas futuras (no son «Hermes»)

| Motor | Cuándo |
|-------|--------|
| **OpenClaw** | Perfil dev / Cursor — mismo `runTurn()` |
| **ElizaOS** | Fase 5 — swap/8004 |
| **minimal** | Solo `chat-api` — sin arnés completo |

Un solo tipo de NFT; cambia `runtime.engine` en manifiesto.

---

## Recordatorio para el agente

1. **Hermes** en este repo = **solo Nous Research**.
2. No mencionar Hermesclaw en docs producto.
3. No presentar Hermes (Nous) como «opcional» en visión — solo admitir puentes MVP temporales.
4. `runTurn()` = protocolo ageNFT; Hermes = arnés; LLM tx402 = mente.

---

## Docs relacionados

- [`runtime-adapters.md`](../research/runtime-adapters.md)
- [`dashboard-onboarding-chat.md`](dashboard-onboarding-chat.md) — § arnés (actualizar si contradice)
- [`runtime/hermes/README.md`](../../runtime/hermes/README.md)
- [`AGENTS.md`](../../AGENTS.md)
