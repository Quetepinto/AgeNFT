# Anatomía del Cuerpo Digital

> Qué órganos tiene un ageNFT, dónde viven, y qué ocurre en una transferencia.

---

## Vista del cuerpo

```
                         ageNFT #42
                    ┌──────────────────┐
                    │    🧠 Cerebro     │ ← router multi-fuente (x402 + scout + manguera)
                    │    🔍 Olfato      │ ← scout: ofertas LLM gratis/baratas
                    │    💾 Memoria     │ ← historial + personalidad (IPFS/Arweave)
                    │    💰 Tesoro      │ ← TBA wallet (USDC, ETH, tokens)
                    │    🪪 Identidad   │ ← ERC-8004 registro + agentURI
                    │    ⭐ Reputación  │ ← ERC-8004 reputation registry
                    │    🗣️ Voz         │ ← endpoints que expone (x402 receiver)
                    │    🎭 Presencia   │ ← cara, idle, TTS, lip-sync (Fase 4.5)
                    │    🛡️ Reflejos    │ ← policy engine (spending limits)
                    │    🔧 Manos       │ ← tools onchain (swap, mint, etc.)
                    └──────────────────┘
                              │
                    ownerOf() = Owner humano
                    TBA.control = sigue al NFT
                    agentId = permanente
```

---

## Órganos — definición formal

### 🪪 Identidad (inmutable por tokenId)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | ERC-721 + registro ERC-8004 |
| **Dónde** | Onchain |
| **Propietario operativo** | El NFT (via TBA para acciones) |
| **En transferencia** | ✅ Atómico — `transfer()` mueve identidad |
| **Servicios compatibles** | ERC-8004 Identity Registry, Metaplex (Solana) |

El `agentURI` apunta al manifiesto del cuerpo. Es la "parte de nacimiento" del agente.

---

### 💰 Tesoro (wallet del agente)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Token-Bound Account (ERC-6551) o PDA (Solana) |
| **Donde** | Onchain |
| **Propietario operativo** | El agente (control derivado del NFT) |
| **En transferencia** | ✅ Atómico — TBA owner = NFT owner |
| **Contiene** | USDC, ETH/SOL, tokens, otros NFTs, permissions |

```
transfer NFT  →  nuevo owner controla TBA  →  todos los fondos viajan
```

Este es el órgano clave para la **soberanía económica**: el agente paga todo desde aquí.

---

### 💾 Memoria (conocimiento no fungible)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Snapshots de conversaciones, personalidad, skills, embeddings |
| **Dónde** | IPFS / Arweave (offchain, content-addressed) |
| **Propietario operativo** | El agente (paga pinning; hash en NFT) |
| **En transferencia** | ✅ Por construcción — el hash en metadata no cambia |
| **Servicios compatibles** | Arweave (pay-once), IPFS + pinning pagado por TBA |

```
agentURI.memoryHash = "bafybeig..."  →  contenido accesible por cualquiera con el hash
                                       →  nuevo owner lee el mismo contenido
```

La memoria **no se mueve** — ya está en la red. Lo que viaja es el **puntero** (hash onchain).

---

### 🧠 Cerebro (inferencia LLM)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Capacidad de razonar, generar texto, decidir acciones |
| **Dónde** | Offchain (API de inferencia) |
| **Propietario operativo** | El agente (paga por request vía x402) |
| **En transferencia** | ✅ Si usa x402 — no hay cuenta que transferir |
| **Servicios compatibles** | APIs con x402, self-hosted pagado por TBA |

**Patrón obligatorio:**

```
Agente → HTTP request → API responde 402 → Agente paga desde TBA → recibe inferencia
```

**Anti-patrón:** OpenRouter con API key del developer.

---

### 🗣️ Voz (servicios que el agente expone)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Endpoints HTTP/MCP/A2A que otros pueden consumir |
| **Dónde** | Runtime offchain + settlement onchain |
| **Propietario operativo** | El agente (cobra vía x402 → TBA) |
| **En transferencia** | ✅ Endpoints registrados en agentURI; pagos van a TBA |
| **Servicios compatibles** | x402 receiver, ERC-8004 service endpoints |

La voz es cómo el agente **genera ingresos**. Debe cobrar a su TBA, no a una cuenta del dev.

---

### 🎭 Presencia (cara y cuerpo visible)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Imagen del personaje + movimiento en reposo + voz audible + (opcional) sincronización labial |
| **Dónde** | Assets IPFS + servidor de presencia offchain |
| **Propietario operativo** | El agente (paga TTS/lip-sync desde TBA bajo Reflejos) |
| **En transferencia** | ✅ `portrait` e `idleAsset` en manifiesto viajan con el NFT |
| **Servicios compatibles** | TTS x402, Live2D, Rive, APIs lip-sync |

Modos en cascada (P0 foto → P4 emoción). Si falta presupuesto o GPU, degrada sin romper la experiencia.

→ Spec: [`presence-organ.md`](../research/presence-organ.md)  
→ Contextos: [`presence-context-layers.md`](../research/presence-context-layers.md)  
→ Hábitats: [`agent-habitats.md`](../research/agent-habitats.md)

---

### ⭐ Reputación

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Scores, feedback, historial de interacciones verificadas |
| **Dónde** | ERC-8004 Reputation Registry (onchain) |
| **Propietario operativo** | Vinculado a `agentId`, no a wallet humana |
| **En transferencia** | ✅ Atómico — reputation keyed by agentId |
| **Servicios compatibles** | ERC-8004 Reputation Registry |

