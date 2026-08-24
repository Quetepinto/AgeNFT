# On-chain: qué es fijo vs editable en ageNFT

> **Estado:** Decisión de producto · **Jul-2026**  
> Vocabulario ERC: [`erc-standards-primer.md`](erc-standards-primer.md)

---

## Contrato desplegado hoy (`AgeNFT.sol`)

Sin `setAgentURI` ni setters — **write-once en mint**:

| Campo | Editable | Notas |
|-------|----------|-------|
| `tokenId` | No | Identidad numérica |
| Contrato colección | No | `0x76FC…eB839` Base |
| Cadena | No | `eip155:8453` |
| Dirección TBA | No | ERC-6551 ligada al token |
| `name` | No* | Nombre en registro interno |
| `agentURI` | No* | Pointer manifiesto |
| `ownerOf` | Transfer | Venta = cambio owner, no edición metadata |

\*Futuro: `setAgentURI` permitirá nueva versión del manifiesto **con tx + gas**. La URI anterior y su contenido IPFS siguen existiendo como histórico.

---

## Decisión producto (manifiesto + UX)

### Fijo para el owner (ADN identidad)

- `image`, `portrait`, `idleAsset`, `voiceId`, serie visual (ej. Gespenster)
- Origen: **creador de colección**, no wizard del comprador

### Editable (off-chain o con tx futura)

- Órganos, budgets, gateways, presencia ON/OFF → manifiesto / `setAgentURI`
- Cables operativos → `runtime/wiring/{packId}.json` (**no ERC**)
- Preferencias runtime → servidor / local

### Nunca on-chain

- Vault V0 (keys, tokens)
- Memoria personal cruda (M2)
- Wiring operativo

---

## Futuro contrato v2

| Campo | Comportamiento |
|-------|----------------|
| `setAgentURI` | Owner publica snapshot manifiesto nuevo |
| `saleConfigHash` | **Inmutable** tras commit oferta trial/venta |
| `libraryHash` | Incluido en oferta de venta acordada |

Ver [`../research/memory-layers-access.md`](../research/memory-layers-access.md) § Trial → compra.

---

## Tres capas (resumen)

```
ERC-721 + ERC-6551     →  identidad + tesoro (poco campos, muy estables)
agentURI → manifiesto  →  ADN + servicios (editable con política producto)
wiring + runtime       →  operación diaria (sin blockchain)
```
