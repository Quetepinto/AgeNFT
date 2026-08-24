# Migración cross-chain — llevar el ageNFT a otra red

> **Estado:** Visión largo plazo · **Jul-2026**  
> **Soñar:** mover el agente de Base a otra cadena (u otras) con **un clic**, complejidad **debajo** — órganos lo más vivos posible, adaptados a la red destino.

---

## La idea en criollo

Tu ageNFT “nació” en **Base** (cadena nativa). Un día quieres la **misma identidad** (URUIRU, memoria, biblioteca, reglas) en **Arbitrum**, **Solana**, etc.

Imaginas:

1. **Bloqueas** el NFT original en un contrato en Base (como un depósito en custodia).
2. **Minteas una copia espejo** en la otra red — no un PNG distinto, sino el **mismo agente** con manifiesto adaptado.
3. Los **órganos se reconfiguran solos**: mismo cerebro x402 si puede, pero gas, USDC, puentes y TBA cambian según la red.
4. Volver atrás = proceso inverso (desbloquear el original).

La complejidad (puentes, mensajes cross-chain, hashes) **no la ve el owner** — ve “Expandir a Arbitrum” y un wizard.

---

## ¿Existe algo parecido?

### Puentes NFT genéricos (sí existen)

| Mecanismo | Cómo funciona | Ejemplos / refs |
|-----------|---------------|-----------------|
| **Lock & mint** | NFT bloqueado en cadena A → wrapped mint en cadena B | deBridge **deNFT**, Polygon PoS, muchos bridges |
| **Burn & mint** | Quema en A → mint canonical en B (un solo vivo) | Chainlink **CCIP** tutorial NFT, colecciones “native cross-chain” |
| **Lock & unlock** | Dos colecciones espejo; solo uno activo | Patrón gaming |

