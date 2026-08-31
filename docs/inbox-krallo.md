# Inbox Krallo

Cosas dichas en chat, para no perderlas. El agente responde debajo con lo que hay **hoy** en el repo (no de memoria).

---

## 2026-08-28

### 1. ¿Qué se puede editar en el contrato una vez minteado?

**Pregunta:** qué metadatos o datos se pueden editar en el contrato cuando el AgeNFT ya está minteado; si es que se puede editar algo.

**Hoy, en el contrato desplegado (`AgeNFT.sol` en Base): casi nada del NFT.** No hay `setAgentURI` ni `setTokenURI`. Al mintear se graba y se queda.

| Qué | ¿Se cambia on-chain después del mint? | En castellano |
|-----|----------------------------------------|---------------|
| Número del token (`tokenId`) | No | Es el DNI. Unit-Mainnet es el **#1**. |
| Nombre en el registro (`name`) | No | Quedó “Unit-Mainnet”. |
| `agentURI` / `tokenURI` | No | El puntero a la ficha/manifiesto. Los dos son el **mismo** texto. |
| Dirección de la TBA (cartera del NFT) | No | Nace en el mint, ligada al token. |
| Contrato y cadena | No | Base, `0x76FC…eB839`. |
| **Dueño del NFT** | Sí: **transferir** | Vender o enviar el token cambia `ownerOf`. No es editar metadatos; es cambiar de manos. |
| **Dueño del contrato** (colección) | Sí: `Ownable` | El que desplegó puede pasar el mando de la *colección*. No reescribe el #1. |
| Saldo de la TBA (USDC, ETH) | Sí, es una cartera | Meter/sacar fondos. No es metadata del NFT. |

**Off-chain sí se toca** (no pasa por el contrato): memoria, cables (`wiring`), runtime, dApp, Telegram. Eso no actualiza lo que OpenSea lee del `tokenURI`.

**Unit-Mainnet #1:** el `agentURI` del mint es un `data:…` (el JSON va *dentro* del puntero). No puedes “subir otro IPFS” y que el NFT apunte solo: el texto on-chain no se puede cambiar.

**Previsto, no desplegado:** un `setAgentURI` en un contrato v2, con transacción y gas, para publicar un manifiesto nuevo. La URI vieja seguiría existiendo como histórico. Doc: [`architecture/onchain-immutable-vs-editable.md`](architecture/onchain-immutable-vs-editable.md).

---

### 2. ¿Hay un agente/instancia (Cursor) para testar y auditar seguridad, como en el arnés?

**Pregunta:** en Arnés se habló de un agente o instancia (creo que en Cursor) para testar lo hecho y poner a prueba la seguridad. ¿AgeNFT lo tiene contemplado?

**En el arnés:** se diseñó un rol **adversario** (otro agente, no el que implementa, no el que cierra). No se creó perfil Hermes; era política + receta pendiente.

**En AgeNFT, parcialmente, y no es ese rol:**

| Pieza | Qué es | Estado |
|-------|--------|--------|
| Tests Foundry (`contracts/test/AgeNFT.t.sol`) | Prueba de mint + TBA en fork de Base | Hay **un** test |
| `organ-assembly-audit.mjs` | Lista de órganos/esenciales | Script de catálogo, no ataque |
| Doctor **Vitality** (`doctor-probe`) | ¿Está vivo? saldo, cerebro responde | ✅ hoy (chequeo #1) |
| Doctor **Hygiene** | CVE, `npm audit`, fugas, trackers | 📐 diseño; **H2+ pendiente**. mvp-status #18 ⏸ |
| Checklist deploy | “Audit mínimo (slither / manual)” | Casilla de spec, no un agente |
| Agente Cursor **adversario** (romper + no autoaprobarse) | Como en el arnés | **No está.** Ni perfil, ni receta, ni skill |

Hygiene **no sustituye** una auditoría humana profesional si hay mucho valor en la TBA. Tampoco es un tester que intente romper el producto a propósito.

**Hueco a decidir:** ¿copiamos el molde del arnés (ficha de trabajo + otro agente Cursor que solo ataca, y los hallazgos entran como comprobaciones) o esperamos a Hygiene H2 (`npm audit` en cron)?

---

## 2026-08-31

### Pendientes acordados en chat

| # | Tarea | Detalle |
|---|-------|---------|
| P1 | **Matrix → URUIRU** | Cablear bot Matrix al Motor. MXID objetivo: `@uruiru:bo5bvc.duckdns.org` (display name **URUIRU**, no “Unit-Mainnet”). Requiere `matrix-bot.mjs` + registro en Synapse + edge gateway/runtime. |
| P2 | **Telegram nombre URUIRU** | Bot usa `AGENFT_TELEGRAM_DISPLAY_NAME=URUIRU`; al arrancar llama `setMyName` + `setMyDescription`. El **@username** (`Unit1_agent_bot`) solo cambia en @BotFather si quieres otro handle. |
| P3 | **OmniRoute hose (lab)** | Gateway gratis en `:20128` para pruebas sin gastar TBA. Ver [`docs/research/lab/omniroute-hose.md`](research/lab/omniroute-hose.md). |
| P4 | **Hermesclaw + OmniRoute** | Perfil opcional apuntando a `http://127.0.0.1:20128/v1` + `auto/best-free`. Script: `scripts/omniroute/wire-hermesclaw.sh`. |

### ¿Qué es “hose” (manguera)?

Metáfora del manifiesto ageNFT: el **owner enchufa su propia manguera** de LLM (API key, OmniRoute, Ollama…) al agente. **No sale USDC de la TBA** — es tier **E / lab**, no el cerebro soberano de producto (tx402). Útil para probar barato; el NFT “de verdad” sigue pagando con su cartera.

