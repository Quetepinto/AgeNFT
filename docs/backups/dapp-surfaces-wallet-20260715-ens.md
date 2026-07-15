# Superficies de acceso — web, wallet, móvil, chat

> **Estado:** Diseño producto · **Origen:** 2026-07-13  
> **Pregunta:** ¿Hace falta solo una app web? ¿Se puede usar dentro de MetaMask, móvil, tablet?  
> Última revisión: 2026-07-13

---

## Respuesta corta

**No necesitáis una sola app web cerrada.** Necesitáis **un cerebro** (runtime) y **varias ventanas** según dónde esté el usuario:

| Dónde | Qué ve / qué hace | ¿Chatear? |
|-------|-------------------|-----------|
| **MetaMask** (ver NFT) | Imagen, nombre, metadata | ❌ solo mirar |
| **Navegador dentro de MetaMask** (móvil) | Vuestra **dApp web** completa | ✅ sí |
| **Chrome/Safari** móvil o tablet | Misma dApp web (responsive) | ✅ sí |
| **Telegram** | Icono + chat | ✅ sí (sin web) |
| **App PWA** (instalable) | Misma web, icono en home | ✅ sí |

La **dApp mínima** es la **página web** que funciona en todos esos navegadores — incluido el **navegador integrado de MetaMask**.

---

## ¿Hace falta app web?

| Pieza | ¿Web obligatoria? |
|-------|-------------------|
| Ver NFT en wallet | ❌ — la wallet ya muestra `image` del manifiesto |
| Chatear con el agente | ⚠️ — **una** interfaz hace falta; puede ser web **o** Telegram **o** ambas |
| Saldo TBA + presupuesto | ✅ cómodo en web; también CLI/scripts para dev |
| Cara animada (futuro) | ✅ web o app móvil |

**MVP recomendado:** **web estática ligera** + **Telegram** — dos puertas, mismo agente.

---

## MetaMask y similares

### Ver el ageNFT en la wallet

- MetaMask, Rainbow, Coinbase Wallet leen **metadata** del NFT (imagen IPFS, nombre).
- Contexto manifiesto: `wallet` → tier **icon** / imagen fija.
- **No chatean** ahí — solo “tienes el Unit-1”.

### Chatear desde MetaMask (móvil)

MetaMask en el **teléfono** trae un **navegador web integrado** (mini navegador dentro de la app).

Flujo:

```
1. Usuario abre MetaMask en el móvil
2. Menú → Browser / Navegador
3. Escribe app.agenft.dev (o enlace desde OpenSea)
4. La web pide "Conectar wallet" → MetaMask firma
5. Usuario chatea en la misma pantalla
```

**Sí es posible** — no es un plugin mágico dentro de la pantalla del NFT; es **vuestra web abierta en el navegador de MetaMask**.

### Escritorio (MetaMask extensión)

- Misma web en Chrome/Firefox + extensión MetaMask
- `window.ethereum` conecta la wallet
- Experiencia **mejor** que en móvil (más espacio)

### Otras wallets

| Wallet | Navegador dApp | Conectar web |
|--------|----------------|--------------|
| MetaMask | ✅ móvil + extensión | ✅ |
| Rainbow | ✅ | ✅ |
| Coinbase Wallet | ✅ Base App / browser | ✅ |
| WalletConnect | — | ✅ desde cualquier web |

Estándar: **una sola dApp web** + **WalletConnect** / **wagmi** = funciona casi en todas.

---

## Móvil y tablet (sin MetaMask)

| Modo | Cómo |
|------|------|
| **Web responsive** | Safari/Chrome; diseño móvil |
| **PWA** | “Añadir a pantalla de inicio” → icono como app |
| **Telegram** | Bot; no necesita web para chat |
| **Deep link** | OpenSea → “Abrir agente” → `https://app.agenft.dev/t/115` |

Tablet = misma web responsive; presencia puede ser tier P2–P3 si hay GPU/servidor.

---

## Arquitectura — un agente, muchas ventanas

```
                    Unit-1 (runtime Hermes)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   dApp web          Telegram bot        (futuro Nostr)
   wagmi/Connect     gateway Hermes
        │
   Abierta en:
   · Chrome desktop
   · Safari móvil
   · Navegador MetaMask
   · PWA
```

**Mismo `tokenId`**, distinto **contexto de presencia** (`app-full` vs `chat-gateway`).

---

## dApp mínima — qué incluir (Fase 2.5)

| Bloque | Contenido |
|--------|-----------|
| Cabecera | Imagen Unit-1 (`image` manifiesto) |
| Wallet | Conectar MetaMask / WalletConnect |
| Tesoro | Saldo USDC/ETH de la **TBA** (solo lectura) |
| Presupuesto | Estado Reflejos (`npm run budget` vía API o estático JSON) |
| Chat | Enlace Telegram **o** chat embebido (API después) |
| Pie | “Beta · términos” + enlace OpenSea |

**Tecnología ligera:** HTML + JS estático, o Vite + **wagmi** / viem — sin backend pesado al inicio.

### Chat embebido en web (fases)

| Fase | Chat en web |
|------|-------------|
| MVP | Botón “Abrir en Telegram” |
| 2.5+ | iframe/widget o API SSE al runtime |
| 4+ | Voz + presencia en la misma página |

---

## OpenSea → agente

En la página del NFT (OpenSea):

- Botón **“Hablar con este agente”** → `https://app.agenft.dev/agent/115`
- Abre en navegador normal **o** en navegador MetaMask si el usuario prefiere

Esto une **marketplace** (solo foto) con **hogar** (chat).

---

