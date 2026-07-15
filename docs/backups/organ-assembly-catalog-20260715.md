# Catálogo de órganos y servicios sustitutos

> **Para qué sirve:** saber qué piezas son **imprescindibles** para que un ageNFT funcione, qué alternativas hay para cada una, y cómo compararlas antes de montar o transferir un agente.
>
> **Última revisión:** 2026-07-15 · **Lab:** Unit-1 #115

---

## Cómo leer este documento

### Niveles de criticidad del órgano

| Nivel | Significado | Si falta… |
|-------|-------------|-----------|
| **E1 — Esencial** | Sin esto no hay agente vivo | El cuerpo no arranca o no puede pensar/pagar |
| **E2 — Esencial (≥1)** | Hace falta **al menos una** puerta al mundo exterior | El agente existe pero nadie puede hablar con él |
| **O-R — Opcional recomendado** | No bloquea el MVP; mejora salud y resiliencia | Funciona, pero más frágil |
| **O-N — Opcional nicho** | Capacidad extra (ingresos, cara, DeFi…) | El agente sigue siendo un chat básico |

### Dimensiones de cada servicio

| Dimensión | Valores posibles |
|-----------|------------------|
| **Precio** | Gratis · De pago (micro-USDC/request) · De pago (suscripción ~$X/mes) · Solo gas |
| **Registro** | Ninguno (solo wallet) · Wallet + firma · Email · Teléfono · API key humana · Mixto |
| **Código** | OSS · Protocolo abierto · Propietario · Híbrido (OSS + servicio cerrado) |
| **Topología** | Descentralizado · Federado · Centralizado |
| **Soberanía agente** | ✅ El agente paga/usa sin cuenta humana · ⚠️ Parcial · ❌ Requiere humano |
| **Post-transfer** | ✅ Sigue igual tras `transfer()` · ⚠️ Reconfig mínima · ❌ Hay que re-registrar |
| **Self-host** | No · Parcial (puedes montar nodo propio) · Sí (obligatorio) |
| **Lab Unit-1** | ✅ Probado · ⚙️ Configurado · ⏳ Pendiente · ❌ Descartado |

### Dimensiones extra (útiles para decidir)

| Dimensión | Por qué importa |
|-----------|-----------------|
| **Failover** | ¿Hay 2ª opción en el manifiesto si el primario cae? |
| **DORMANT** | ¿El agente puede quedarse en modo lectura sin gastar? |
| **Datos salen del dispositivo** | Privacidad: ¿el texto/audio sale a un tercero? |
| **Estimación runway** | Con 5 USDC en TBA, ¿cuántos días de chat? (ver `spending-budgets.md`) |

---

## Mapa rápido — Unit-1 hoy

| Órgano | Criticidad | Estado lab | Servicio activo |
|--------|------------|------------|-----------------|
| Identidad | E1 | ✅ | ERC-8004 #115 |
| Manifiesto (`agentURI`) | E1 | ✅ | `unit-1-lab.json` |
| Tesoro (TBA) | E1 | ✅ | `0x2FF43…e969` |
| Cerebro | E1 | ✅ | tx402.ai (wallet lab EOA*) |
| Memoria | E1 | ✅ | lab-remote + cápsula local |
| Reflejos | E1 | ✅ | `budget.organs.*` |
| Runtime | E1 | ✅ | Hermes local + cron doctor |
| Gateways chat | E2 | ⚙️ | Telegram (systemd); Nostr/Matrix off |
| Gateways web | E2 | ✅ | GitHub Pages dApp |
| Doctor | O-R | ✅ | `agenft-unit1-doctor` 15 min |
| Scout | O-N | ⏳ | `enabled: false` |
| Voz (cobrar) | O-N | ⚙️ | x402 service registrado; endpoints vacíos |
| Presencia | O-N | ⏳ | P0 estático; TTS/lip-sync pendiente |
| Manos (DeFi) | O-N | ⏳ | `enabled: []` |
| Gas | E1* | ✅ | Implícito en cada TX onchain |
| Manguera (hose) | O-N | ⏳ | Owner aporta LLM key (no cuenta TBA) |
| Privacidad (Nym…) | O-N | ⏳ | `enabled: false` |
| Reputación | O-N | ⏳ | ERC-8004 disponible; sin scores aún |
| Colaboradores | O-N | ⏳ | `trusted: []` |

