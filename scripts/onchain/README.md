# Onchain lab scripts — Base Sepolia

Scripts exploratorios contra **HelloVIMS/Agent-NFT**. No son el producto ageNFT final.

## Setup

```bash
cd scripts/onchain
npm install
```

Wallet: `~/.credentials/agenft-base-sepolia.json` (chmod 600).

## Comandos

```bash
node read-agent.mjs 115              # identidad + TBA
node probe-organs.mjs 115            # context, memory, x402
node transfer-checklist.mjs 115      # Fase 2.3 round-trip + checklist
node transfer-checklist.mjs 115 --dry-run
node recover-agent.mjs 115           # recuperar NFT si falla return transfer
node transfer-test.mjs 115           # transfer simple (legacy)
node mint-vims-agent.mjs Unit-1       # mint nuevo agente
```

npm scripts: `npm run transfer-checklist`, `npm run recover`, `npm run probe`

## Lab canónico

- **Unit-1 #115** — agente activo, owner lab wallet
- Doc transfer: [`docs/research/transfer-checklist-lab.md`](../../docs/research/transfer-checklist-lab.md)
- Loop VIMS: [`docs/research/vims-exploration-loop.md`](../../docs/research/vims-exploration-loop.md)

## Unit-0 #114

Huérfano (transfer sin guardar clave temp). Ver [`vims-lab-unit-0.md`](../../docs/research/vims-lab-unit-0.md).
