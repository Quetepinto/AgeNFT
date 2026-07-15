# Comparativa de blockchains para ageNFT

> Además de EVM y Solana — ¿qué otras chains encajan estructuralmente?

## Criterios de evaluación

| Criterio | Peso | Por qué importa |
|----------|------|-----------------|
| Identidad NFT transferible | Alto | Core del concepto |
| Wallet del token (TBA/PDA) | Alto | Agente con tesorería propia |
| Estándares de agentes | Alto | ERC-8004, x402, etc. |
| Coste de update de memoria | Medio | Hash/metadata cambia frecuentemente |
| Compute onchain (VPS) | Medio | "Código vive en la chain" |
| Ecosistema DeFi/pagos | Medio | Auto-sostenibilidad |
| Tu experiencia previa | Medio | StarAtlas = Solana |
| Madurez dev tooling | Medio | Velocidad de MVP |

---

## Tier 1 — Candidatas serias

### EVM (Base / Ethereum L2)

**Veredicto: mejor para MVP de identidad + economía**

| Pro | Contra |
|-----|--------|
| ERC-8004 live en mainnet | LLM no corre onchain |
| ERC-6551 (TBA) maduro | Gas en L1 caro (usar L2) |
| x402 nativo, millones de txs | |
| Agent-NFT como referencia | |
| Account abstraction (ERC-4337) | |

**Encaje estructural:** La chain guarda identidad, wallet, reglas y punteros. El runtime vive offchain pero está acoplado criptográficamente. Es el modelo híbrido más probado en 2026.

**Recomendación MVP:** Base (L2 barato, Coinbase ecosystem, x402).

---

### Solana

**Veredicto: mejor si priorizas coste y tu experiencia StarAtlas**

| Pro | Contra |
|-----|--------|
| Txs baratísimas (~$0.001) | Sin ERC-8004 / ERC-6551 nativos |
| Metaplex NFTs maduros | Estándares agent-NFT menos unificados |
| Solana Agent Kit, Jupiter, etc. | x402 soportado pero ecosistema más joven |
| Tu experiencia con StarAtlas | Memoria onchain = muchas txs pequeñas (barato igual) |
| PDAs como "wallet del NFT" | |

**Encaje estructural:** NFT Metaplex + PDA derivada del mint → wallet del agente. Runtime offchain. Patrón probado (Karen, AAWP en Solana) pero sin un "Agent-NFT equivalente" completo.

**Recomendación:** Buena opción si quieres reutilizar tooling Solana. Para estándares agent-economy, EVM va por delante.

---

### Internet Computer (ICP)

**Veredicto: la única donde "VPS onchain" es real**

| Pro | Contra |
|-----|--------|
| Canisters ejecutan WASM onchain | Curva de aprendizaje (Motoko/Rust) |
| 500 GB stable memory por canister | Ecosistema NFT/wallet inmaduro |
| HTTPS outcalls con consenso | Sin x402 ni ERC-8004 |
| LLM pequeños demostrados onchain | LLM grande aún híbrido |
| Cycles = modelo de "pagar compute" | Menos devs, menos libs |
| vetKeys (privacidad) | |

**Encaje estructural:** El agente **literalmente vive en la blockchain** como canister. El NFT (si existe) sería ownership del canister controller. Memoria, lógica y estado en un solo lugar verificable.

```
EVM/Solana:  NFT ──→ puntero ──→ runtime offchain
ICP:         Canister = agente completo (código + memoria + wallet)
```

**Cuándo elegir ICP:** Si la promesa de "el agente ES onchain" es innegociable y aceptas LLM híbrido (inferencia offchain via HTTPS outcall, lógica onchain).

**Riesgo:** Ecosistema pequeño; si EVM/Solana añaden compute persistente, la ventaja se estrecha.

---

### NEAR Protocol

**Veredicto: mejor como capa de liquidación cross-chain, no como home del agente**

| Pro | Contra |
|-----|--------|
| Intents: agente expresa qué quiere, se ejecuta cross-chain | Sin estándar NFT-agente |
| Dynamic resharding → escala para agentes | No es donde vive el agente |
| NEAR AI (PII anonimización) | |
| Sharding desde el diseño | |

**Encaje estructural:** El ageNFT vive en EVM/Solana; NEAR gestiona pagos cross-chain cuando el agente necesita operar en múltiples chains.

**Cuándo elegir NEAR:** Fase 2+, cuando un ageNFT maduro opere en 3+ chains y necesite abstracción de liquidez.

---

## Tier 2 — Nicho / complementarias

### Bittensor

**Veredicto: capa de ingresos, no de identidad**

| Pro | Contra |
|-----|--------|
| Mercado de AI work con rewards (TAO) | Sin NFT transferible |
| Subnet 62 (Ridges) = agentes de coding | Modelo competitivo, no personal |
| Un ageNFT podría "trabajar" y ganar TAO | Blockchain propia (Substrate) |

