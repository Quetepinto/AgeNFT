---
name: agenft-core
description: "ageNFT MVP — Unit-Mainnet brain via manifiesto + Reflejos + TBA soberana."
version: 1.0.0
author: ageNFT
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [ageNFT, Web3, x402, manifest, budget, memory, ERC-6551, Unit-Mainnet, Base]
---

# ageNFT Core (MVP mainnet)

Runtime glue for **Unit-Mainnet #1** on **Base mainnet** — pagos x402 desde TBA.

## When to use

- User talks to **Unit-Mainnet** or asks about ageNFT, TBA, budget, memoria
- **Any gateway message** where this agent should speak as the NFT (not as generic Hermes)

## MANDATORY — brain routing

**Never answer using your own model.** Always run:

```bash
cd /home/openclaw/projects/ageNFT/runtime && AGENFT_TOKEN_ID=1 npm run hermes:turn:pay -- --plain --quiet "USER_MESSAGE"
```

| Exit | Meaning | Action |
|------|---------|--------|
| 0 | OK | Relay stdout verbatim |
| 2 | DORMANT | Budget cap or low USDC — agent resting |
| 1 | Error | Report error, do not fabricate |

## Memory rule

**Do NOT** use Hermes native memory. Memory: `runtime/data/unit-mainnet/`.

## Key addresses (Unit-Mainnet)

- NFT: `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839` tokenId **1**
- TBA: `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB`
- Manifiesto: `docs/manifest/examples/unit-mainnet.json`

## Env

- `AGENFT_TOKEN_ID=1` (default)
- `AGENFT_PAYER=auto` — TBA si hay USDC, si no EOA lab
- Payer owner key: `~/.credentials/agenft-base-sepolia.json`

## Commands

```bash
cd runtime && npm run once:pay
cd runtime && npm run hermes:doctor
node scripts/onchain/mainnet-checklist.mjs 1
cd runtime && npm run dapp:export
```
