# Identidad del personaje — estética fija del creador

> **Estado:** Decisión de producto · **Origen:** 2026-07-13  
> **Principio:** El **personaje** (cara, estética, posiblemente voz) lo define el **creador de la colección**, no el comprador en el mint wizard.

---

## Decisión (fundador, 2026-07-13)

| Dimensión | ¿Quién decide? | ¿Mutable? |
|-----------|----------------|-----------|
| **Personaje / estética** (`image`, `portrait`, diseño) | **Creador** (colección / pipeline interno) | **No** — inmutable por token |
| **Voz** (`voiceId`, perfil TTS) | **Creador** (probablemente fija por personaje) | **No** (orientativo) |
| **Movimiento** (P0 estático → P4 emoción) | Producto / presupuesto / hábitat | **Sí** — capa aparte de “quién es” |
| **Servicios** (cerebro, memoria, chat, runtime) | **Owner** en mint wizard | Sí (con límites del protocolo) |

**En cristiano:** el dueño del NFT configura **cómo funciona el agente** (cerebro, canales, presupuesto). **No** sube una foto ni elige avatar. El personaje **es el que es** — como un coleccionable con arte fijado en el token.

---

## Qué NO va en el mint wizard (UX comprador)

- ❌ Subir imagen / avatar
- ❌ Elegir estilo visual del personaje
- ❌ Cambiar `portrait` o `voiceId` post-mint (salvo error de mint del creador — fuera de alcance owner)

## Qué SÍ va en el mint wizard

- ✅ Nombre / descripción corta (identidad narrativa, no sustituye el arte)
- ✅ Runtime, cerebro, memoria, gateways, presupuesto
- ✅ Tier de **presencia** solo como **calidad de render** (¿se mueve? ¿hay voz en vivo?) — **sin** cambiar el personaje base

---

## Pipeline del creador (fuera del wizard público)

```
Colección / arte interno
    → image + portrait + idleAsset + voiceId (por token o arquetipo)
    → manifiesto pre-rellenado o generado en backend de mint
    → IPFS + agentURI onchain
```

El comprador firma mint con wallet; el manifiesto ya trae el personaje asignado.

| Campo manifiesto | Origen |
|------------------|--------|
| `image` | Creador — metadata ERC-721 estándar |
| `organs.presence.portrait` | Creador — normalmente = `image` |
| `organs.presence.idleAsset` | Creador — bucle/Live2D offline |
| `organs.presence.tts.voiceId` | Creador — voz del personaje |
| `organs.presence.maxTier` | Creador o preset colección; owner no redefine cara |

---

## Movimiento ≠ identidad

```
Identidad (inmutable)     Movimiento (variable)
─────────────────────     ────────────────────
Misma cara                P0 foto fija
Misma voz (si aplica)     P1 bucle idle
Mismo diseño              P2–P4 voz + boca + emoción
```

- En **OpenSea** → casi siempre P0 (foto del personaje).
- En **app ageNFT** → puede subir a P1–P4 si hay presupuesto y servidor.
- El personaje **no cambia**; solo **cómo se anima o se oye en vivo**.

Ver tiers: [`presence-organ.md`](presence-organ.md), contextos: [`presence-context-layers.md`](presence-context-layers.md).

---

## Transferencia de NFT

- La **estética viaja** con el token (`image` en metadata + manifiesto).
- El nuevo owner hereda el **mismo personaje**; reconfigura servicios, no la cara.
- Narrativa de producto: “adoptas a **este** agente”, no “diseñas el tuyo”.

---

## Implicaciones técnicas

| Área | Nota |
|------|------|
| **Schema** | `image` / `presence.portrait` — asignados por creador, no `mintConfiguration` del owner |
| **dApp** | Mostrar `image` del token; sin editor de avatar |
| **OpenSea** | `image` + opcional `animation_url` teaser del **mismo** personaje |
| **Wizard Fase 4.3** | Pasos de servicios; paso “identidad” = nombre + budget, **sin** upload |

---

## Relación con otras piezas

- Presencia (tiers): [`presence-organ.md`](presence-organ.md)
- Mint wizard (servicios): [`mint-configuration-wizard.md`](mint-configuration-wizard.md)
- Hábitats visuales: [`agent-habitats.md`](agent-habitats.md)
- Voz x402: [`presence-voice-stack.md`](presence-voice-stack.md)
