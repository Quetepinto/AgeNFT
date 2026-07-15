# Presencia por contexto — capas según dónde se muestra el ageNFT

> **Estado:** Decisión de diseño · Complementa [`presence-organ.md`](presence-organ.md)  
> **Origen:** 2026-07-13 — la misma cara no se ve igual en marketplace que en la app  
> Última revisión: 2026-07-13

---

## Principio

**Un ageNFT, muchas caras según el hábitat (lugar donde se muestra).**

La calidad visual no depende solo del presupuesto del agente — también de **dónde** lo estás viendo y qué permite ese sitio (tamaño, sonido, GPU, datos).

```
Mismo Unit-1
    ├── OpenSea        → foto fija (P0)
    ├── Marketplace    → foto + clip corto de muestra (P1 preview)
    ├── App ageNFT     → personaje vivo + voz (P2–P4)
    ├── Zora (Base)    → foto + preview en posts; Creator Coin en perfil
    └── Telegram       → icono + chat texto (icon)
```

---

## Dos ejes (no confundir)

| Eje | Qué decide | Ejemplo |
|-----|-----------|---------|
| **Tier técnico** (P0–P4) | Potencia + presupuesto del agente | ¿Puede lip-sync? |
| **Contexto de render** | Reglas del sitio donde se ve | OpenSea solo permite imagen |

El **contexto limita el techo** aunque el agente pueda más.

---

## Contextos de render (borrador)

| Contexto | ID | Máx. tier | Qué ve el usuario |
|----------|-----|-----------|-------------------|
| Marketplace externo | `marketplace-external` | P0 | Imagen estática (estándar ERC-721) |
| Marketplace ageNFT | `marketplace-native` | P1 | Imagen + vídeo preview 3–5 s (IPFS) |
| Orfanato / adopción | `orphanage` | P1 | Imagen + badge "busca hogar" + preview |
| Wallet (MetaMask, etc.) | `wallet` | P0–icon | Icono + nombre; sin animación |
| Explorador blockchain | `explorer` | P0 | Imagen metadata |
| App ageNFT (web) | `app-full` | P4 | Presencia completa según budget |
| App móvil ageNFT | `app-mobile` | P3 | Voz + lip-sync lite; menos GPU |
| Telegram / Discord | `chat-gateway` | `icon` | Avatar pequeño + burbujas texto |
| Zora (Base) | `social-zora` | P1 | Imagen + preview en feed; perfil con Creator Coin |
| Dentro de un juego | `game-embed` | P2–P4 | Según SDK del juego |
| Widget embebido web | `embed-widget` | P2 | Bucle + voz; sin pantalla completa |

---

## Manifiesto — `presence.contexts`

```json
{
  "presence": {
    "portrait": "ipfs://...",
    "idleMode": "loop-video",
    "idleAsset": "ipfs://...preview-loop.webm",
    "previewAsset": "ipfs://...marketplace-teaser.webm",
    "liveMode": "auto",
    "maxTier": "emotion",
    "contexts": {
      "marketplace-external": { "maxTier": "static", "asset": "image" },
      "marketplace-native": { "maxTier": "idle-loop", "asset": "previewAsset" },
      "app-full": { "maxTier": "emotion", "useBudget": true },
      "chat-gateway": { "maxTier": "icon", "asset": "portrait" },
      "wallet": { "maxTier": "icon" },
      "social-zora": { "maxTier": "idle-loop", "asset": "previewAsset" }
    }
  }
}
```

### Assets recomendados por contexto

| Asset | Uso | Dónde se genera |
|-------|-----|-----------------|
| `image` | P0 universal | Mint |
| `previewAsset` | Teaser marketplace | Offline 1× (IA imagen-a-vídeo) |
| `idleAsset` | Bucle en app | Offline 1× |
| `icon` | 64×64 derivado de `image` | Automático al mint |

---

## Selector de render (runtime)

```
Cliente declara contexto (header / query / embed SDK)
    → Presence Server lee presence.contexts[contexto]
    → min(contexto.maxTier, agente.maxTier, budget tier)
    → Render
```

**Nunca** intentar lip-sync en OpenSea — el contexto lo impide antes de gastar presupuesto.

---

## Coherencia de marca

- Misma **identidad visual** (misma imagen base) en todos los contextos
- **Preview** en marketplace = gancho; **experiencia completa** = dentro de app propia
- Incentiva instalar/usar **app ageNFT** para ver al personaje "vivo"

---

## Relación con onboarding

| Fase usuario | Contexto típico | Tier |
|--------------|-----------------|------|
| Ve listing orfanato | `orphanage` | P1 |
| Trial entrenamiento | `app-full` con cap | P2 |
| Owner graduado | `app-full` | P2–P4 según budget |

---

## Preguntas abiertas

- [ ] ¿`animation_url` ERC-721 estándar = `previewAsset` para compatibilidad OpenSea?
- [ ] ¿SDK embed para terceros declara contexto `embed-widget`?
- [ ] ¿Generar `icon` on-the-fly o pin en IPFS al mint?

---

## Referencias

- [`presence-organ.md`](presence-organ.md) — tiers P0–P4
- [`agent-habitats.md`](agent-habitats.md) — dónde vive el ageNFT
- [`onboarding-airdrop-orphanage.md`](onboarding-airdrop-orphanage.md) — orfanato en marketplace
