# Experimento VIMS — Unit-0 (Base Sepolia)

> Lab mint Fase 1 · 2026-07-12  
> Agente de referencia minteado contra deployments canónicos HelloVIMS/Agent-NFT.

---

## Resultado

| Campo | Valor |
|-------|-------|
| **Nombre** | Unit-0 |
| **agentId / tokenId** | **114** |
| **Owner** | `0xeAf1fe999633B70433cB6B506f9413f73e108C9f` |
| **TBA (tesorería)** | `0xFC9445e80fDc9334FA21A6C858f661264e40ea61` |
| **Registry** | `0xfE1ef66Ba95891d3cDf6FB83FE1444Bc3bB9FEeF` |
| **Mint tx** | [0x36acff…69fed](https://sepolia.basescan.org/tx/0x36acff6333ea3afc05f1cbca1b1cde29ef9f27732cd5c8bc87301db2a9569fed) |
| **NFT** | [token #114](https://sepolia.basescan.org/token/0xfE1ef66Ba95891d3cDf6FB83FE1444Bc3bB9FEeF?a=114) |
| **Royalty creador** | 500 bps (5%) |
| **Gas usado** | ~fraction de 0.009 ETH inicial |

Manifiesto enlazado: [`docs/manifest/examples/unit-0-lab.json`](../manifest/examples/unit-0-lab.json)

---

## Qué hace `mintWithFullStack` (3 patas en 1 tx)

Leído del source `AgentIdentityRegistry.sol` y confirmado onchain:

```
Leg 1 — registerAgent(name, agentURI, royaltyBps, anchor=0)
        → ERC-721 mint al msg.sender, creator soulbound

Leg 2 — TBA via AgentTBARegistry + salt (bytes32(0) OK)
        → wallet del token desplegada y ligada en agents[id].tbaAddress

Leg 3 — x402 service leg (opcional)
        → si serviceId/token/price son cero, se salta
```

**Parámetros que usamos (standalone):**

| Param | Valor |
|-------|-------|
| `collection` | `address(0)` — obligatorio para standalone |
| `tbaSalt` | `bytes32(0)` |
| `serviceId` | `bytes32(0)` |
| `token` / `price` | `0` — sin servicio x402 en el mint |

VIMS UI usa los mismos defaults cuando no hay `collectionId` ni servicio embebido.

---

## Aprendizajes para ageNFT

### 1. Cuerpo digital en 1 TX — confirmado

Un solo `mintWithFullStack` crea:
- identidad NFT (#114)
- metadata onchain (`tokenURI` data-URI base64)
- TBA con fondos futuros separables del owner EOA
- slot de reputación anclado (transferible, anchor=0)

Encaja con nuestro principio **transferencia 1 TX**: el comprador futuro hereda NFT + TBA con `transfer`.

### 2. Owner ≠ TBA (soberanía parcial)

| Rol | Address |
|-----|---------|
| Owner humano (firma mint) | `0xeAf1…C9f` |
| TBA del agente | `0xFC94…ea61` |

El agente **puede** tener su propia wallet; el humano controla el NFT. ageNFT runtime debe firmar desde TBA (ERC-1271 / session keys), no desde owner — alineado con `design-principles.md`.

### 3. Stack modular desplegado (no monolito)

Contratos separados en Sepolia — cada órgano intercambiable:

| Órgano VIMS | Contrato | ageNFT equivalente |
|-------------|----------|-------------------|
| Identidad | AgentIdentityRegistry | identity |
| Tesoro | ERC-6551 TBA | treasury |
| Memoria | AgentMemory + .pixe | memory |
| Contexto estático | AgentContextRegistry | manifest/skills |
| Pagos x402 | AgentX402Receiver | voice/economy |
| Reputación | AgentReputationRegistry | supportedTrust |
| Router legacy | AgentPaymentRouter | fallback pre-x402 |

**Idea a robar:** separar contexto **estático** (skills, personalidad) de memoria **experiencial** (.pixe). Nuestro manifiesto ya lo refleja (`staticHash` vs `experientialHash`).

### 4. Economía embebida desde el mint

- Creator royalty **500 bps** fijada en mint (mutable después por creador, max 50%)
- VIMS cobra **+50 bps** sistema en secundario y x402 (hardcoded en router)
- `AgentRoyaltyVault` CREATE2 por agentId — no hace falta desplegar manualmente

ageNFT debe documentar fees explícitamente en manifiesto/budget (no sorprender al owner).

### 5. Collections vs standalone

| Modo | Función | Cuándo |
|------|---------|--------|
| **Standalone** | `mintWithFullStack` | Lab, agentes individuales ageNFT ✅ |
| **Collection** | `mintToCollectionWithRoyalty` | Drops, hooks evolutivos, allowlists |

Para MVP ageNFT: **standalone**. Collections = vertical creadores más adelante.

### 6. Lo que VIMS hace y nosotros aún no

- [ ] Subir metadata a IPFS/Pinata (UI) — nosotros usamos data-URI mínima
- [ ] VIMS Desktop heartbeat + hire marketplace
- [ ] Evolution hooks (TransferRecolor, Seasonal, etc.)
- [ ] Binding runtime URL post-mint
- [ ] x402 service registration en mint (leg 3)

### 7. Diferencias ageNFT vs VIMS (intencionadas)

| | VIMS | ageNFT |
|---|------|--------|
| Runtime | VIMS Desktop / platform | Hermes Agent (self-hosted) |
| Licencia contratos | AGPL | Referencia canónica, sin fork cerrado |
| Chain prod | Sepolia ahora | Base mainnet ancla (x402) |
| Manumisión / hose | No documentado igual | Principio explícito owner→agente |

---

## Scripts

```bash
cd scripts/onchain
npm install
node mint-vims-agent.mjs Unit-0    # mint standalone
node read-agent.mjs 114            # inspeccionar onchain
```

Credenciales: `~/.credentials/agenft-base-sepolia.json` (no commitear).

---

## Próximos experimentos sugeridos

1. Fondear **TBA** con USDC Sepolia → probar `AgentX402Receiver` (micro-pago)
2. Escribir contexto en `AgentContextRegistry` → comparar con manifiesto ageNFT
3. Transferir NFT a segunda wallet → verificar que TBA viaja con el token
4. Conectar runtime Hermes leyendo `unit-0-lab.json` + firma desde TBA

---

## Referencias

- [Agent-NFT repo](https://github.com/HelloVIMS/Agent-NFT)
- [agent.vims.com/create](https://agent.vims.com/create)
- [`deployments/base-sepolia.json`](https://github.com/HelloVIMS/Agent-NFT/blob/main/deployments/base-sepolia.json)
