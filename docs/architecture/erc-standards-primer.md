# ERC / EIP — vocabulario y estándares ageNFT

> **Estado:** Referencia · **Jul-2026**  
> Para owners y devs que no viven en Solidity. Complementa [`agenft-registry-spec.md`](agenft-registry-spec.md) y la tabla fijo/editable en [`onchain-immutable-vs-editable.md`](onchain-immutable-vs-editable.md).

---

## Vocabulario (en orden)

| Término | Qué es | Analogía |
|---------|--------|----------|
| **EIP** (*Ethereum Improvement Proposal*) | Propuesta escrita: “así debería funcionar X” | Borrador de norma |
| **ERC** (*Ethereum Request for Comments*) | EIP **aceptada** como estándar de la industria | Norma publicada (ERC-721, ERC-6551…) |
| **Estándar / protocolo** | En la práctica, lo mismo que **ERC** en conversación | “Usamos el estándar ERC-721” |
| **Contrato** | Código Solidity **desplegado** en una cadena (Base) | Tu copia concreta del estándar |
| **Implementación** | Cómo tu contrato cumple el estándar + extras propios | `AgeNFT.sol` |

**Importante:** el ERC dice qué funciones mínimas debe tener un NFT “compatible”. **No** dice qué datos son permanentes — eso lo decide **tu contrato** (¿hay `setTokenURI`? ¿`setAgentURI`?).

---

## Stack elegido para ageNFT (MVP mainnet)

```
┌─────────────────────────────────────────────────────────────┐
│  ERC-721  →  AgeNFT.sol  →  tokenId #1  (identidad)         │
│       │                                                      │
│       └── en el mint ──►  ERC-6551  →  TBA (tesoro USDC)    │
│                                                              │
│  agentURI  ──►  manifiesto ageNFT/v1  (IPFS / HTTPS)        │
│                 ADN + estética + órganos (mayoría off-chain) │
│                                                              │
│  wiring.json  ──►  NO es ERC — config operativa local       │
└─────────────────────────────────────────────────────────────┘
```

| Estándar | Rol en ageNFT | Estado hoy |
|----------|---------------|------------|
| **ERC-721** | NFT transferible — “el agente es este token” | ✅ `AgeNFT` en Base |
| **ERC-6551** | Token Bound Account — wallet ligada al NFT | ✅ TBA Unit-Mainnet #1 |
| **ERC-1271** | La TBA valida firmas (owner / session key) | ✅ probe lab |
| **ERC-8004** | Registro/descubrimiento de agentes | ⏸ Fase 4 — no desplegado |
| **ERC-2981** | Royalties creador (OpenSea) | 📐 opcional futuro |
| **ERC-4337** | Smart account / paymaster / session keys avanzadas | 📐 alternativa TBA |
| **EIP-3009** | USDC `transferWithAuthorization` (x402) | ✅ pagos cerebro |

**Cadena:** Base mainnet (`eip155:8453`) — ver [`chain-base-mainnet.md`](../decisions/chain-base-mainnet.md).

**Contrato live:** [`addresses.base-mainnet.json`](../research/lab/addresses.base-mainnet.json).

---

## ¿Cambia lo “permanente” según el ERC?

### Regla general

| Pregunta | Respuesta |
|----------|-----------|
| ¿Todos los NFT ERC-721 guardan lo mismo? | **No.** El estándar exige `ownerOf`, `transfer`, etc. Los **metadatos extra** (nombre, URI, TBA…) son decisión del contrato. |
| ¿ERC-721 vs ERC-1155 cambia qué es fijo? | Cambia el **modelo de token**, no una lista mágica de campos inmutables. |
| ¿Dónde va la “cara” del agente? | Casi siempre **off-chain** (JSON en IPFS) apuntado por `tokenURI` / `agentURI`. |
| ¿Qué es realmente irreversible on-chain? | Lo que el contrato **escribe una vez sin función de editar** + historial de txs. |

### ERC-721 (el que usamos) — pieza única

- **Un `tokenId` = un agente** (no fungible).
- OpenSea, Zora, wallets lo entienden nativamente.
- Patrón típico: `tokenURI(tokenId)` → JSON con `name`, `image`, `description`.
- **ageNFT añade:** `agentURI`, `getTBA`, registro interno `AgentRecord`.

**En nuestro contrato actual:** `name`, `agentURI`, dirección TBA → **fijados en el mint** (sin setter).

### ERC-1155 (no elegido)

- Un contrato, **muchos ids**; puede representar cantidades > 1 del mismo id.
- Útil para items de juego, ediciones numeradas en batch.
- **No encaja** con “un agente = un activo único con TBA propia” como identidad principal.

### ERC-6551 (complemento, no sustituto del 721)

- **No es un NFT de agente.** Es una **cuenta** (wallet) cuyo “dueño lógico” es un NFT ERC-721.
- Lo permanente: **vínculo** `(chainId, contrato NFT, tokenId) → dirección TBA`.
- Lo editable: **saldo** USDC/ETH, permisos internos, session keys (futuro).

### ERC-8004 (futuro)

- Registro de **identidad de agente** para descubrimiento (marketplace, apps).
- Complementaría al 721; **no reemplaza** al token ni a la TBA.

---

## Mapa: dónde vive cada dato

| Dato | Estándar / capa | ¿Fijo post-mint? (hoy) |
|------|-----------------|-------------------------|
| `tokenId` | ERC-721 | Sí |
| Owner | ERC-721 | Cambia solo con **transfer** |
| Dirección TBA | ERC-6551 | Sí |
| `name`, `agentURI` | Extra en AgeNFT | Sí (sin `setAgentURI`) |
| Imagen / URUIRU / voz | Manifiesto off-chain | Fijo por **decisión producto** (creador) |
| Cerebro, memoria, gateways | Manifiesto + wiring | Editable off-chain / wiring |
| Secretos (Vault V0) | Runtime local | Nunca on-chain |
| `saleConfigHash` (trial/venta) | Futuro en contrato | Fijo tras **commit** |

---

## Lab legacy vs producto

| | Sepolia Unit-1 #115 | Base Unit-Mainnet #1 |
|--|---------------------|----------------------|
| Registro NFT | VIMS / ERC-8004 lab | **AgeNFT** ERC-721 propio |
| Producto | Histórico | **Candidato oficial** |

---

## Docs relacionados

- [`agenft-registry-spec.md`](agenft-registry-spec.md) — funciones del contrato
- [`onchain-immutable-vs-editable.md`](onchain-immutable-vs-editable.md) — tabla fijo vs editable
- [`../backups/character-identity-20260713.md`](../backups/character-identity-20260713.md) — estética fija del creador
- [`../research/pieces-taxonomy.md`](../research/pieces-taxonomy.md) — mapa de piezas
