# Servicios compatibles con agentes soberanos

> Inventario orientativo de servicios que cumplen el checklist de [`design-principles.md`](../architecture/design-principles.md).
> Estado: investigación inicial — requiere validación práctica.

---

## Checklist de compatibilidad

```
□ Pago desde wallet del agente
□ Registro por agentId/wallet, no email humano
□ Funciona post-transfer sin acción del nuevo owner
□ Sin KYC/tarjeta personal
□ Pay-per-use o prepaid
□ Credenciales derivables del NFT
```

---

## Por órgano

### 🧠 Cerebro — Inferencia LLM

| Servicio | Modelo de pago | Registro | Post-transfer | Estado |
|----------|---------------|----------|---------------|--------|
| **x402-native LLM APIs** | USDC per request | Ninguno (wallet paga) | ✅ | Investigar proveedores |
| **Self-hosted (vLLM, Ollama)** | Compute prepagado | Ninguno | ✅ | Agente paga VPS vía... ⚠️ |
| **ICP HTTPS outcalls** | Cycles en canister | Canister = agente | ✅ | Fase 3 |
| OpenRouter (API key) | Suscripción/key | Cuenta dev | ❌ | **Descartado** |
| OpenAI Platform (API key) | Billing tarjeta | Cuenta humana | ❌ | **Descartado** |
| Anthropic directo | Billing tarjeta | Cuenta humana | ❌ | **Descartado** |

**Estrategia ageNFT:** solo APIs x402 o infra self-hosted pagada por TBA. Investigar quién vende inferencia vía x402 hoy.

**Acción:** buscar en el ecosistema x402 sellers de inferencia LLM.

---

### 💾 Memoria — Storage persistente

| Servicio | Modelo de pago | Registro | Post-transfer | Estado |
|----------|---------------|----------|---------------|--------|
| **Arweave** | One-time AR desde wallet | Ninguno | ✅ | Hash permanente |
| **IPFS (content-addressed)** | Gratis (contenido) | Ninguno | ✅ | Necesita pinning |
| **IPFS pinning (Pinata, Filebase)** | Prepaid / API key | ⚠️ Cuenta | ⚠️ | Evaluar wallet billing |
| **Ceramic/ComposeDB** | Wallet-signed writes | DID/wallet | ✅ | Investigar |
| PostgreSQL del dev | N/A | N/A | ❌ | **Descartado** |

**Estrategia ageNFT:**
- Memoria escrita → IPFS → hash en metadata
- Pinning pagado desde TBA (Filebase acepta crypto; verificar)
- Backup permanente en Arweave (one-shot payment desde TBA)

---

### 💰 Tesoro — Wallet / firma

| Servicio | Modelo | Post-transfer | Estado |
|----------|--------|---------------|--------|
| **ERC-6551 TBA** | Onchain, owner = NFT holder | ✅ Atómico | Estándar EVM |
| **Solana PDA** | Onchain, seeds del mint | ✅ | Patrón Metaplex |
| **ERC-4337 session keys** | Policy-limited signing | ✅ | Para gasto acotado |
| **Turnkey** | Policy API per wallet | ⚠️ | Wallet aislada por agente, verificar ownership |
| **Lit Protocol PKP** | Conditional signing | ✅ | Firma bajo condiciones onchain |
| Coinbase CDP (AgentKit) | Cuenta del developer | ❌ | **Descartado** para soberanía |
| Privy embedded (user auth) | OAuth usuario | ❌ | **Descartado** |

**Estrategia ageNFT:** TBA nativa (ERC-6551) como tesoro primario. Turnkey/Lit como capa de firma segura **vinculada al agentId**, no al dev.

---

### 🪪 Identidad — Registro de agente

| Servicio | Transferible | Post-transfer | Estado |
|----------|-------------|---------------|--------|
| **ERC-8004 Identity Registry** | ✅ ERC-721 | ✅ | Live mainnet |
| **Metaplex NFT (Solana)** | ✅ | ✅ | Maduro |
| AAWP Soulbound NFT | ❌ | ❌ | **Descartado** (no transferible) |
| ENS subdomain | ⚠️ | ⚠️ | Owner = quien paga; evaluar TBA as owner |

**Estrategia ageNFT:** ERC-8004 en EVM; registrar `agentURI` con manifiesto completo.

---

### 🗣️ Voz — Monetización (agente cobra)

