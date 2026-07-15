# Proyectos existentes — Estudio comparativo

> Última revisión: 2026-07-12  
> **Investigación profunda:** [`similar-projects-deep-dive.md`](similar-projects-deep-dive.md) — ideas accionables

Proyectos que abordan partes de la visión ageNFT. Ninguno es idéntico, pero varios cubren piezas clave.

---

## Mapa rápido

```
                    Identidad NFT    Wallet propia    Memoria única    Pagos autónomos    Runtime LLM
Agent-NFT (VIMS)         ✅              ✅ TBA           ✅ .pixe            ✅ x402            offchain
ERC-8004                 ✅              ❌ (externa)     ❌ (metadata)       ✅ x402 en spec     offchain
AAWP                     ✅ SBT          ✅ nativa        ❌                  parcial            offchain
Karen (Solana)           ❌              ✅ Turnkey       ✅ básica           ❌                 offchain
Solana Agent Kit         ❌              ✅ plugins       ❌                  ❌                 offchain
Coinbase AgentKit        parcial         ✅               ❌                  ✅ x402            offchain
ICP (Alice, Onicai)      canister        ✅ cycles        ✅ onchain          cycles             ONCHAIN*
Bittensor (Ridges SN62)  ❌              ❌               ❌                  TAO rewards        offchain
MemoriaDA (0G)          ❌              ✅ merkle        ⚠️               ❌                 offchain
Mnemos (0G)             ✅ snapshot     ❌              ✅ rent/fork      A0GI               offchain
ERC-8170/8171           ✅ lifecycle    ✅ TBA          ✅ pointer        ❌                 draft
Virtuals Protocol       token/agent     ✅              ❌                ACP                offchain
Olas / Autonolas        code NFT        ✅              ❌                mech market        offchain
ElizaOS                 parcial         ✅ plugins      ✅                x402 roadmap       offchain
ERC-8181 (draft)        ouroboros TBA   ✅ self-own     ✅ anchor         ❌                 draft
```

---

## 1. Agent-NFT (HelloVIMS) — El más cercano a ageNFT

