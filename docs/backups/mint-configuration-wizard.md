# Mint wizard — configuración de órganos al crear el ageNFT

> **Estado:** Diseño producto · **Origen:** 2026-07-13  
> **Principio:** Al **mintear** (crear el NFT) el owner elige **qué servicios alimentan cada órgano**. Chat y runtime **flexibles** (Hermes, OpenClaw, Telegram, Nostr…).  
> Última revisión: 2026-07-13

---

## Por qué en el mint

El manifiesto (`agentURI`) es el **ADN del cuerpo**. Lo natural es fijar (o preconfigurar) los proveedores **en el momento de nacimiento**, no obligar a editar JSON después.

```
Mint wizard  →  manifiesto v1  →  IPFS  →  agentURI onchain
                      │
                      └── cada órgano apunta a su servicio elegido
```

Post-mint: el **Doctor** puede cambiar fallbacks; cambios graves requieren `setAgentURI` + aprobación owner.

---

## Flexibilidad de chat y runtime

**Un ageNFT, un cerebro** — pero **varias puertas de chat** y **motor intercambiable**:

| Capa | Opciones (ejemplos) | Dónde se elige |
|------|---------------------|----------------|
| **Runtime** (motor) | Hermes Agent, **OpenClaw**, ElizaOS, custom | `runtime.engine` |
| **Chat** (gateways) | Telegram, Nostr, Matrix, Simplex, Discord, WhatsApp* | `gateways.chat[]` |
| **Web** (superficie) | dApp propia, WalletConnect | `gateways.surfaces[]` |

\* WhatsApp: `owner-opt-in`, desactivado por defecto — ver [`chat-habitats-messaging.md`](chat-habitats-messaging.md).

**Hermes y OpenClaw** son candidatos **Capa 1** — ambos pueden exponer Telegram/cron/skills; el manifiesto declara cuál usa **esta instancia**.

```
ageNFT protocol (manifiesto, TBA, budget, memoria)
        │
        └── RuntimeAdapter
                ├── hermes-agent   ← gateway Telegram nativo, skills
                ├── openclaw       ← flexible, workspace integrations
                ├── elizaos        ← Fase 5
                └── custom
```

**Regla:** un motor activo por instancia; **múltiples gateways de chat** en paralelo OK.

---

## Pasos del Mint Wizard (borrador UX)

### Paso 1 — Identidad
- Nombre del agente
- Descripción corta
- Imagen (`image` → IPFS)
- Perfil presupuesto: **A dormante / B conversacional / C activo** → [`spending-budgets.md`](../architecture/spending-budgets.md)

### Paso 2 — Motor (runtime)
| Opción | Para quién |
|--------|------------|
| **Hermes Agent** | Default lab; Telegram, cron, skills |
| **OpenClaw** | Integraciones workspace, flex gateway |
| **ElizaOS** | Avanzado / Fase 5 |
| **Custom** | `run-once` mínimo, sin gateway |

→ escribe `runtime.engine`, `runtime.hosting`

### Paso 3 — Cerebro
- Primary: `tx402.ai` / otro x402 gateway
- Red de pago: Base mainnet USDC
- Fallbacks (opcional, 0–3)

→ `organs.brain`

### Paso 4 — Memoria
- Operacional: toju / lab-remote / IPFS / w3stor
- Archive: none / Arweave (opcional)

→ `organs.memory`

### Paso 5 — Chat (checkboxes, multi-select)
| Gateway | Default lab |
|---------|-------------|
| ☐ Telegram | ☑ recomendado |
| ☐ Nostr | ☐ |
| ☐ Matrix | ☐ |
| ☐ Simplex | ☐ |
| ☐ Discord | ☐ |
| ☐ WhatsApp | ☐ (aviso legal + opt-in) |

→ `gateways.chat[]`, `gateways.policy`

**Nota:** credenciales (bot token, nsec) → **runtime only** tras mint; wizard solo marca `enabled: true`.

### Paso 6 — Presencia (opcional)
- Idle: static / loop-video / live2d
- Max tier: static … emotion
- TTS: dtelecom-x402 / none (Fase 4.5)

→ `organs.presence`

### Paso 7 — Social (opcional)
- ☐ Zora perfil
- ☐ Farcaster (futuro)

