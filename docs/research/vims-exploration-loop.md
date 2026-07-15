# VIMS exploration loop — ageNFT lab

> Loop activo desde 2026-07-12. Documento vivo de experimentos contra HelloVIMS/Agent-NFT.

---

## Agentes de laboratorio

| Agente | ID | Owner | Estado |
|--------|-----|-------|--------|
| **Unit-1** ✅ | **115** | `0xeAf1…C9f` (tu wallet) | **Activo** — órganos poblados |
| Unit-0 ⚠️ | 114 | `0xD206…1F83` (wallet efímera perdida) | **Huérfano** — lección aprendida |

**Unit-1 TBA:** `0x2FF43DB36d93F3cd55A0F7B15175266F7d31e969`

---

## Experimentos completados (Unit-1 #115)

### ✅ Identidad + TBA (mint)
- `mintWithFullStack` — [tx](https://sepolia.basescan.org/tx/0xb1e415788dcc79c6d3c0a3c1607191adc161252f0a2d7d7f55b2595d4c24d05d)
- TBA desplegada en la misma tx

### ✅ Contexto estático (`AgentContextRegistry`)
- `addFile("skills.md", ipfs://…, contentHash)` — [tx](https://sepolia.basescan.org/tx/0xcc3971710397404f140da74a13fbca6f9e7132a86cb944df9e8ea42fa645cc92)
- **Lección:** `storageURI` data-URI base64 **>512 bytes revierte** (`TooLarge`). Usar IPFS/HTTPS corto + hash onchain.
- **Para ageNFT:** manifiesto offchain + `staticHash` onchain = mismo patrón VIMS

### ✅ Memoria experiencial (`AgentMemory` / .pixe)
- `addVersion` TYPE_CAPSULE, CATEGORY_SKILL, TIER_L2 — [tx](https://sepolia.basescan.org/tx/0xa00c6baf045b13f31128b1270965014a0a9468c7c1dc95afd21cfe10ed031c96)
- URI: `pixe://lab/unit-0/bootstrap-v1`
- **Para ageNFT:** compatible con nuestro `experientialHash` + toju como storage real

### ✅ Economía x402 (`AgentX402Receiver`)
- Servicio `agenft-lab-chat` @ **0.001 USDC** — [tx](https://sepolia.basescan.org/tx/0xbd29254eff66645082a8a547d26e53633ebe4a9ae2484b8e592aea433503d453)
- Split onchain (precio 1000 units = 0.001 USDC):

| Destino | Amount | % |
|---------|--------|---|
| VIMS sistema | 5 | 0.5% |
| Creador (tú) | 50 | 5% |
| Agente (TBA) | 945 | 94.5% |

- **Para ageNFT:** documentar fees VIMS-like en manifiesto; runtime cobra vía `AgentX402Receiver` o directo tx402

### ⚠️ Transferencia NFT (cuerpo digital)
- **Confirmado:** TBA **no cambia** al transferir NFT — mismo address pre/post
- **Checklist automatizado jul-2026:** `transfer-checklist.mjs` — **7/7 PASS** round-trip Unit-1
- Memoria offchain resuelve **independiente del owner** (puntero + cápsula)
- Transfer out/in requiere **gas en wallet temp** + poll RPC + `gas: 200000n`
- Recovery: `recover-agent.mjs` si return transfer falla
- Doc: [`transfer-checklist-lab.md`](transfer-checklist-lab.md)

### ❌ Discover / marketplace index
- `GET /api/discover/services/84532/114` → `agent not found`
- Agente **no aparece** en browse hasta: heartbeat VIMS Desktop, listing marketplace, o indexador The Graph
- **Para ageNFT:** no depender del índice VIMS — self-hosted discover + ERC-8004

---

## Mapa órganos VIMS → ageNFT

```
AgentIdentityRegistry  → identity (ERC-721 + creator royalty soulbound)
AgentTBARegistry       → treasury (ERC-6551)
AgentContextRegistry   → manifest/skills estáticos (hashes onchain)
AgentMemory            → memory experiencial (.pixe)
AgentX402Receiver      → voice/economy (pagos atómicos)
AgentReputationRegistry→ supportedTrust / ERC-8004 feedback
AgentPaymentRouter     → fallback pre-x402 direct pay
AgentRoyaltyVault      → CREATE2 per agentId (secundario)
AgentCollectionFactory → NO para MVP (drops generativos)
Evolution hooks        → NO para MVP (TransferRecolor, Seasonal…)
```

---

## APIs VIMS descubiertas (frontend bundle)

| Endpoint | Uso |
|----------|-----|
| `agent.vims.com/api/discover/services/{chain}/{agentId}` | Índice marketplace |
| `agent.vims.com/api/discover/reputation/` | Reputación federada |
| `agent.vims.com/api/x402/mandate-run/` | Ejecución x402 mandato |
| `mcp.vims.com` | Marketplace MCP (Claude/Cursor) |
| The Graph `vims/0.1.1` | Indexador (rate limited) |

**Nota:** Muchas rutas devuelven 404 si el agente no está registrado en el hub — diseño federado: *"agents host their own endpoints"*.

---

## Scripts lab

```bash
cd scripts/onchain
node read-agent.mjs 115
node probe-organs.mjs 115
node run-experiments.mjs 115
node transfer-test.mjs 115      # round-trip NFT; guarda temp key
node ../validate-manifest.mjs docs/manifest/examples/unit-1-lab.json
```

---

## Ideas robadas (prioridad ageNFT)

1. **Tres patas mint** — identidad + TBA + servicio x402 opcional en 1 tx
2. **Context vs Memory split** — estático (skills) vs experiencial (.pixe)
3. **contentHash SHA-256** onchain — tamper detection offchain storage
4. **quoteSplit transparente** — owner ve reparto antes de fijar precio servicio
5. **Subaccounts + PERM_* bitmap** — TBA puede escribir contexto sin ser owner NFT (soberanía parcial)
6. **Royalty vault CREATE2** — dirección determinística por tokenId

## Evitar / diferenciar

1. **Dependencia VIMS Desktop heartbeat** para marketplace hire
2. **AGPL** si forkamos contratos cerrados
3. **Indexador centralizado** como única fuente de verdad
4. **data-URI largas** en storageURI (límite 512 bytes)

---

## Próximos experimentos (loop continúa)

- [ ] Fondear TBA Unit-1 con USDC Sepolia → simular pago x402 (sin mainnet aún)
- [ ] Escribir desde **TBA** (subaccount PERM_CONTEXT_WRITE) — test soberanía
- [ ] `deployRoyaltyVault(115)` + inspeccionar CREATE2
- [ ] Decodificar `agentURI` VIMS de agentes browse existentes (metadata marketplace)
- [ ] Runtime Hermes stub leyendo `unit-1-lab.json`
- [ ] Recuperar o re-mintear Unit-0 si hace falta referencia dual

---

## Manifiestos

- [`unit-1-lab.json`](../manifest/examples/unit-1-lab.json) — **canónico lab activo**
- [`unit-0-lab.json`](../manifest/examples/unit-0-lab.json) — obsoleto (NFT huérfano)

---

*Última actualización: 2026-07-12 — loop en curso hasta "basta".*