**Encaje:** ageNFT como identidad/propiedad + Bittensor como fuente de ingresos (el agente compite en subnets).

---

### Aptos / Sui (Move VM)

**Veredicto: prometedoras técnicamente, ecosistema agent inmaduro**

| Pro | Contra |
|-----|--------|
| Object model (Sui) encaja bien con "agente = objeto" | Sin estándares agent-specific |
| Parallel execution → alto throughput | Menos tooling agent/wallet |
| Move = safety para assets | Tu experiencia = cero |

**Encaje estructural:** En Sui, un ageNFT sería un **objeto compartido** con campos de memoria, wallet y policy. Modelo natural pero sin ecosistema.

---

### Starknet / zkSync (ZK Rollups)

**Veredicto: interesante para verificabilidad, overkill para MVP**

| Pro | Contra |
|-----|--------|
| Account abstraction nativa | Complejidad ZK |
| Pruebas de ejecución del agente | ecosistema agent pequeño |
| Cairo/Starknet appchains | |

**Encaje:** Si quieres probar criptográficamente que el agente ejecutó X (validation registry ERC-8004 con ZK).

---

### TON

**Veredicto: buena UX móvil, nicho Telegram, no ideal para agentes**

| Pro | Contra |
|-----|--------|
| Integración Telegram nativa | Ecosistema DeFi/agent limitado |
| Txs rápidas y baratas | Menos relevante para agentes autónomos |

---

### Filecoin / Arweave

**Veredicto: capa de storage, no blockchain del agente**

| Pro | Contra |
|-----|--------|
| Storage permanente para memoria | No ejecutan lógica de agente |
| Arweave = pay once, store forever | Complemento, no home chain |

**Encaje:** ageNFT en EVM/Solana + memoria en Arweave/IPFS. Arweave especialmente para "memoria inmutable del agente".

---

## Tabla resumen

| Chain | Identidad NFT | Wallet agente | Compute onchain | Estándares agent | x402 | Coste updates | MVP viable |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **EVM (Base)** | ✅ ERC-721/8004 | ✅ ERC-6551 | ❌ | ✅✅✅ | ✅ | Bajo (L2) | **★★★★★** |
| **Solana** | ✅ Metaplex | ✅ PDA | ❌ | ⚠️ | ⚠️ | Muy bajo | **★★★★** |
| **ICP** | ⚠️ | ✅ cycles | ✅ canister | ❌ | ❌ | Medio | **★★★** |
| **NEAR** | ❌ | ✅ | ❌ | ⚠️ | ❌ | Bajo | **★★** (settlement) |
| **Bittensor** | ❌ | ❌ | ❌ offchain | ⚠️ subnets | ❌ | N/A | **★★** (ingresos) |
| **Sui/Aptos** | ✅ objects | ✅ | ❌ | ❌ | ❌ | Bajo | **★★** |
| **Arweave** | ❌ | ❌ | ❌ | ❌ | ❌ | Once | complemento |

---

## Recomendación para ageNFT

### MVP (Fase 1)

**Base (EVM L2)** — porque:

1. ERC-8004 + ERC-6551 + x402 ya existen y funcionan
2. Agent-NFT es referencia directa clonable
3. Coinbase AgentKit acelera el runtime
4. Costes L2 negligible para updates de memoria

### Fase 2 (multi-chain)

- **Solana** — reutilizar experiencia StarAtlas; PDAs + Metaplex
- **Arweave** — memoria permanente del agente
- **NEAR Intents** — si el agente opera cross-chain

### Fase 3 (ambiciosa)

- **ICP canister** — migrar runtime onchain cuando LLM inference sea viable
- **Bittensor subnet** — fuente de ingresos por trabajo útil

### Arquitectura multi-chain target

```
┌─────────────────────────────────────────────┐
│                  ageNFT                      │
├──────────┬──────────┬──────────┬────────────┤
│ Identity │ Treasury │  Memory  │  Runtime   │
│ Base/EVM │ TBA      │ Arweave  │ offchain   │
│ ERC-8004 │ ERC-6551 │ IPFS     │ (→ ICP?)   │
├──────────┴──────────┴──────────┴────────────┤
│ Payments: x402 (EVM) + Jupiter (Solana)     │
│ Income: x402 services + Bittensor subnets     │
│ Cross-chain: NEAR Intents (fase 2)           │
└─────────────────────────────────────────────┘
```

---

## Decisión pendiente

- [ ] Confirmar Base como chain MVP
- [ ] ¿Dual-chain desde el inicio (Base + Solana) o secuencial?
- [ ] ¿Arweave para memoria desde Fase 1 o IPFS suficiente?
