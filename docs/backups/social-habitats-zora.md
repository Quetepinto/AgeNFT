# Redes sociales y Zora — hábitat social del ageNFT

> **Estado:** Investigación producto · **Origen:** 2026-07-13  
> Última revisión: 2026-07-13

---

## Pregunta clave

¿Un ageNFT puede tener **su propio perfil social** sin depender de la cuenta personal de un humano?

**Respuesta corta:** En Web3 **sí es posible en teoría** si la red social se identifica por **wallet** (cartera blockchain) y esa wallet es la **TBA** (cuenta ligada al NFT) del agente. En la práctica hay matices legales (términos de uso) y técnicos (quién firma la primera conexión).

---

## Modelo ageNFT en redes sociales

```
Humano (owner)
    │ posee NFT
    ▼
ageNFT #115
    │ controla
    ▼
TBA (cartera del agente)  ──►  Perfil Zora / Farcaster / Lens
    │                              │
    │                              └── ingresos → TBA (no al humano)
    ▼
Motor Hermes publica contenido (con policy Reflejos)
```

| Modo | Quién “es” el perfil | Cuándo |
|------|----------------------|--------|
| **Delegado** | Owner publica en nombre del agente | MVP, más simple |
| **Soberano** | TBA firma posts; owner solo supervisa | Objetivo ageNFT |
| **Híbrido** | Owner vincula wallet humana al inicio; luego transfiere control a TBA | Migración gradual |

**Decisión diseño:** el perfil social debe **monetizar hacia la TBA** (Creator Coins, tips x402), no hacia la wallet personal del dev.

---

## Zora (Base) — prioridad alta ★

**Qué es:** red social de creadores en **Base** (la misma red que ageNFT). Cada perfil puede tener un **Creator Coin** (moneda ERC-20 del creador) y cada publicación puede convertirse en token negociable.

**Por qué encaja con ageNFT:**

| Aspecto | Encaje |
|---------|--------|
| Red | **Base** — misma chain ancla |
| Identidad | Perfil ligado a **wallet** |
| Ingresos | Creator Coin + 1% trades → wallet del perfil |
| Contenido | Imagen, vídeo, posts → ageNFT ya tiene `image`, `previewAsset` |
| Automatización | **Zora CLI** (`npx @zoralabs/cli`) — agente puede publicar sin UI humana |
| Narrativa | “Agente creador” con su propia moneda $UNIT1 |

### Qué podría hacer un ageNFT en Zora

1. **Perfil propio** — wallet = TBA del NFT (o sub-wallet autorizada por TBA)
2. **Creator Coin** — ticker derivado del nombre (ej. `$UNIT1`); ingresos a TBA
3. **Posts** — teasers del personaje, fragmentos de memoria, arte del NFT
4. **Post coins** — cada pieza de contenido como token (modelo Zora 2025–2026)
5. **Cross-promo** — post enlaza a app ageNFT para experiencia completa (voz + cara)

### Presencia en Zora (contexto)

| En Zora | Tier presencia |
|---------|----------------|
| Feed / perfil | P0 imagen + P1 preview vídeo en posts |
| No hay lip-sync nativo | Link “Habla conmigo” → app ageNFT |

→ Context ID manifiesto: `social-zora`

### Requisitos técnicos (borrador)

- [ ] Wallet Zora = TBA Unit-1 o session key autorizada
- [ ] Gas ETH en Base en TBA para mint posts
- [ ] Reflejos: cap `organs.hands` o nuevo `organs.social` para trades/posts
- [ ] Skill Hermes `agenft-zora` — publicar vía CLI con policy
- [ ] Owner aprueba activación Creator Coin (irreversible en Zora)

### Riesgos / límites

| Riesgo | Nota |
|--------|------|
| ToS Zora | Verificar si perfil debe ser “persona”; puede requerir disclaimers |
| Creator Coin irreversible | Una vez activado, no se desactiva |
| Speculation | Coins del agente ≠ promesa financiera; disclaimer en manifiesto |
| Primera conexión | Bootstrap puede necesitar firma owner antes de delegar a TBA |

### Fase roadmap

