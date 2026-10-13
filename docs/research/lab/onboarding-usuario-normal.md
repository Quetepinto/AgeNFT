# Prueba con usuario no técnico — ageNFT / URUIRU

> **Estado:** protocolo de prueba · **2026-08-31**  
> Objetivo: ver si alguien con uso medio de IA y **conocimiento cero o casi cero de cripto** puede usar el agente.

---

## Perfil objetivo

- Usa ChatGPT, Gemini o similar en el móvil.
- No tiene MetaMask o nunca ha enviado cripto.
- No conoce NFT, IPFS, tx402, TBA.

---

## Qué le envías (mínimo)

1. Enlace al bot: **https://t.me/Unit1_agent_bot**
2. Enlace a la guía: **`settings.html`** en la dApp (GitHub Pages o tu despliegue).
3. Un solo mensaje de contexto, por ejemplo:

   > «URUIRU es un bot de Telegram. Abre el enlace, pulsa Iniciar y escribe hola. Si te pierdes, abre la guía (segundo enlace). No hace falta instalar nada de dinero digital.»

**No envíes** en la primera prueba: Lab Studio, transfer.html, MetaMask, VPS, Matrix, OmniRoute.

---

## Qué observar (sin ayudar demasiado)

| Pregunta | Éxito mínimo |
|----------|----------------|
| ¿Encuentra el bot en Telegram? | Sí, en &lt; 2 min |
| ¿Recibe respuesta? | Sí, tras esperar &lt; 30 s |
| ¿Entiende que no necesita wallet? | Sí, tras leer caja verde en guía |
| ¿Confunde URUIRU con otro bot? | Anotar si pasa |
| ¿Llega a recargar hucha solo? | **No esperado** en v0 — anotar frustración |

---

## Criterio «prototipo usable»

- **Pasa:** abre Telegram → chatea → entiende quién es URUIRU.
- **Pasa con fricción:** tarda pero llega; anotar dónde se atascó.
- **No pasa:** no encuentra bot, cree que debe pagar ChatGPT, instala MetaMask innecesariamente.

---

## Mejoras ya en dashboard (`settings.html`)

- Pasos numerados Telegram-only.
- Caja «no necesitas cripto para chatear».
- Glosario en castellano (NFT, hucha, USDC…).
- FAQ (DORMANT, URUIRU vs nombre del bot en Telegram).
- Canales con etiquetas «recomendado» / «en preparación».

---

## Siguiente iteración (según feedback)

- Vídeo corto embebido (opcional).
- Botón «Abrir Telegram» más grande en móvil.
- Estado en vivo «agente despierto / dormido» sin jerga.
- Matrix URUIRU cuando exista bot propio.
- Wizard recarga hucha con capturas (solo owners).

---

## Docs relacionados

- [`owner-dashboard.md`](../owner-dashboard.md) — visión producto.
- [`transfer.html`](../../dapp/transfer.html) — para compradores, no primera prueba.