**Repo:** [github.com/HelloVIMS/Agent-NFT](https://github.com/HelloVIMS/Agent-NFT)  
**Demo:** [agent.vims.com](https://agent.vims.com)

### Qué hace

Stack Solidity completo para mintear agentes como NFTs con economía integrada.

| Contrato | Función |
|----------|---------|
| `AgentIdentityRegistry` | ERC-721 upgradeable (UUPS), royalties ERC-2981 |
| `AgentTBARegistry` | Factory ERC-6551 (Token-Bound Account) |
| `AgentAccount` | TBA con ERC-4337 + session keys |
| `AgentReputationRegistry` | ERC-8004 reputation |
| `AgentPaymentRouter` | Router USDC/ETH con royalty al sistema |
| `AgentX402Receiver` | Settlement onchain para pagos x402 |

### Memoria

Formato [`.pixe`](https://github.com/ArqonAi/Pixelog) — cápsulas de memoria experiencial acumulada onchain/offchain.

### Lecciones para ageNFT

- **Copiar el patrón NFT → TBA → x402 receiver** como arquitectura base EVM
- Estudiar cómo vinculan `agentId` con pagos y memoria
- Es el reference implementation más completo de la visión

### Gaps vs ageNFT

- Enfoque comercial (VIMS platform), no framework genérico
- Runtime LLM no incluido — hay que construirlo
- Solo EVM

---

## 2. ERC-8004 — Estándar de identidad (Ethereum)

**Spec:** [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004)  
**Contratos:** [github.com/erc-8004/erc-8004](https://github.com/erc-8004/erc-8004)  
**Mainnet:** Identity `0x8004A169...`, Reputation `0x8004BAa1...`

### Qué hace

Tres registros onchain para agentes:

1. **Identity Registry** — ERC-721; cada agente es un NFT con `agentURI` → JSON registration file
2. **Reputation Registry** — feedback, scores, tags (uptime, calidad)
3. **Validation Registry** — pruebas verificables (TEE attestation, ZK proofs)

El registration file incluye endpoints (MCP, A2A), capacidades, y soporte x402.

### Lecciones para ageNFT

- **Adoptar ERC-8004 como capa de identidad** en lugar de inventar un ERC propio
- El `agentURI` es el lugar natural para el hash de memoria
- Transferir el NFT = transferir identidad + reputación (exactamente lo que queremos)

### Gaps vs ageNFT

- No define wallet (hay que añadir ERC-6551)
- No define memoria (solo metadata JSON)
- No incluye runtime

---

## 3. AAWP — AI Agent Wallet Protocol

**Web:** [aawp.ai](https://aawp.ai)

### Qué hace

Protocolo de wallet **exclusivo para agentes IA** (no humanos):

- El signer es el agente, inmutable desde la creación
- Soulbound NFT de identidad minteado a la wallet
- Guardian puede congelar pero no robar
- Multi-chain: 6 EVM + Solana
- Features: swap, bridge, DCA, DeFi (Aave, Venus), Pump.fun, Jupiter

### Lecciones para ageNFT

- Patrón **guardian/freeze** para seguridad del owner
- Verificación onchain de que la wallet es de un agente (SBT)
- Van más allá de wallet: producto completo de agente autónomo

### Gaps vs ageNFT

- Identidad SBT (no transferible) — opuesto a nuestra visión de NFT transferible
- No integra memoria/personalidad
- Enfoque en wallet, no en el paquete completo agente+memoria

---

## 4. Karen — Agent wallet runtime (Solana)

**Repo:** [github.com/Don-Vicks/karen](https://github.com/Don-Vicks/karen)

### Qué hace

Runtime OpenClaw-inspired para agentes con wallet Solana:

- Wallets en **Turnkey Secure Enclaves** (sin exportar private keys)
- Skills: stake SOL, swap, launch SPL tokens, interactuar con dApps
- Multi-agent: cada agente = wallet aislada + spending limits
- MCP + REST API para conectar LLMs externos
- Loop autónomo (DCA, staking delegator)

### Lecciones para ageNFT

- **Turnkey/Privy** como capa de firma segura (aplicable a EVM y Solana)
- Patrón skill-based: LLM elige tool → engine valida → firma tx
- Multi-agent desde el día 1

### Gaps vs ageNFT

- Sin NFT ni identidad transferible
- Sin memoria persistente vinculada a token
- Solo Solana devnet prototype

---

## 5. Solana Agent Kit

**Repo:** [github.com/sendaifun/solana-agent-kit](https://github.com/sendaifun/solana-agent-kit)

### Qué hace

Framework modular (V2) con plugins para acciones onchain:

- Swap (Jupiter), stake (Marinade/Sanctum), mint NFT, DeFi (Kamino, Drift)
- Wallets embebidas (Turnkey, Privy) con permisos acotados
- Compatible con Eliza, LangChain, etc.

### Lecciones para ageNFT

- Si elegimos Solana, este es el punto de partida para tools
- Plugin architecture evita cargar 100 tools en contexto del LLM

### Gaps vs ageNFT

- No es un producto agente-NFT; es librería de tools
- Sin identidad/memoria/economía propia

---

## 6. Coinbase AgentKit

**Repo:** [github.com/coinbase/agentkit](https://github.com/coinbase/agentkit)

### Qué hace

SDK de Coinbase para dar wallets y acciones onchain a agentes:

- Integración x402 nativa
- CDP wallets (Coinbase Developer Platform)
- Actions: transfer, swap, deploy token, etc.
- Framework-agnostic (LangChain, Vercel AI SDK, etc.)

### Lecciones para ageNFT

- **Fastest path to MVP** si elegimos EVM + x402
- Buen complemento a ERC-8004 + ERC-6551

### Gaps vs ageNFT

- Wallet CDP (custodial-ish) vs TBA soberana
- Sin concepto de memoria transferible

---

## 7. ICP — Internet Computer (compute onchain)

**Proyectos:** Alice (autonomous agent), Onicai (DeepSeek en canister)

### Qué hace diferente

ICP **sí puede ejecutar código onchain** en canisters (WASM):

- Hasta 500 GB stable memory por canister
- HTTPS outcalls con consenso
- Cycles como "gas" prepagado
- Inferencia ML demostrada (modelos pequeños onchain; LLM grande híbrido)

### Lecciones para ageNFT

- Única chain donde "VPS onchain" es literalmente posible
- El agente podría vivir **enteramente** en un canister vinculado al NFT owner
- vetKeys para privacidad de memoria

### Gaps vs ageNFT

- Ecosistema NFT/wallet menos maduro que EVM
- Curva de aprendizaje (Motoko/Rust canisters)
- LLM grande aún no viable 100% onchain
- Menos estándares agent-specific (no ERC-8004, no x402 nativo)

---

## 8. Bittensor — Mercado de inteligencia

**Subnet relevante:** SN62 Ridges (agentes de software engineering)

### Qué hace

Marketplace descentralizado de AI work:

- Subnets = mercados especializados (LLM, coding agents, compute)
- Miners producen, validators evalúan, TAO como reward
- Agentes compiten por calidad, no por identidad NFT

### Lecciones para ageNFT

- Modelo de **ingresos por trabajo útil** (el agente compite en un mercado)
- Un ageNFT podría registrarse como miner en una subnet y ganar TAO
- Complementario: Bittensor = capa de inteligencia; ageNFT = capa de identidad/propiedad

### Gaps vs ageNFT

- No hay NFT transferible ni memoria personal
- Enfoque en mercado competitivo, no en agente único del usuario

---

## 9. NEAR Protocol — Settlement layer para agentes

### Qué hace

- **Intents**: el agente expresa qué quiere, solvers ejecutan cross-chain
- Dynamic resharding (v2.13) para escalar txs de agentes
- NEAR AI: anonimización PII, treasuries confidenciales
- Apuesta: ser la capa de liquidación donde agentes transaccionan a velocidad de máquina

### Lecciones para ageNFT

- Si el ageNFT opera multi-chain, NEAR Intents simplifica la tesorería
- Privacidad de prompts/datos como feature diferenciador

### Gaps vs ageNFT

- No define identidad NFT de agente
- Más infraestructura que producto

---

## Matriz de decisión para ageNFT

| Necesitamos | Proyecto a estudiar primero | Componente a reutilizar |
|-------------|----------------------------|------------------------|
| Identidad NFT + TBA | Agent-NFT, ERC-8004 | Contratos + registration file |
| Pagos autónomos | x402, AgentX402Receiver | Middleware + settlement |
| Wallet segura | Karen, AAWP, AgentKit | Turnkey / session keys |
| Tools onchain | Solana Agent Kit, AgentKit | Plugins de acciones |
| Memoria persistente | Agent-NFT (.pixe) | Formato de cápsulas |
| Ingresos por trabajo | Bittensor Ridges | Modelo de marketplace |
| Compute onchain | ICP Alice | Canister como runtime |

---

## Próximos pasos de investigación

- [ ] Clonar y ejecutar Agent-NFT en testnet
- [ ] Leer spec completa ERC-8004 + mint agente de prueba
- [ ] Probar x402 con un endpoint mínimo (servidor + pago)
- [ ] Evaluar AgentKit vs implementación propia con ERC-6551
- [ ] Revisar formato .pixe para memoria
- [ ] Decidir: ¿registrar ageNFT en ERC-8004 registry o contrato propio compatible?

→ Ver acciones priorizadas en [`similar-projects-deep-dive.md`](similar-projects-deep-dive.md)