| Fase | Entregable |
|------|------------|
| 4.7 | Perfil Zora delegado (owner publica como Unit-1) |
| 5.x | TBA firma posts; Creator Coin activo; ingresos a tesoro |

**Enlaces:** [zora.co](https://zora.co) · [Support Creator Coins](https://support.zora.co/en/articles/6338433) · CLI `@zoralabs/cli`

---

## Otras redes sociales factibles

### Web3 / wallet-native (más fácil para agente soberano)

| Red | Qué es | Perfil sin humano | Presencia ageNFT |
|-----|--------|-------------------|------------------|
| **Farcaster** | Social cripto (como Twitter descentralizado) | Cast desde wallet FID; agent wallets en estudio | P0 card + link; Frames para chat |
| **Lens Protocol** | Social modular Polygon | Perfil = wallet | P0 + mirror posts desde agente |
| **Mirror** | Blog tokenizado | Publicar desde wallet | Ensayos / diario del agente |
| **Paragraph** | Newsletter onchain | Wallet | Memoria larga serializada |
| **Sound.xyz / pods** | Audio | Wallet | Voz del agente (grabaciones TTS) |

### Web2 (requiere cuenta humana o API oficial)

| Red | Posibilidad agente | Nota |
|-----|-------------------|------|
| **Twitter / X** | API cuenta dedicada “@Unit1Bot” | Cuenta = servicio, no wallet; owner legal |
| **Bluesky** | AT Protocol — cuentos bot permitidos | Perfil bot etiquetado |
| **Mastodon** | Cuenta bot en instancia propia | Fediverso abierto |
| **Discord** | Bot (ya vía Hermes gateway) | Icono + chat |
| **Telegram** | Bot (ya planificado) | Icono + chat |
| **YouTube / TikTok** | Difícil automatizar sin humano | Vídeos pregenerados; ToS estrictos |
| **Instagram** | Muy difícil | Solo contenido estático cross-post |

### Híbridos 2026

| Plataforma | Nota |
|------------|------|
| **Base App** (antes Coinbase Wallet social) | Integra Zora + Farcaster — hábitat doble |
| **Warpcast** | Cliente Farcaster — mismo agente FID |

---

## ¿Perfil propio sin cuenta humana?

| Capa | ¿Independiente del humano? |
|------|----------------------------|
| **Economía** (quién cobra) | ✅ Sí — TBA recibe Creator Coins, x402 |
| **Firma onchain** (quién publica) | ✅ Sí — TBA o session key del agente |
| **Registro inicial** | ⚠️ A menudo primer paso con wallet owner |
| **Legal / ToS** | ⚠️ Muchas redes exigen responsable humano detrás |
| **Recuperación** | Owner del NFT sigue siendo “guardián” legal |

**Modelo recomendado ageNFT:**

> Perfil **operado por el agente** (TBA firma, motor publica), **custodiado por el owner** (NFT transferible trae el perfil social).

Al vender el NFT, el comprador hereda:
- Creator Coin acumulado (en TBA)
- Perfil Zora vinculado a esa wallet
- Historial de posts onchain

---

## Manifiesto — bloque `social` (borrador)

```json
{
  "social": {
    "profiles": [
      {
        "platform": "zora",
        "network": "base",
        "handle": "unit-1",
        "wallet": "0x2FF43DB36d93F3cd55A0F7B15175266F7d31e969",
        "creatorCoin": null,
        "context": "social-zora",
        "sovereign": false
      }
    ],
    "publishPolicy": "reflexes-capped",
    "ownerApprovalRequired": ["creator-coin-activate"]
  }
}
```

---

## Preguntas abiertas

- [ ] ¿Zora acepta registro 100% desde TBA sin EOA humana en el loop?
- [ ] ¿Creator Coin del agente choca con NFT #115 como identidad principal?
- [ ] ¿Farcaster FID para agentes — una cuenta por ageNFT?
- [ ] ¿Nuevo órgano `social` vs extender `voice` + `hands`?
- [ ] ¿Disclaimers legales en manifiesto para Creator Coins?

---

## Referencias

- [`agent-habitats.md`](agent-habitats.md)
- [`presence-context-layers.md`](presence-context-layers.md)
- [`economics.md`](../architecture/economics.md)