## ¿App nativa iOS/Android?

| | Web + PWA | App nativa |
|--|-----------|------------|
| Coste | Bajo | Alto |
| MetaMask browser | ✅ | Deep link a wallet |
| Push notifications | Limitado (PWA) | Mejor |
| Recomendación MVP | ✅ **sí** | Fase 4+ si tracción |

---

## Manifiesto — superficies (borrador)

```json
{
  "gateways": {
    "surfaces": [
      { "type": "web-dapp", "url": "https://app.agenft.dev/agent/115", "context": "app-full" },
      { "type": "telegram", "handle": "@Unit1Bot", "context": "chat-gateway" },
      { "type": "wallet-metadata", "context": "wallet" }
    ]
  }
}
```

---

## Hosting y dominio

### ¿Cómo se publica la dApp?

La dApp mínima es **web estática** (HTML + JS, sin servidor pesado). Se sube a un host y el usuario abre la URL en cualquier navegador (o en el navegador de MetaMask).

```
Código (Vite/HTML estático)
    → build/ carpeta estática
    → host (ver tabla abajo)
    → URL en manifiesto gateways.surfaces[].url
```

| Fase | Host | URL ejemplo | Notas |
|------|------|-------------|-------|
| **Lab** | GitHub Pages / IPFS pin | `https://openclaw.github.io/agenft/` | Gratis, rápido para MVP |
| **Producto** | Cloudflare Pages / Vercel | `https://app.agenft.dev` | Dominio `.com/.dev` clásico + HTTPS |
| **Cripto-native** | IPFS + ENS | `https://unit1.eth.limo` | Dominio `.eth` vía gateway |

### ¿Puede ser un dominio `.eth`?

**Sí.** ENS (Ethereum Name Service) permite que un nombre como `unit1.eth` o `agenft.eth` apunte a tu web.

Hay **dos modelos**:

| Modelo | Cómo funciona | Pros | Contras |
|--------|---------------|------|---------|
| **A — ENS → IPFS** | Registras `agenft.eth`, subes el build a IPFS, pones el CID en el registro ENS (`contenthash`) | Muy alineado Web3; la URL “vive” onchain | Hay que actualizar CID en cada deploy; gateways `.limo` / `.link` a veces lentos |
| **B — ENS → DNS** | ENS como DNS para subdominios (`app.agenft.eth` → servidor normal) | Deploy fácil (Vercel/CF); HTTPS estable | Menos “puro” descentralizado; requiere DNS bridge ENS |

**En la práctica para ageNFT:**

1. **MVP lab:** dominio normal o GitHub Pages — no complicar.
2. **Cuando tengáis marca:** registrar **`agenft.eth`** (o `unit1.eth` por agente/colección).
3. **Ruta híbrida recomendada:**
   - `agenft.eth` → landing / enlace al manifiesto
   - `app.agenft.eth` o gateway `https://agenft.eth.limo` → dApp estática en IPFS
   - OpenSea y wallets leen `external_url` del NFT → misma URL

### Gateways ENS (cómo se abre en el navegador)

Los navegadores **no** entienden `.eth` solos. Se usa un **gateway HTTPS**:

| Gateway | URL resultante |
|---------|----------------|
| eth.limo | `https://agenft.eth.limo` |
| eth.link (Cloudflare) | `https://agenft.eth.link` |
| dweb.link (IPFS) | `https://dweb.link/ipfs/<CID>` |

MetaMask móvil, Safari y Chrome abren esas URLs igual que cualquier web.

### Flujo ENS + IPFS (cristiano)

```
1. npm run build          → carpeta dist/
2. Pin a IPFS             → CID bafybei...
3. Registrar en ENS       → contenthash = CID
4. Usuario visita         → https://agenft.eth.limo
5. Conecta wallet         → ve Unit-1, TBA, budget, enlace Telegram
```

El **runtime Hermes** sigue en tu máquina/VPS — la dApp estática solo **lee** datos onchain (TBA, NFT) y muestra estado; no aloja el cerebro.

### ¿Qué va en el manifiesto?

```json
"gateways": {
  "surfaces": [
    { "type": "web-dapp", "url": "https://agenft.eth.limo/agent/115", "context": "app-full" },
    { "type": "web-dapp", "url": "https://app.agenft.dev/agent/115", "context": "app-full", "note": "mirror HTTPS" }
  ]
}
```

Podéis tener **varias URLs** (ENS + dominio clásico) apuntando al mismo build.

### Costes orientativos

| Pieza | Coste |
|-------|-------|
| Registrar `agenft.eth` | ~$5–50/año según longitud del nombre (gas ETH) |
| Pin IPFS (Pinata, web3.storage, toju) | Gratis–pocos $/mes |
| GitHub Pages / Cloudflare | Gratis tier |
| Hermes runtime (chat) | VPS local — ya lo tenéis |

---

## Preguntas abiertas

- [ ] ¿Dominio `app.agenft.dev` o path en GitHub Pages primero?
- [ ] ¿Registrar `agenft.eth` en Fase 2.5 o esperar a Bloque 3 (OpenSea)?
- [ ] ¿ENS contenthash (IPFS puro) o ENS DNS → Cloudflare?
- [ ] ¿WalletConnect obligatorio además de MetaMask?
- [ ] ¿Chat web en MVP o solo Telegram basta?

---

## Referencias

- [`agent-habitats.md`](agent-habitats.md)
- [`presence-context-layers.md`](presence-context-layers.md)
- [`chat-habitats-messaging.md`](chat-habitats-messaging.md)
- [`next-steps-20260713.md`](lab/next-steps-20260713.md)
