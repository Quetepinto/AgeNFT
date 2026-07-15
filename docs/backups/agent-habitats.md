# Hábitats del ageNFT — dónde vive y dónde se le experimenta

> **Estado:** Mapa de producto · **Origen:** 2026-07-13  
> Última revisión: 2026-07-13

---

## Pregunta central

Un ageNFT no habita **un solo sitio**. Es un **cuerpo digital** que aparece en distintos **hábitats** según quién lo mira y para qué.

```
        ┌─────────────── ageNFT Unit-1 ───────────────┐
        │  Identidad onchain · Memoria · TBA · Motor  │
        └────────────────────┬────────────────────────┘
                             │
     ┌───────────┬───────────┼───────────┬───────────┐
     ▼           ▼           ▼           ▼           ▼
  Web3        Wallet       App         Chat        Juego
  market      (icono)      propia      (texto)     (NPC)
```

---

## Hábitats factibles (por prioridad)

### Tier A — MVP realista (Fase 4–5)

| Hábitat | Qué es | Experiencia presencia | Factibilidad |
|---------|--------|----------------------|--------------|
| **App web ageNFT** | Vuestra web / dApp | Completa P2–P4 | ★★★★★ |
| **Marketplace NFT** (OpenSea, etc.) | Donde se compra/vende | Solo P0 imagen (+ `animation_url` P1) | ★★★★★ |
| **Wallet** (MetaMask, Rainbow…) | Ver NFT en cartera | Icono + metadata | ★★★★★ |
| **Telegram / Discord** | Gateway del motor Hermes | Icono + chat texto | ★★★★☆ |
| **Página orfanato** | Listado adopciones | P1 preview + historia | ★★★★☆ |

### Tier B — Medio plazo

| Hábitat | Qué es | Experiencia | Factibilidad |
|---------|--------|-------------|--------------|
| **App móvil** (iOS/Android) | Cliente nativo o PWA | P2–P3 voz + cara | ★★★★☆ |
| **Widget embed** | `<iframe>` en web de terceros | P2 bucle + chat | ★★★★☆ |
| **Directorio ERC-8004** | Lista pública de agentes | P0 + link a app | ★★★☆☆ (Fase 4+) |
| **Cursor / IDE remote** | Control del agente dev | Texto + estado | ★★★☆☆ |
| **Farcaster / Lens** | Social Web3 | P0 card + link | ★★★☆☆ |

### Tier C — Verticales (Fase 5+)

| Hábitat | Qué es | Experiencia | Factibilidad |
|---------|--------|-------------|--------------|
| **Juego** (Unity, Unreal, Star Atlas…) | NPC o crew member | P2–P4 según SDK | ★★★☆☆ |
| **Mundo VR / spatial** | Metaverso | Avatar 3D derivado | ★★☆☆☆ |
| **Voz sola** (Alexa, altavoz) | Sin pantalla | Solo TTS | ★★★☆☆ |
| **Otro ageNFT** | Agente contrata agente | API A2A, sin UI humana | ★★★★☆ |
| **DAO / Safe** | Agente vota o ejecuta | Sin cara; dashboard | ★★★☆☆ |

---

## Mapa hábitat → contexto de presencia

Ver [`presence-context-layers.md`](presence-context-layers.md).

| Hábitat | Context ID |
|---------|--------------|
| OpenSea | `marketplace-external` |
| Marketplace propio | `marketplace-native` |
| Orfanato | `orphanage` |
| App web | `app-full` |
| Móvil | `app-mobile` |
| Telegram | `chat-gateway` |
| Wallet | `wallet` |
| Juego embed | `game-embed` |

---

## Dónde **no** vive el ageNFT (aclaration)

| No es hábitat | Por qué |
|---------------|---------|
| La blockchain sola | Ahí está la **identidad** y la **cartera**, no la conversación |
| El motor Hermes | Es el **cerebro ejecutor**, invisible al usuario |
| IPFS | Es **almacén** de memoria e imágenes, no interfaz |

El usuario **habita** la experiencia en apps, chats y marketplaces. El ageNFT **ancla** identidad y economía onchain.

---

## Estrategia de producto

1. **Ancla Web3** — NFT + TBA + manifiesto (siempre)
2. **Cara pública** — marketplace con imagen + teaser (gancho)
3. **Hogar principal** — app ageNFT (experiencia completa)
4. **Canales de llegada** — Telegram, widget, invitación trial
5. **Verticales** — juego, DAO, etc. como módulos opcionales (Capa 3 dominio)

**No intentar** que OpenSea muestre lip-sync. **Sí intentar** que desde OpenSea un clic abra la app con el personaje vivo.

---

## Flujo del usuario típico (futuro)

```
Ve teaser en Twitter / OpenSea (P0–P1)
    → Clic "Probar" / mint trial (airdrop)
    → App web (P2–P3) entrenamiento
    → Graduación → owner
    → Uso diario: app + Telegram
    → Opcional: adopta otro desde orfanato
```

---

## Implicaciones infraestructura

| Pieza | Hábitats que sirve |
|-------|-------------------|
| Manifiesto + IPFS | Todos (metadata) |
| Presence Server | app-full, app-mobile, game-embed |
| Hermes gateway | chat-gateway |
| dApp | app-full, marketplace-native, orphanage |
| ERC-8004 | directorios, discovery |
| SDK embed | widget, juegos |

---

## Preguntas abiertas

- [ ] ¿App web primero o Telegram primero para MVP social?
- [ ] ¿PWA suficiente para móvil o app nativa?
- [ ] ¿Un solo dominio `app.agenft.dev` como hogar canónico?
- [ ] ¿Deep link desde OpenSea → app con tokenId?

---

## Referencias

- [`presence-context-layers.md`](presence-context-layers.md)
- [`onboarding-airdrop-orphanage.md`](onboarding-airdrop-orphanage.md)
- [`agenft-collaboration.md`](agenft-collaboration.md)