---

### 🛡️ Reflejos (policy engine)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Límites de gasto, allowlists, circuit breakers |
| **Dónde** | Onchain (TBA policy / session keys) + runtime |
| **Propietario operativo** | El agente (config en manifiesto; owner puede override) |
| **En transferencia** | ✅ Políticas onchain viajan con TBA; runtime lee manifiesto |
| **Servicios compatibles** | ERC-4337 session keys, Turnkey policies |

Protegen al cuerpo de gastar todo en un bucle infinito.

→ Detalle caps por órgano y estimador: [`spending-budgets.md`](spending-budgets.md)

---

### 🔧 Manos (tools onchain)

| Propiedad | Valor |
|-----------|-------|
| **Qué es** | Capacidad de actuar: swap, transfer, mint, stake, etc. |
| **Dónde** | Onchain via TBA |
| **Propietario operativo** | El agente (firma desde TBA bajo policy) |
| **En transferencia** | ✅ Capacidades en manifiesto; ejecución desde TBA |
| **Servicios compatibles** | DeFi protocols, Solana Agent Kit, AgentKit |

---

## Flujo de transferencia — desglose

### Lo que el usuario hace

```solidity
ageNFT.transfer(newOwner, tokenId);  // 1 TX
```

### Lo que ocurre automáticamente

| Órgano | Mecanismo | TX adicional |
|--------|-----------|--------------|
| Identidad | `ownerOf` cambia | No |
| Tesoro | TBA owner = NFT owner (ERC-6551 spec) | No |
| Fondos en TBA | Permanecen en TBA | No |
| Memoria | Hash inmutable en metadata | No |
| Reputación | Keyed by agentId | No |
| Cerebro | x402: sin cuenta; TBA paga | No |
| Voz | Endpoints en agentURI; x402 → TBA | No |
| Reflejos | Policy onchain + manifiesto | No |
| Manos | TBA firma | No |

### Lo que el nuevo owner NO hace

- ❌ Crear cuentas
- ❌ Introducir API keys
- ❌ Suscribirse a servicios
- ❌ Configurar wallets
- ❌ Migrar memoria
- ❌ Re-registrar el agente

### Verificación post-transfer (automática, no manual)

El runtime/dApp debería verificar tras la transfer:

```
1. ownerOf(tokenId) == newOwner          ✓
2. TBA.balance > 0 (opcional warning)  ✓
3. memoryHash resuelve en IPFS/Arweave   ✓
4. agentURI endpoints responden           ✓
5. x402 test payment desde TBA funciona   ✓
```

Esto es diagnóstico del sistema, no onboarding del usuario.

---

## El manifiesto como ADN del cuerpo

Todo órgano se declara en el manifiesto referenciado por `agentURI`:

```json
{
  "type": "ageNFT/v1",
  "name": "Hermes-42",
  "description": "...",
  "image": "ipfs://...",

  "identity": {
    "registry": "eip155:8453:0x8004A169...",
    "agentId": 42
  },

  "treasury": {
    "type": "erc6551",
    "address": "0xTBA...",
    "chain": "base"
  },

  "organs": {
    "brain": {
      "provider": "x402-llm",
      "endpoint": "https://inference.example.com/v1/chat",
      "model": "claude-sonnet"
    },
    "memory": {
      "provider": "ipfs",
      "primary": "ipfs://bafybeig...",
      "backup": "arweave://txid...",
      "format": "agenft-memory/v1"
    },
    "voice": {
      "endpoints": [
        { "type": "x402", "url": "https://hermes-42.example.com/ask" },
        { "type": "mcp", "url": "https://hermes-42.example.com/mcp" }
      ],
      "paymentReceiver": "0xTBA..."
    },
    "reflexes": {
      "maxDailySpend": "10 USDC",
      "allowedContracts": ["0x...", "0x..."],
      "circuitBreaker": { "maxTxPerMinute": 5 }
    },
    "hands": {
      "enabled": ["swap", "transfer", "mint-nft"],
      "dex": "uniswap-v3"
    }
  },

  "services": [
    { "type": "A2A", "url": "https://..." }
  ],

  "x402Support": true,
  "supportedTrust": ["reputation", "tee-attestation"]
}
```

Al transferir, el manifiesto **no cambia** (mismo agentId, misma TBA, mismos endpoints). Solo cambia quién tiene derecho de propiedad sobre el NFT.

---

## Caso límite: TBA sin fondos

El cuerpo viaja completo pero puede estar "dormido":

```
Transfer OK → Memoria intacta → Identidad intacta → Cerebro no responde (sin USDC)
```

Opciones:
1. Nuevo owner recarga TBA (opcional, fuera del flujo de transfer)
2. Agente degrada a modo lectura (memoria accesible, sin inferencia)
3. UI muestra: "Tu agente necesita alimentarse" (metáfora del cuerpo)

Esto **no viola** el principio de transferencia como un todo — el cuerpo está completo, solo necesita "nutrientes".

---

## Caso límite: migración de órgano

Si un servicio deja de existir, el agente (o el owner) puede actualizar un órgano:

```
1. Agente/eligibility: ownerOf puede setAgentURI()
2. Nuevo manifiesto con brain.provider = "nuevo-servicio"
3. Memoria se preserva (mismo agentId, nuevo snapshot si hace falta)
4. Usuario percibe: "Hermes-42 se recuperó de una operación"
```

La identidad persiste; los órganos son reemplazables (Principio 5).
