# VIMS vs registro propio ageNFT

> **Estado:** Decisión de producto · **Fecha:** 2026-07-15  
> **Veredicto:** VIMS fue útil en lab; **no** es la base de mainnet.

---

## Qué es VIMS (Agent-NFT)

[VIMS / agent.vims.com](https://agent.vims.com) es un stack **Agent-NFT** desplegado en **Base Sepolia**:

| Contrato / pieza | Función |
|------------------|---------|
| `AgentIdentityRegistry` | Mint NFT + agentId |
| `AgentTBARegistry` | Factory ERC-6551 |
| `AgentContextRegistry` | skills.md, context onchain |
| `AgentMemory` | versiones memoria onchain |
| `AgentX402Receiver` | servicios que cobra el agente |
| `AgentPaymentRouter` | splits de pago |

**Unit-1 #115** nació ahí: TBA `0x2FF43…e969`, registry `0xfE1ef66…`.

---

## ¿VIMS funciona en mainnet?

**No para nuestro caso hoy.**

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay mint público ageNFT en Base mainnet vía VIMS? | **No verificado / no disponible** para el lab |
| ¿agent.vims.com opera en 8453? | **No** — lab conocido = Sepolia |
| ¿Los órganos x402 (cerebro, storage) usan mainnet? | **Sí** — siempre han usado mainnet |
| ¿Encaja con “un cuerpo, una cadena”? | **No** — Sepolia NFT + mainnet USDC = tesoro roto |

**Conclusión:** la historia VIMS **funciona como sandbox Sepolia**, no como producto mainnet unificado.

---

## Problemas concretos que vimos

1. **Split cadena** — NFT/TBA Sepolia; pagos USDC mainnet → TBA no puede pagar el cerebro.
2. **Fee VIMS** — split x402: ~0.5% sistema + royalty creador (documentado en lab).
3. **AGPL** — fork posible, pero dependencia operativa de infra ajena.
4. **Memoria onchain VIMS** — acoplada a su registry; no sustituye IPFS/toju soberano.
5. **toju staging Sepolia** — roto (timeout); refuerza “servicios = mainnet”.
6. **Control producto** — mint wizard, fees, uptime, ERC-8004 timing = nuestro roadmap, no el de VIMS.

---

## Propuesta: nuestro “VIMS” (ageNFT Registry)

Nombre interno: **ageNFT Registry** — stack mínimo **propio** en Base mainnet.

### MVP contratos (Fase 3 mainnet)

```
ageNFTRegistry (ERC-721 + agentId)
    ├── TBASafeFactory (ERC-6551 o AgentAccount con session keys)
    ├── ManifestAnchor (agentURI + contentHash onchain)
    ├── X402Receiver (opcional — cobrar por chat/API)
    └── ReflexPolicy (caps onchain, fase 2.5)
```

### Qué reutilizar de Agent-NFT (ideas, no dependencia)

| Pieza VIMS | ageNFT propio |
|------------|---------------|
| `mintWithFullStack` | `mintAgeNFT(name, agentURI, tbaSalt, …)` |
| Context registry | **Manifiesto IPFS** + hash onchain (skills dentro del JSON) |
| Memory registry | **Hashes** en manifiesto; blob en toju/W3Stor/Arweave |
| X402 receiver | Fork simplificado **sin fee VIMS**; royalty creador configurable |
| Payment router | Reflejos runtime + caps manifiesto; onchain después |

### Qué NO copiar

- Acoplamiento a Sepolia como red “oficial”
- Memoria PIXE/lab-remote como primario
- Split obligatorio a treasury VIMS
- Identidad sin ERC-8004 cuando toque marketplace (Fase 4)

---

## Licencias y forks

- **Agent-NFT / VIMS:** respetar **AGPL** si fork de contratos; leer repos antes de copiar bytecode.
- **ageNFT runtime, manifiesto, dApp:** MIT / propio.
- **Estándares abiertos:** ERC-721, ERC-6551, ERC-8004, x402 — sin restricción.

---

## Decisión

| Antes | Después |
|-------|---------|
| Mint en agent.vims.com (Sepolia) | Deploy **ageNFT Registry** Base mainnet |
| Unit-1 #115 como agente “oficial” | Unit-1 = lab legacy; **Unit-mainnet** nuevo mint |
| Pago cerebro EOA lab | Pago desde **TBA mainnet** con USDC |
| Context/Memory VIMS onchain | Manifiesto + IPFS + x402 storage |

---

## Siguiente paso técnico

Ver [`mainnet-migration.md`](mainnet-migration.md) — Bloque A: spec contratos + deploy testnet local → mainnet.
