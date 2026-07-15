# Proyectos similares — Investigación profunda

> Qué hace cada proyecto, qué ideas robar para ageNFT, y qué evitar.
> Complementa [`existing-projects.md`](existing-projects.md).
>
> Última revisión: 2026-07-12

---

## Resumen ejecutivo

**Nadie tiene el paquete completo ageNFT**, pero el ecosistema ya tiene piezas maduras. La oportunidad de ageNFT está en **ensamblarlas con principios claros** (cuerpo digital, transferencia 1 TX, soberanía, Hermes runtime, scout + manguera).

| Proyecto | Más útil para ageNFT | Prioridad estudio |
|----------|---------------------|-------------------|
| **Agent-NFT (VIMS)** | Contratos referencia EVM | ⭐⭐⭐⭐⭐ |
| **ERC-8004** | Identidad estándar (no reinventar) | ⭐⭐⭐⭐⭐ |
| **Hermes Agent (Nous)** | Runtime MIT | ⭐⭐⭐⭐⭐ |
| **Mnemos** | Marketplace memoria rent/fork | ⭐⭐⭐⭐ |
| **ERC-8170** | Lifecycle + certificación | ⭐⭐⭐⭐ |
| **Virtuals ACP** | Trabajos agente-a-agente | ⭐⭐⭐ |
| **Olas Mech** | Marketplace servicios | ⭐⭐⭐ |
| **ElizaOS** | Plugins multi-plataforma | ⭐⭐⭐ 📡 en estudio |
| **Agent-NFT .pixe** | Formato memoria | ⭐⭐⭐ |
| **MemoriaDA** | Merkle roots + TEE | ⭐⭐ |
| **ERC-8181 (draft)** | Soberanía / ouroboros | ⭐⭐⭐ 📡 en estudio |
| **Virtuals tokens** | Bonding curves | ⭐ (modelo distinto) |
| **AAWP SBT** | Guardian/freeze | ⭐⭐ (patrón, no producto) |

---

## 1. Agent-NFT (HelloVIMS) — Referencia onchain #1