Referencias: [deBridge deNFT](https://github.com/debridge-finance/denft), [CCIP cross-chain NFT](https://github.com/kaiachain/kaia-docs/blob/main/docs/build/tutorials/cross-chain-nft.md), LayerZero / Wormhole / Axelar (mensajería).

### Lo que **no** existe (hueco ageNFT)

| Genérico | ageNFT soñado |
|----------|---------------|
| Mueve el token ERC-721 | Mueve **cuerpo digital**: manifiesto, capas memoria, biblioteca IPFS |
| Wrapped = imagen/metadata | Wrapped = **agentURI** + perfil órganos **adaptado** |
| Una TBA o ninguna | **TBA por cadena** (ERC-6551) o cuenta omnichain futura |
| Usuario elige bridge manual | **Wizard**: Doctor re-provisiona cerebro, gas, storage |
| No hay “órganos” | **Transplante** guiado — [`dual-doctor.md`](dual-doctor.md) |

**Conclusión:** el **puente NFT** es pieza conocida; la **migración de agente completo** con órganos vivos es **propuesta ageNFT**.

---

## Arquitectura soñada (alto nivel)

```
  CADENA NATIVA (ej. Base)              CADENA DESTINO (ej. Arb)
 ┌─────────────────────────┐           ┌─────────────────────────┐
 │ ageNFT #1 LOCKED        │  CCIP /   │ ageNFT #1 MIRROR        │
 │ en MigrationVault       │  LZ /     │ agentId ligado onchain  │
 │ TBA intacta (dormant)   │  deBridge │ TBA nueva en Arb        │
 │ agentURI → snapshot     │ ───────►  │ agentURI → manifest Arb │
 └─────────────────────────┘           └─────────────────────────┘
           │                                       │
           └──── memoria/biblioteca IPFS (chain-agnostic) ────┘
```

### Registro de ligadura (onchain)

```solidity
// Conceptual — no implementado
event AgentChainLinked(
  uint256 indexed agentId,
  uint256 nativeChainId,
  uint256 mirrorChainId,
  bytes32 nativeLockId,
  bytes32 mirrorManifestHash
);
```

Un **agentId lógico** atraviesa cadenas; en cada una hay **como mucho un** NFT activo (native o mirror, nunca dos operativos).

---

## Dos modos de migración

| Modo | Owner ve | Cuándo |
|------|----------|--------|
| **Expandir** (lock + mirror) | Original dormido en Base; copia activa en Arb | Quiere **operar** en otra red |
| **Migrar casa** (burn + mint) | Solo queda en cadena nueva | Cambio definitivo de “home chain” |
| **Visitar** (session bridge) | Copia temporal; vuelve a desbloquear | Prueba corta — rental cross-chain 💡 |

Recomendación diseño: **expandir** primero (reversible); burn-mint solo con confirmación fuerte.

---

## Qué viaja vs qué se adapta

| Pieza | ¿Viaja igual? | En destino |
|-------|---------------|------------|
| **M1 canon** (URUIRU, soul) | ✅ contenido | Igual |
| **Memoria M2/M3, biblioteca B** | ✅ IPFS/CID | Igual URI |
| **Manifiesto base** | ✅ snapshot | + **chain overlay** |
| **TBA / tesoro** | ❌ no automático | Nueva TBA; puente USDC manual o integrado |
| **Cerebro x402** | ⚠️ si red soportada | Misma URL si x402 acepta red destino |
| **Gas** | ❌ | ETH nativo de la L2 destino |
| **Gateways** | ⚠️ | Telegram igual; contratos onchain distintos |
| **Reflejos** | ✅ reglas | Recalcular caps en moneda/red |
| **Runtime** | ⚠️ | Redeploy Akash/VPS en región cadena |

### Manifiesto overlay (borrador)

```json
{
  "identity": { "chain": "eip155:8453", "homeChain": true },
  "chainOverlays": {
    "eip155:42161": {
      "treasury": { "address": "0x…", "chain": "arbitrum" },
      "organs": {
        "brain": { "network": "eip155:42161" },
        "memory": { "operational": { "primary": "ipfs" } }
      },
      "budget": { "currency": "USD" }
    }
  },
  "migration": {
    "mode": "lock-mirror",
    "nativeLockTx": "0x…",
    "mirrorRegistry": "0x…"
  }
}
```

Doctor Vitality ejecuta **checklist transplante** por overlay (como transfer local-hosting, pero cross-chain).

---

## Flujo UX soñado (owner)

```
1. Dashboard / Organ Studio → "Añadir cadena"
2. Elige destino (Arbitrum, Optimism…)
3. Preview: "Cerebro OK · USDC hay que puente · Telegram OK · Sentidos G local"
4. Firma: lock native + mint mirror (una tx batch o dos guiadas)
5. Wizard destino: fondear TBA Arb, npm run checklist --chain arb
6. URUIRU vivo en dos mundos — uno dormido, uno activo
7. "Volver a Base" → quemar mirror / desbloquear native
```

**Trial/venta cross-chain:** comprador elige cadena de operación; `saleConfigHash` incluye overlay permitido.

---

## Piezas técnicas (debajo del capó)

| Capa | Opciones ecosistema |
|------|---------------------|
| Mensajería | LayerZero, CCIP, Wormhole, Axelar, deBridge |
| Vault lock | Contrato MigrationVault ageNFT registry |
| Mirror mint | Factory por cadena, mismo `agentId` |
| Prueba no doble-gasto | Nonce bridge + Hygiene |
| TBA multichain | ERC-6551 por chain; futuro AA omnichain |
| Eliza plugin | Swap/bridge — complemento Fase 5, no core |

Spike previo: TBA 6551 ≠ AgentAccountV2 Eliza — migración cross-chain **no** depende de Eliza.

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Dos URUIRU operativos a la vez | Lock obligatorio; mirror inactivo si native desbloqueado |
| Liquidez TBA vacía en destino | Wizard fondeo + aviso |
| Manifiesto incompatible (Solana vs EVM) | Perfiles **EVM** primero; Solana = Fase lejana |
| Bridge hack / mensaje falso | Registry oficial + timelock + auditoría Hygiene |
| Complejidad legal | Disclaimers; owner entiende custodia en vault |

---

## Fases realistas

| Fase | Alcance | Estado |
|------|---------|--------|
| **C0** | Documentar visión (este doc) | 📐 |
| **C1** | Base-only producto sólido | ✅ en curso |
| **C2** | Manifiesto `chainOverlays` schema | 💡 |
| **C3** | Lock vault + mirror EVM testnet | 💡 |
| **C4** | Wizard + Doctor transplant checklist | 💡 |
| **C5** | Mainnet 2ª cadena (ej. Arb) | 💡 |
| **C6** | Solana / no-EVM | ⏸ |

---

## Relación con transfer “normal”

| Transfer wallet → wallet | Cross-chain |
|--------------------------|-------------|
| Misma cadena | Distinta cadena |
| NFT + TBA mismo contrato | Lock + mirror o burn-mint |
| Runtime local vs cloud | + adaptación órganos red |

Pueden combinarse: comprador en Arb recibe mirror; vendedor desbloquea native en Base.

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`organ-studio-visual.md`](organ-studio-visual.md) | Ver cadena nativa + satélites en grafo |
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Mudanza hosting (misma cadena) |
| [`mainnet-migration.md`](mainnet-migration.md) | Base como home hoy |
| [`dual-doctor.md`](dual-doctor.md) | Transplante órganos |
| [`pieces-taxonomy.md`](pieces-taxonomy.md) | Clasificación |

---

*Idea usuario Jul-2026 — “wrap bloqueado + copia viva en otra red”. Validar con bridge partners antes de implementar.*