| Servicio | Modelo | Post-transfer | Estado |
|----------|--------|---------------|--------|
| **x402 middleware** | USDC per request → TBA | ✅ | Protocolo abierto |
| **AgentX402Receiver** (Agent-NFT) | Split onchain → TBA | ✅ | Contrato referencia |
| Stripe | Cuenta humana | ❌ | **Descartado** |

**Estrategia ageNFT:** todo endpoint del agente protegido con x402; `payTo` = TBA address.

---

### 🔧 Manos — DeFi / acciones onchain

| Servicio | Pago | Post-transfer | Estado |
|----------|------|---------------|--------|
| Uniswap, Jupiter | Gas + swap desde TBA | ✅ | Estándar |
| Aave, Kamino | Desde TBA | ✅ | Lending |
| **Coinbase AgentKit actions** | ⚠️ CDP | ❌ | Descartar CDP; usar TBA directo |
| **Solana Agent Kit** | Wallet plugin | ✅ | Con PDA del agente |

**Estrategia ageNFT:** acciones directas desde TBA con policy engine, no via SDK custodial.

---

### 🏃 Runtime — Dónde vive el loop del agente

| Opción | Soberanía | Post-transfer | Estado |
|--------|-----------|---------------|--------|
| **Runtime genérico ageNFT** | Resuelve agent por tokenId | ✅ | A construir |
| **Self-hosted por agente (VPS)** | Agente paga desde TBA | ✅ | Evaluar |
| **ICP Canister** | Canister = agente | ✅ | Fase 3 |
| SaaS del developer | Cuenta dev | ❌ | **Descartado** |

**Insight clave:** el runtime NO necesita ser único por agente. Un **runtime compartido** que resuelve `tokenId → manifiesto → órganos` cumple los principios. Es como un hospital que trata a cualquier paciente por su ID — el cuerpo es el NFT, el hospital es infraestructura.

```
Usuario → ageNFT dApp → Runtime genérico → lee manifiesto de tokenId=42 → conecta órganos
```

Esto evita que cada agente necesite "su propio servidor suscrito".

---

## Servicios x402 — ecosistema de pagos

El protocolo x402 es la pieza central para cumplir soberanía del agente:

| Rol | Cómo funciona | Agente como... |
|-----|---------------|----------------|
| **Cliente** | Agente paga USDC per request | Consumidor de LLM, storage, APIs |
| **Proveedor** | Agente cobra USDC per request | Vendedor de servicios propios |

Ventajas para transferencia:
- **Sin cuentas** → nada que migrar
- **Wallet paga** → TBA del agente
- **Neutral** → funciona en EVM y Solana

Referencia: [x402.org](https://x402.org), [github.com/coinbase/x402](https://github.com/coinbase/x402)

---

## Matriz de decisión — qué usar en MVP

| Órgano | Servicio MVP propuesto | Alternativa | Descartado |
|--------|----------------------|-------------|------------|
| Identidad | ERC-8004 + ERC-721 propio | Metaplex (Solana) | AAWP SBT |
| Tesoro | ERC-6551 TBA en Base | Solana PDA | CDP AgentKit |
| Memoria | IPFS + hash onchain | Arweave backup | PostgreSQL |
| Cerebro | x402 LLM API | Self-hosted | OpenRouter key |
| Voz | x402 middleware propio | AgentX402Receiver | Stripe |
| Reflejos | Session keys ERC-4337 | Turnkey policy | Sin límites |
| Manos | Direct TBA calls | AgentKit (sin CDP) | — |
| Runtime | ageNFT runtime genérico | — | SaaS per-agent |

---

## Brechas a investigar

- [ ] ¿Qué proveedores LLM aceptan x402 hoy? (listar endpoints conocidos)
- [ ] ¿Filebase/Pinata permiten billing desde wallet sin cuenta email?
- [ ] ¿Turnkey permite wallet per agentId con owner = TBA?
- [ ] ¿ENS puede registrarse con TBA como owner?
- [ ] ¿Cómo implementar runtime genérico multi-tenant sin acoplar al dev?
- [ ] ¿Agent-NFT resuelve alguna de estas brechas? (estudiar en profundidad)

---

## Regla de oro para nuevas integraciones

> Si el servicio pregunta "¿cuál es tu email?" en el signup, **no es un órgano válido**.
> Si pregunta "¿cuál es tu wallet?", **sí lo es**.