\* *Hoy el cerebro paga desde EOA de lab, no desde TBA — pendiente migrar.*

**Auditoría ejecutable:**

```bash
node scripts/validation/organ-assembly-audit.mjs 115
```

---

## E1 — Identidad

**Qué hace:** el DNI onchain del agente (`agentId`, NFT, registro ERC-8004). No cambia al transferir.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **ERC-8004 Identity Registry** (EVM) | Solo gas mint (~$0.01–0.50 según red) | Wallet | Protocolo abierto | Onchain L2 | ✅ | ✅ | No | ✅ |
| **ERC-721 propio / Agent-NFT** | Gas mint | Wallet | OSS (contratos) | Onchain | ✅ | ✅ | No | ✅ |
| **Metaplex NFT** (Solana) | ~0.01 SOL | Wallet | OSS | Onchain | ✅ | ✅ | No | ⏳ |
| **AAWP Soulbound** | — | — | — | — | ❌ | ❌ | — | ❌ |
| **Cuenta SaaS “agent ID”** | Suscripción | Email | Propietario | Centralizado | ❌ | ❌ | No | ❌ |

**Sustitutos válidos:** cualquier NFT transferible + registro estándar que keyed por `tokenId`/`agentId`.

---

## E1 — Manifiesto (`agentURI`)

**Qué hace:** el ADN del cuerpo — lista órganos, presupuestos, gateways. El hash o URI viaja con el NFT.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **IPFS (content-addressed)** | Gratis contenido; pinning de pago | Ninguno | Protocolo abierto | Descentralizado | ✅ | ✅ | Parcial | ⏳ onchain |
| **Arweave** | ~$0.001–0.01/MB one-shot | Wallet (AR) | Protocolo abierto | Descentralizado | ✅ | ✅ | No | ⏳ |
| **HTTPS central (GitHub Pages, S3)** | Gratis–$5/mes | Cuenta humana | — | Centralizado | ⚠️ | ⚠️ URL puede romperse | No | ✅ (lab JSON local) |
| **toju / W3Stor** (manifiesto) | ~micro-USDC/upload | Wallet x402 | OSS + servicio | Federado | ✅ | ✅ | No | ⏳ |

**Regla:** el manifiesto público **no** debe llevar secretos (tokens Telegram, API keys).

---

## E1 — Tesoro (wallet del agente)

**Qué hace:** la cartera desde la que el agente paga y cobra. Con ERC-6551, viaja con el NFT.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **ERC-6551 TBA** | Solo gas deploy | Wallet NFT | Estándar abierto | Onchain | ✅ | ✅ | No | ✅ |
| **Solana PDA** (Metaplex) | Rent + gas | Wallet | OSS | Onchain | ✅ | ✅ | No | ⏳ |
| **ERC-4337 Smart Account** | Gas + bundler | Wallet | OSS | Onchain | ✅ | ✅ | Parcial | ⏳ |
| **Turnkey** (policy wallet) | ~$0 + uso API | API key org | Propietario | Centralizado | ⚠️ | ⚠️ | No | ⏳ |
| **Lit Protocol PKP** | Gas + lit fee | Wallet | OSS | Federado | ✅ | ✅ | Parcial | ⏳ |
| **Coinbase CDP / Privy** | — | Email/OAuth | Propietario | Centralizado | ❌ | ❌ | No | ❌ |
| **EOA suelta del dev** | Gratis | — | — | — | ❌ | ❌ | No | ⚙️ *solo lab* |

---

## E1 — Cerebro (inferencia LLM)

