# ageNFT Registry — spec contratos (borrador)

> **Estado:** Borrador · **Fecha:** 2026-07-15  
> **Objetivo:** sustituir dependencia VIMS en Base mainnet

---

## Alcance MVP

Contratos mínimos para:
1. Mint NFT agente con `agentURI` (manifiesto IPFS)
2. TBA ERC-6551 ligada al token
3. *(Opcional v1)* receiver x402 para cobrar chat
4. *(Fase 2.5)* session key / spend policy en TBA

**Fuera de MVP v1:** ERC-8004 marketplace, reputation onchain, memory registry pesado.

---

## Contratos

### `AgeNFT` (ERC-721)

```solidity
function mint(address to, string calldata name, string calldata agentURI, bytes32 tbaSalt)
    returns (uint256 tokenId, address tba);

function agentURI(uint256 tokenId) view returns (string);
function getTBA(uint256 tokenId) view returns (address);
```

- `tokenURI` → metadata OpenSea-compatible
- `agentURI` → manifiesto ageNFT/v1 (IPFS)
- Royalty ERC-2981 opcional (creador)

### `AgeNFTTBAFactory` (ERC-6551)

- CREATE2 determinístico por `(chainId, collection, tokenId, salt)`
- Implementation: reference ERC-6551 o AgentAccount con `execute` + ERC-1271

### `AgeNFTX402Receiver` (opcional v1)

- Registrar servicio por `tokenId` + `serviceId`
- Split: `creatorBps` + `agentBps` — **sin fee protocolo VIMS**
- USDC Base `0x833589…`

---

## Flujo mint

```
1. Owner llama mint(name, agentURI ipfs://..., salt)
2. Se despliega TBA
3. Owner fondea TBA (USDC + ETH) — fuera del contrato
4. Runtime lee agentURI → órganos
5. TBA paga x402 (session key configurada post-mint)
```

---

## Relación con manifiesto

El manifiesto `ageNFT/v1` sigue siendo fuente de verdad offchain:

```json
{
  "identity": { "chain": "eip155:8453", "tokenId": "1" },
  "treasury": { "type": "erc6551", "address": "0x...", "chain": "base" }
}
```

Onchain solo: `agentURI` hash o URI + eventos mint/transfer.

**Estándares y vocabulario ERC:** [`erc-standards-primer.md`](erc-standards-primer.md)  
**Tabla fijo vs editable:** [`onchain-immutable-vs-editable.md`](onchain-immutable-vs-editable.md)

---

## Licencia / fork

- Revisar [Agent-NFT](https://github.com/tojunetwork) (AGPL) antes de copiar
- Alternativa: implementación clean-room sobre OpenZeppelin + ERC-6551 reference

---

## Deploy checklist

- [ ] Audit mínimo (slither / manual)
- [ ] Deploy Base mainnet
- [ ] Verificar en Basescan
- [ ] `addresses.base-mainnet.json` en repo (sin keys)
- [ ] Mint Unit-mainnet + fund TBA
- [ ] Actualizar dApp + manifiesto ejemplo

→ Plan completo: [`mainnet-migration.md`](../research/mainnet-migration.md)