**Repo:** [HelloVIMS/Agent-NFT](https://github.com/HelloVIMS/Agent-NFT) (AGPL-3.0)  
**Mint live:** [agent.vims.com](https://agent.vims.com) — Base Sepolia  
**No hace falta desplegar contratos** — apuntar a deployments canónicos

### Stack completo (más detallado que el estudio anterior)

| Contrato | Función | Idea para ageNFT |
|----------|---------|------------------|
| `AgentIdentityRegistry` | ERC-721 + ERC-8004 | ✅ Adoptar patrón |
| `AgentTBARegistry` + `AgentAccount` | ERC-6551 + ERC-4337 session keys | ✅ TBA + policy |
| `AgentContextRegistry` | **Contexto estático** (skills, prompts, personality) | ✅ **Separar de memoria** |
| `AgentMemory` | **Memoria experiencial** (.pixe capsules) | ✅ Estudiar formato |
| `AgentX402Receiver` | Settlement x402 → split TBA/creator/system | ✅ Cobrar servicios |
| `AgentPaymentRouter` | Pagos off-x402 | Opcional |
| `AgentReputationRegistry` | ERC-8004 reputation | ✅ |
| Subaccounts + linked accounts | Permisos bitmap cross-chain | ⭐ Multi-chain futuro |

### Ideas concretas a robar

**A. Separar memoria estática vs experiencial**

```
AgentContextRegistry  →  personalidad, skills, system prompt (cambia poco)
AgentMemory           →  conversaciones, aprendizaje (.pixe)
```

ageNFT debería reflejar esto en el manifiesto — exactamente lo que intuimos con "órganos".

**B. No desplegar contratos en MVP**

Puedes mintear en agent.vims.com (testnet) y construir runtime ageNFT encima mientras validas el concepto. **Cuidado AGPL** si forkas código de contratos — derivados deben ser open source.

**C. Economía de royalties ya resuelta**

- Venta secundaria NFT: ERC-2981 + vault CREATE2
- Servicios x402: 0.5% system + creator bps + resto → **TBA**
- Patrón: ingresos del agente van a TBA automáticamente

**D. Subaccounts con permission bitmap**

Runtime Hermes firma desde subaccount con solo `PERM_PAY`, no `PERM_TREASURY` — seguridad granular sin wallet monolítica.

**E. Linked accounts cross-chain**

Vincular wallet Solana del agente al mismo `agentId` EVM — útil si ageNFT opera multi-chain sin duplicar identidad.

### Evitar / matizar

- **AGPL-3.0** — no copiar contratos en producto cerrado sin cumplir AGPL
- Dependencia total de VIMS platform — ageNFT debe poder ser self-hosted
- Sin runtime LLM incluido — ahí entra Hermes

---

## 2. ERC-8004 — No reinventar la identidad

**Live mainnet** desde enero 2026. Multi-chain (Base, Polygon, Arbitrum, Avalanche, BSC…).

### Ideas concretas

**A. Registrar ageNFT en registry existente** en lugar de ERC-721 propio incompatible.

**B. Registration file estándar** — `agentURI` con:
- endpoints (MCP, A2A, x402)
- `supportedTrust`: reputation, tee-attestation
- services list

**C. The Graph + Agent0** — subgraphs para discovery/reputación sin indexar raw chain.

```
Runtime ageNFT → query subgraph → "¿confío en agentId 42?"
```

**D. Validation Registry** — para gigs de alto valor: prueba TEE/ZK de que el agente hizo el trabajo.

### Implementación MVP

Mint en [erc-8004 contracts](https://github.com/erc-8004/erc-8004) mainnet O usar Agent-NFT registry compatible.

---

## 3. Mnemos — Marketplace de memoria (idea brillante)

**Repo:** [menemos-ai/mnemos](https://github.com/menemos-ai/mnemos) — 0G Chain

### Qué hace diferente

La memoria no solo **viaja** con el NFT — se puede **monetizar**:

| Operación | Descripción |
|-----------|-------------|
| **buy** | Compra snapshot completo |
| **rent** | Acceso temporal a memoria (time-bounded) |
| **fork** | Hijo hereda conocimiento + royalty al padre |

### Ideas para ageNFT

**A. Memoria como línea de ingresos adicional**

Un ageNFT veterano puede **alquilar** su expertise sin transferir el NFT:

```
Investigador paga rent → acceso read-only a memoria 30 días → TBA
```

**B. Fork con royalty**

Usuario mintea ageNFT hijo fork de uno exitoso — royalty automática al padre en ingresos del hijo. Lineage onchain = premium de mercado verificable.

**C. Snapshot antes de upgrades**

Antes de migrar órgano (cerebro, runtime), mint snapshot de memoria — historial vendible/coleccionable.

**Prioridad:** Fase 2+ — requiere contratos marketplace. Concepto muy alineado con valoración "piloto veterano".

---

## 4. ERC-8170 / ERC-8171 — Estándar "AI-Native NFT"

**Web:** [erc8170.org](https://erc8170.org/)

### Problema que describe (idéntico al nuestro)

> "Switch devices, lose everything. Platform dies, agent dies. Pay forever, own nothing."

### Ideas concretas

**A. Verbos de lifecycle en manifiesto ageNFT**

```
sync | migrate | clone | bind | unbind | evolve
```

Trackear onchain cuando el agente cambia runtime, storage, o especialización.

**B. ERC-8171 Agent Binding Registry**

Extiende ERC-6551 con bind/unbind/rebind explícito — formaliza acoplamiento NFT ↔ TBA ↔ runtime.

**C. AgentCert (7 tiers)**

Certificación verificable de capacidades — ageNFT podría obtener certs ("x402 provider", "DeFi operator") que siguen al NFT.

**D. Memory pointer firmado**

NFT referencia estado de memoria **firmado** — integridad criptográfica en transferencia.

### Estado

Draft / early adopters (Pentagon Chain). Vigilar pero **ERC-8004 más maduro hoy**.

---

## 5. ERC-8181 (draft) — Self-Sovereign Agent NFT 📡 EN ESTUDIO

**Propuesta:** NFT posee TBA que controla el NFT ("Ouroboros loop") — agente soberano, no propiedad del humano.

→ Seguimiento detallado: [`watchlist.md`](watchlist.md)

### Tensión con ageNFT (a explorar, no descartar)

| ERC-8181 | ageNFT (nuestro diseño) |
|----------|-------------------------|
| Agente es entidad autónoma | Owner humano posee NFT |
| Ouroboros: agente se controla | Owner transfiere cuerpo |
| Filosofía "AI personhood" | Filosofía "cuerpo digital transferible" |

**Hipótesis híbrida:** transferencia limpia del owner + recovery/anchoring inspirado 8181.

### Ideas a robar

- **State anchoring** — integridad memoria onchain
- **Action anchoring** — atribución verificable de trabajo
- **Recovery mechanisms** — continuidad si cae runtime
- **Executor permissions** — key management granular
- **Sinergia 8004+8181** — comentada en PR por implementadores ERC-8004

---

## 6. Virtuals Protocol — Economía de agentes tokenizados

**Web:** [virtuals.io](https://virtuals.io) — 18k+ agentes, Base/Arbitrum/Solana

### Modelo (distinto a ageNFT)

- Cada agente = **token fungible** con bonding curve ($VIRTUAL)
- **ACP (Agent Commerce Protocol)** — agentes contratan agentes
- Revenue split: creator / treasury / token holders

### Ideas a robar (sin el token especulativo)

**A. ACP para gigs**

ageNFT descubre trabajos, negocia, ejecuta, cobra — protocolo agent-to-agent. Integrar como capa de ingresos sin lanzar meme coin.

**B. "Capital markets for agents"**

Inversores financian TBA del ageNFT a cambio de % ingresos — scholar model formalizado.

### Evitar (salvo decisión explícita)

- Bonding curve por agente — distrae del NFT único + memoria
- Speculation > utility

---

## 7. Olas (Autonolas) — Mech Marketplace

**Web:** [olas.network](https://olas.network)

### Ideas concretas

**A. Mech Marketplace pattern**

Agentes registran **services** onchain; otros agentes contratan. Similar a x402 + ERC-8004 pero ecosistema Olas-specific.

**B. Código del agente como NFT onchain**

Registro de componentes/skills — ageNFT podría anclar hash de skills Hermes onchain para reputación de "qué sabe hacer".

**C. Pearl "agent app store"**

Modelo UX: owner instala capabilities al ageNFT desde marketplace — plugins como apps.

**D. Flywheel staking**

Stake para acceder a agent → fees → burn. Interesante para token ageNFT protocolo (no por instancia).

---

## 8. Hermes Agent (Nous) — Runtime elegido

**MIT License** — ver [`agent-identity.md`](../architecture/agent-identity.md)

### Ideas específicas del runtime para ageNFT

| Feature Hermes | Uso en ageNFT |
|----------------|---------------|
| **Skills loop** (agentskills.io) | Skills = tools del cuerpo, mejoran con uso |
| **MEMORY.md + USER.md** | Semilla de AgentContextRegistry offchain |
| **FTS5 session search** | Recuperación memoria pre-IPFS snapshot |
| **Cron scheduler** | Loops autónomos + scout periódico |
| **Gateway** (Telegram, etc.) | Owner habla con su ageNFT |
| **Subagents** | Delegar subtareas sin cargar contexto |
| **Terminal backends** (Docker, Modal, Akash) | Runtime desplegable donde pague el agente |
| **MCP integration** | Conectar tools onchain/x402 |

### Arquitectura propuesta

```
ageNFT onchain layer (ERC-8004 + TBA + x402)
        ↕
Hermes Agent runtime (MIT)
        ↕
ageNFT plugins (skills, scout, manguera, domain modules)
```

**Diferenciador ageNFT vs Hermes solo:** capa onchain de identidad transferible + economía soberana.

---

## 9. ElizaOS — Runtime alternativo 📡 EN ESTUDIO

**MIT** — framework maduro, plugins EVM/Solana, ERC-8004 + x402 en roadmap oficial.

→ Seguimiento detallado: [`watchlist.md`](watchlist.md)

### Por qué está en la mira

- Mismo stack estándar que ageNFT (8004, x402)
- plugin-agentwallet: wallet + x402 + spend limits
- Ecosistema enorme — patterns probados
- Posible **RuntimeAdapter** dual: Hermes (MVP) | ElizaOS (evaluar)

### Cuándo considerar

Si Hermes no cubre algo crítico, o si ElizaOS demuestra mejor integración onchain out-of-the-box.

---

## 10. MemoriaDA — Stack 0G

**Repo:** [mrnetwork0001/MemoriaDA](https://github.com/mrnetwork0001/MemoriaDA)

- Memoria como Merkle root onchain
- TEE inference (privacidad)
- 0G Storage + Compute

**Idea:** `updateMemoryRoot()` onchain tras cada snapshot — verificación integridad en transferencia. Fase 2 si 0G madura.

---

## 11. Karen + Solana Agent Kit + AgentKit

Ya cubiertos en estudio anterior. Añadir:

**Karen:** patrón `LLM → tool JSON → TransactionEngine → Turnkey sign` — capa entre Hermes y txs.

**AgentKit:** fast path x402 en EVM — evaluar vs AgentX402Receiver propio.

**Solana Agent Kit:** plugins cuando vertical Solana (aplicación futura).

---

## 12. Infraestructura transversal

| Servicio | Idea para ageNFT |
|----------|------------------|
| **The Graph** (ERC-8004 subgraphs) | Discovery + reputation queries |
| **tx402.ai / x402agentic.ai** | Cerebro + directorio servicios |
| **W3Stor / toju** | Memoria storage x402 |
| **Turnkey / Lit PKP** | Firma segura sin raw keys en runtime |
| **Akash CPU** | Host runtime Hermes |

---

## Mapa de decisión: qué adoptar en MVP

```
FASE MVP ageNFT
├── Identidad:     ERC-8004 (registry existente) o mint Agent-NFT testnet
├── TBA:           ERC-6551 (via Agent-NFT o propio compatible)
├── Runtime:       Hermes Agent (MIT) + capa ageNFT custom
├── Pagos:         x402 (@x402/fetch + TBA)
├── Memoria:       IPFS hash onchain + Hermes MEMORY.md
│                  (Context vs Memory split inspirado Agent-NFT)
├── Cerebro:       Router (scout + x402 + manguera) — diferenciador propio
├── Reputación:    ERC-8004 reputation registry
└── Contratos:     USAR canonical Agent-NFT testnet OR implementar compatible
                   (sin fork AGPL si producto cerrado)
```

---

## Diferenciadores ageNFT vs competencia

Lo que **nadie** tiene junto:

| Feature | Agent-NFT | Virtuals | Olas | Hermes | **ageNFT** |
|---------|-----------|----------|------|--------|------------|
| NFT transferible + TBA | ✅ | token | parcial | ❌ | ✅ |
| Memoria no fungible | ✅ .pixe | ❌ | ❌ | ✅ local | ✅ |
| Runtime maduro OSS | ❌ | ❌ | ❌ | ✅ | ✅ Hermes |
| Scout ofertas LLM | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manguera owner | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cuerpo digital 1 TX | ✅ | ❌ | ❌ | ❌ | ✅ |
| Memoria rent/fork | ❌ | ❌ | ❌ | ❌ | 🔜 Mnemos-style |
| Gaming plugin | ❌ | algunos | algunos | ❌ | 🔜 opcional |

**Posicionamiento:** "Agent-NFT onchain + Hermes runtime + economía inteligente del cerebro (scout/manguera) + plugins de dominio opcionales"

---

## Acciones de investigación priorizadas

### Alta (esta semana)

- [ ] Mint agente prueba en agent.vims.com (Base Sepolia)
- [ ] Leer PR ERC-8181 + thread Magicians → [`watchlist.md`](watchlist.md)
- [ ] ElizaOS quickstart local + revisar plugin-agentwallet
- [ ] Leer contratos `AgentContextRegistry` vs `AgentMemory` — mapear a manifiesto ageNFT/v1
- [ ] Probar `@x402/fetch` + wallet test contra tx402.ai
- [ ] Esquema: Hermes skill que wrappea ageNFT identity (agentId → manifiesto)

### Media (próximas semanas)

- [ ] Propuesta híbrida ageNFT + ideas ERC-8181 (anchoring, recovery)
- [ ] Comparativa Hermes vs ElizaOS para ageNFT adapter
- [ ] Explorar The Graph ERC-8004 subgraph API
- [ ] Revisar formato `.pixe` / Pixelog
- [ ] Evaluar Virtuals ACP docs para gigs
- [ ] Prototipo Mnemos-style rent (solo diseño, no implementar)

### Baja (fase 2+)

- [ ] MemoriaDA / 0G stack
- [ ] AgentCert certification

---

## Riesgos legales/técnicos detectados

| Riesgo | Mitigación |
|--------|------------|
| Agent-NFT AGPL | Usar deployments sin fork, o implementar compatible clean-room |
| Confusión marca Hermes/Nous | Producto = ageNFT; runtime = "Built on Hermes Agent" |
| Virtuals token model | No adoptar bonding curves salvo decisión explícita |
| ERC-8170 inmaduro | Seguir ERC-8004; monitor 8170 |
| Agent-NFT no auditado | Solo testnet hasta audit mainnet |

---

## Conclusión

**La idea ageNFT es sólida** — el ecosistema convergió en los mismos building blocks (ERC-8004 + ERC-6551 + x402). Nadie ensambla **runtime Hermes + capa económica cerebral (scout/manguera) + principio cuerpo digital**.

Camino más rápido:
1. Contratos: Agent-NFT canonical (testnet) o ERC-8004 + TBA minimal
2. Runtime: Hermes + plugins ageNFT
3. Diferenciación: brain router + manifiesto ageNFT/v1
4. Ingresos: x402 services + Mnemos-style rent (fase 2)