**Qué hace:** pensar, responder, decidir. Debe pagarse por uso desde wallet del agente (ideal: TBA + x402).

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **[tx402.ai](https://tx402.ai)** | ~$0.0015–0.004/req | Wallet USDC | Propietario + x402 OSS | Centralizado + x402 | ✅ | ✅ | No | ✅ |
| **[Ekai Labs](https://docs.ekailabs.xyz)** (x402→OpenRouter) | ~$0.002–0.02/req | Wallet | Híbrido | Centralizado | ✅ | ✅ | No | ⏳ |
| **io.net IO Intelligence** | USDC → IO token | Wallet | Propietario | DePIN | ✅ | ✅ | No | ⏳ |
| **Self-hosted Ollama/vLLM** | Compute ~$0.10–1/h GPU | Ninguno | OSS | Self-host | ✅ | ✅ | Sí | ⏳ |
| **Akash GPU** (host Ollama) | ~$0.05–0.30/h AKT | Wallet | OSS red | Descentralizado | ✅ | ✅ | Parcial | ⏳ |
| **ICP HTTPS outcalls** | Cycles | Canister | OSS | Descentralizado | ✅ | ✅ | Sí | ⏳ |
| **OpenRouter directo** | $5–50 prepago | Email + API key | Propietario | Centralizado | ❌ | ❌ | No | ❌ |
| **OpenAI / Anthropic directo** | Suscripción | Email + tarjeta | Propietario | Centralizado | ❌ | ❌ | No | ❌ |
| **Manguera (hose)** — key del owner | Gratis para TBA* | API key owner | — | — | ⚠️ | ⚠️ | No | ⏳ |

\* *No cuenta contra presupuesto TBA; útil como respaldo humano.*

**Estrategia ageNFT:** primario x402; fallbacks: otro gateway x402 → self-host → hose → DORMANT.

---

## E1 — Memoria

**Qué hace:** recuerda conversaciones, personalidad, skills. El **hash** vive onchain; el blob offchain.

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **IPFS público** (sin pin) | Gratis | Ninguno | Protocolo abierto | Descentralizado | ✅ lectura | ✅ | Parcial | ⚙️ |
| **[W3Stor](https://github.com/aikarap/w3stor)** | x402 ~$0.001/MB/mes | Wallet | OSS | Federado | ✅ | ✅ | No | ⏳ |
| **[toju.network](https://toju.network)** | x402 USDC Base | Wallet | OSS SDK | Federado | ✅ | ⚠️ roto lab | No | ⏳ |
| **Arweave** (archivo) | ~$0.005/MB once | Wallet AR | Protocolo abierto | Descentralizado | ✅ | ✅ | No | ⏳ |
| **Ceramic / ComposeDB** | Gas L2 | DID/wallet | OSS | Descentralizado | ✅ | ✅ | Parcial | ⏳ |
| **Pinata / Filebase** | $0–20/mes | Email + API key | Propietario | Centralizado | ❌ | ❌ | No | ❌ |
| **lab-remote / PIXE** (VIMS) | Gratis lab | Ninguno | OSS interno | Centralizado lab | ⚠️ | ⚠️ | Sí | ✅ |
| **PostgreSQL del dev** | Hosting | — | OSS | Centralizado | ❌ | ❌ | Sí | ❌ |

**Capas:** operativa (sync frecuente) + archivo (Arweave, opcional).

---

## E1 — Reflejos (límites de gasto)

**Qué hace:** evita que el agente se quede sin dinero en un bucle. Vive en manifiesto + runtime (+ onchain opcional).

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **Manifiesto `budget.organs`** | Gratis | Ninguno | Schema OSS | Local | ✅ | ✅ | No | ✅ |
| **Runtime `budget-tracker`** | Gratis | Ninguno | OSS | Local | ✅ | ✅ | Sí | ✅ |
| **ERC-4337 Session Keys** | Gas | Wallet | OSS | Onchain | ✅ | ✅ | Parcial | ⏳ |
| **Turnkey policies** | API | Cuenta org | Propietario | Centralizado | ⚠️ | ⚠️ | No | ⏳ |
| **Sin límites** | — | — | — | — | ❌ | — | — | ❌ |

---

## E1 — Runtime (motor del agente)

**Qué hace:** el bucle que lee manifiesto, llama cerebro, escribe memoria, atiende gateways.

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Self-host | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----------|-----|
| **Hermes Agent** (local) | Gratis (tu máquina) | Ninguno | OSS | Local | ⚠️ | ⚠️ | Sí | ✅ |
| **OpenClaw** | Gratis | Ninguno | OSS | Local | ⚠️ | ⚠️ | Sí | ⏳ |
| **ageNFT runtime genérico** | Gratis | Ninguno | OSS | Multi-tenant | ✅ | ✅ | Parcial | ⏳ |
| **Akash** (contenedor) | ~$1–15/mes CPU | Wallet AKT | OSS | Descentralizado | ✅ | ✅ | Parcial | ⏳ |
| **VPS (Hetzner, etc.)** | ~$5–20/mes | Email* | — | Centralizado | ⚠️ | ⚠️ | Sí | ⏳ |
| **ICP Canister** | Cycles | Wallet | OSS | Descentralizado | ✅ | ✅ | Sí | ⏳ |
| **SaaS “agent hosting”** | $20–99/mes | Email | Propietario | Centralizado | ❌ | ❌ | No | ❌ |

\* *El VPS lo paga un humano hoy; objetivo: TBA paga Akash/io.net.*

---

## E1* — Gas (combustible onchain)

**Qué hace:** paga transacciones (mint, transfer, swaps, x402 EIP-3009). No es un órgano visible pero **sin gas no hay TBA operativa**.

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----|
| **ETH en L2 (Base)** | ~$0.001–0.05/tx | Wallet | Protocolo abierto | Onchain | ✅ | ✅ | ✅ |
| **Paymaster ERC-4337** | Subsidiado o USDC | Wallet | OSS | Onchain | ✅ | ✅ | ⏳ |
| **Faucet testnet** | Gratis | Ninguno | — | Centralizado | ✅ test | ✅ test | ✅ |

---

## E2 — Gateways (chat) — necesitas ≥1

**Qué hace:** puertas para que humanos hablen con el agente. Mismo cerebro, varias entradas.

### Telegram (S2 — bootstrap una vez)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Bot API Telegram** | Gratis | Teléfono owner 1× + token bot | Propietario API | Centralizado | ⚠️ | ⚠️ nuevo token | ✅ |
| **Hermes gateway** | Gratis | Token en runtime | OSS | Local | ⚠️ | ⚠️ | ✅ |

### Nostr (S1 — soberano)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Relays públicos** (Damus, nos.lol…) | Gratis | Clave nsec agente | OSS | Federado | ✅ | ✅ | ⏳ |
| **Relay self-host** | ~$5/mes VPS | Ninguno | OSS | Self-host | ✅ | ✅ | ⏳ |
| **NIP-04 / NIP-17 DMs** | Gratis | Claves | Protocolo abierto | Federado | ✅ | ✅ | ⏳ |

### Matrix (S1)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Homeserver self-host** (Synapse) | ~$5–20/mes | Ninguno | OSS | Federado | ✅ | ✅ | ⏳ |
| **matrix.org** (hosted) | Gratis tier | Email | OSS + servicio | Federado | ⚠️ | ⚠️ | ⏳ |
| **Hermes Matrix bridge** | Gratis | Token HS | OSS | Federado | ⚠️ | ⚠️ | ⏳ |

### Simplex (S1)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Simplex Chat** | Gratis | QR / link | OSS | Descentralizado P2P | ✅ | ✅ | ⏳ |

### Discord (S2)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Discord Bot** | Gratis | Cuenta dev + token | Propietario | Centralizado | ⚠️ | ⚠️ | ⏳ |

### WhatsApp / Signal (S3 — owner opt-in)

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **WhatsApp Business API** | ~$0.005–0.15/msg | Teléfono + Meta verify | Propietario | Centralizado | ❌ | ❌ | ❌ default |
| **Signal** | Gratis | Teléfono | OSS cliente | Centralizado | ❌ | ❌ | ❌ |

**Prioridad producto:** Nostr → Matrix → Simplex → Telegram → Discord → WhatsApp (opt-in).

---

## E2 — Gateways (web / dApp)

**Qué hace:** cara pública — TBA, estado órganos, transfer checklist.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **GitHub Pages** | Gratis | Cuenta GitHub | — | Centralizado | ⚠️ | ⚠️ | ✅ |
| **IPFS static** | Pin de pago | Wallet | Protocolo abierto | Descentralizado | ✅ | ✅ | ⏳ |
| **ENS + IPFS** | ~$5–20/año ENS | Wallet | Protocolo abierto | Federado | ✅ | ✅ | ⏳ |

---

## O-R — Doctor (autodiagnóstico)

**Qué hace:** prueba órganos, alerta, failover automático (cerebro/memoria).

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----|
| **Hermes cron + `doctor-probe`** | ~$0.01/día probes | Ninguno | OSS | Local | ✅ | ✅ | ✅ |
| **`organ-assembly-audit.mjs`** | Gratis | Ninguno | OSS | Local | ✅ | ✅ | ✅ |
| **Uptime Kuma / external** | Gratis self-host | Email alert | OSS | Self-host | ⚠️ | ⚠️ | ⏳ |

---

## O-N — Scout (olfato — buscar ofertas baratas)

**Qué hace:** descubre gateways LLM/storage más baratos (x402 directory).

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **x402.org directory** | Gratis lectura | Ninguno | OSS | Federado | ✅ | ✅ | ⏳ |
| **tx402.ai /models** | Gratis lectura | Ninguno | Propietario | Centralizado | ✅ | ✅ | ⏳ |
| **Custom scraper** | Compute | Ninguno | OSS | Local | ✅ | ✅ | ⏳ |

---

## O-N — Voz (el agente cobra por servir)

**Qué hace:** endpoints HTTP/MCP/A2A con x402 → ingresos a TBA.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **x402 middleware propio** | Gratis infra | Ninguno | OSS x402 | Self-host | ✅ | ✅ | ⏳ |
| **AgentX402Receiver** (ref) | Gas deploy | Wallet | OSS | Onchain | ✅ | ✅ | ⚙️ |
| **Stripe** | 2.9% + fee | Email KYC | Propietario | Centralizado | ❌ | ❌ | ❌ |

---

## O-N — Presencia (cara, TTS, animación)

**Qué hace:** que el agente se **vea y suene** (no solo texto).

### TTS (texto → audio)

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----|
| **[dTelecom x402](https://x402.dtelecom.org/)** | ~$0.004/min | Wallet | Híbrido DePIN | Descentralizado | ✅ | ✅ | ⏳ |
| **[kas402](https://kas402.com/)** | ~$0.005/llamada | Wallet | Proxy | Federado | ✅ | ✅ | ⏳ |
| **Kokoro-82M self-host** | Compute | Ninguno | OSS | Self-host | ✅ | ✅ | ⏳ |
| **Piper / Coqui** | Gratis local | Ninguno | OSS | Self-host | ✅ | ✅ | ⏳ |
| **ElevenLabs / OpenAI TTS** | $5–22/mes | Email | Propietario | Centralizado | ❌ | ❌ | ❌ |

### Lip-sync / idle

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----|
| **MuseTalk / LivePortrait** | GPU ~$0.10/h | Ninguno | OSS | Self-host | ✅ | ✅ | ⏳ |
| **Live2D / Rive** (idle) | Gratis assets | Ninguno | OSS | Cliente | ✅ | ✅ | ⏳ |
| **fal.ai / D-ID / HeyGen** | $0.05–0.20/s | API key | Propietario | Centralizado | ❌ | ❌ | ❌ |

**Degradación:** P4 emoción → P2 TTS → P1 idle → P0 foto estática.

---

## O-N — Manos (acciones onchain)

**Qué hace:** swap, stake, mint, transfer desde TBA.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Uniswap / Aerodrome** | Gas + swap fee | Wallet | OSS | Onchain | ✅ | ✅ | ⏳ |
| **Aave / Compound** | Gas | Wallet | OSS | Onchain | ✅ | ✅ | ⏳ |
| **Jupiter** (Solana) | Gas | Wallet | OSS | Onchain | ✅ | ✅ | ⏳ |
| **Coinbase AgentKit** | — | CDP cuenta | Propietario | Centralizado | ❌ | ❌ | ❌ |

---

## O-N — Privacidad (transporte cifrado)

**Qué hace:** oculta metadatos de quién habla con quién (Nym, mixnets).

| Servicio | Precio est. | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|-------------|----------|--------|-----------|-----------|---------------|-----|
| **Nym VPN** | ~$0.50–2/mes | Wallet opcional | OSS | Descentralizado | ✅ | ✅ | ⏳ |
| **Tor** | Gratis | Ninguno | OSS | Federado | ✅ | ✅ | ⏳ |
| **TLS estándar** | Gratis | Ninguno | OSS | — | ✅ | ✅ | ✅ |

---

## O-N — Reputación

**Qué hace:** scores verificables ligados a `agentId`.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **ERC-8004 Reputation Registry** | Gas | Wallet | Protocolo abierto | Onchain | ✅ | ✅ | ⏳ |
| **Reviews offchain IPFS** | Pin | Wallet | OSS | Descentralizado | ✅ | ✅ | ⏳ |

---

## O-N — Colaboradores (otros agentes/humanos de confianza)

**Qué hace:** delegar subtareas con tope de presupuesto.

| Servicio | Precio | Registro | Código | Topología | Soberanía | Post-transfer | Lab |
|----------|--------|----------|--------|-----------|-----------|---------------|-----|
| **Manifiesto `collaborators.trusted`** | Gratis | Ninguno | Schema OSS | — | ✅ | ✅ | ⏳ |
| **A2A / MCP peer agents** | x402 por tarea | Wallet | Protocolo abierto | Federado | ✅ | ✅ | ⏳ |

---

## Checklist de ensamblaje (antes de dar por “vivo” un agente)

### Bloque E1 — sin esto no arranca

- [ ] NFT mint + `agentId` en ERC-8004
- [ ] TBA desplegada y en manifiesto
- [ ] Manifiesto publicado (`agentURI` resuelve)
- [ ] Cerebro: al menos 1 endpoint x402 probado con pago real
- [ ] Memoria: cápsula escrita + hash; restart test OK
- [ ] Reflejos: `budget.organs` con caps coherentes
- [ ] Runtime: motor activo (`hermes:verify` o equivalente)
- [ ] Gas: TBA con ETH mínimo en L2

### Bloque E2 — al menos una puerta

- [ ] ≥1 gateway chat **o** dApp web operativa
- [ ] Secretos de gateway **solo** en runtime, no en IPFS

### Bloque O-R — salud (recomendado)

- [ ] Doctor cron activo
- [ ] 2ª alternativa cerebro o memoria en `fallbacks`
- [ ] `organ-assembly-audit.mjs` en verde

### Bloque post-transfer (automático)

- [ ] `ownerOf` = nuevo owner
- [ ] Mismo `agentId`, misma TBA, mismo manifiesto
- [ ] Memoria resuelve por hash
- [ ] Probe x402 desde TBA (cuando migre pago)

---

## Regla de oro para añadir un servicio nuevo

> Si el signup pide **email antes que wallet**, no es órgano válido para soberanía plena.  
> Si el pago es **x402 o wallet nativa**, encaja.  
> Siempre documentar **2–3 sustitutos** por órgano en el manifiesto.

---

## Referencias

| Doc | Contenido |
|-----|-----------|
| [`digital-body.md`](../architecture/digital-body.md) | Anatomía y transferencia |
| [`decentralized-services.md`](decentralized-services.md) | Pagos sin humano |
| [`agent-compatible-services.md`](agent-compatible-services.md) | Checklist compatibilidad |
| [`chat-habitats-messaging.md`](chat-habitats-messaging.md) | Gateways S1/S2/S3 |
| [`presence-voice-stack.md`](presence-voice-stack.md) | TTS y lip-sync |
| [`spending-budgets.md`](../architecture/spending-budgets.md) | Caps y runway |
| [`unit-1-lab.json`](../manifest/examples/unit-1-lab.json) | Manifiesto lab |