→ `social.profiles[]`

### Paso 8 — Colaboración
- Modo: solo / trusted ageNFT list (vacío al mint)

→ `collaborators`

### Paso 9 — Revisar y mint
- Vista resumen órganos + coste estimado mensual
- Wallet firma mint
- Upload manifiesto IPFS → `setAgentURI`
- Pantalla “Conecta Telegram” / “Abre dApp”

---

## Mapa wizard → manifiesto

| Paso wizard | Campos manifiesto |
|-------------|-------------------|
| Identidad | `name`, `description`, `image`, `budget.profile` |
| Motor | `runtime.engine`, `runtime.hosting` |
| Cerebro | `organs.brain` |
| Memoria | `organs.memory` |
| Chat | `gateways` |
| Presencia | `organs.presence` |
| Social | `social` |
| Colaboración | `collaborators` |
| Siempre | `identity`, `treasury`, `organs.reflexes`, `budget` |

---

## Plantillas rápidas (presets)

| Preset | Runtime | Chat | Uso |
|--------|---------|------|-----|
| **Lab Hermes** | hermes-agent | Telegram | Unit-1 |
| **OpenClaw solo** | openclaw | configurable | Devs OpenClaw |
| **Social Web3** | hermes-agent | Nostr + Telegram | Promo |
| **Minimal** | custom | ninguno | Solo scripts/API |
| **Trial** | hermes-agent | Telegram | onboarding 4.6 |

Preset = JSON parcial que el wizard rellena antes de personalizar.

---

## Ejemplo manifiesto post-wizard (fragmento)

```json
{
  "runtime": {
    "engine": "openclaw",
    "hosting": { "primary": "local", "fallbacks": ["vps"] }
  },
  "organs": {
    "brain": {
      "primary": { "provider": "tx402.ai", "endpoint": "https://tx402.ai/v1/chat/completions", "model": "minimax/minimax-m3", "network": "eip155:8453" }
    },
    "memory": {
      "format": "agenft-memory/v1",
      "operational": { "provider": "ipfs", "primary": "ipfs://..." }
    }
  },
  "gateways": {
    "policy": { "whatsapp": "owner-opt-in", "excludedByDefault": ["whatsapp"] },
    "chat": [
      { "platform": "telegram", "enabled": true, "credentials": "runtime-only" },
      { "platform": "nostr", "enabled": true, "relays": ["wss://relay.damus.io"], "sovereign": true }
    ],
    "surfaces": [
      { "type": "web-dapp", "url": "https://app.agenft.dev", "context": "app-full" }
    ]
  }
}
```

---

## Implementación por fases

| Fase | Entregable |
|------|------------|
| **Ahora** | Manifiesto manual + schema + presets JSON en `docs/manifest/presets/` |
| **2.5** | CLI `mint-config.mjs` — preguntas → genera JSON |
| **4.3** | Mint wizard web con wallet |
| **4.6** | Preset `trial` integrado |

---

## RuntimeAdapter (código futuro)

```javascript
// runtime/adapter/index.mjs
const adapters = {
  'hermes-agent': () => import('./hermes-adapter.mjs'),
  'openclaw':     () => import('./openclaw-adapter.mjs'),
  'elizaos':      () => import('./eliza-adapter.mjs'),
  'custom':       () => import('./node-adapter.mjs'),
};
// Lee runtime.engine del manifiesto → carga UN adapter
// gateways.chat → cada adapter registra handlers o delega a bridge
```

Misma interfaz: `loadManifest`, `handleMessage`, `respectBudget`, `syncMemory`.

---

## Preguntas abiertas

- [ ] ¿OpenClaw repo/path canónico en workspace?
- [ ] ¿Un bot Telegram por ageNFT o multi-tenant un bot?
- [ ] ¿Wizard en VIMS mint o solo mint propio Fase 4?
- [ ] ¿Presets como NFT traits visuales en OpenSea?

---

## Referencias

- [`chat-habitats-messaging.md`](chat-habitats-messaging.md)
- [`dapp-surfaces-wallet.md`](dapp-surfaces-wallet.md)
- [`agent-identity.md`](../architecture/agent-identity.md)
- [`development-roadmap.md`](../architecture/development-roadmap.md) § 4.3
