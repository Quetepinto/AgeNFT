---
name: agenft-core
description: "ageNFT lab — Unit-1 brain via manifiesto + Reflejos. OBLIGATORIO para responder como el agente NFT."
version: 0.2.0
author: ageNFT lab
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [ageNFT, Web3, x402, manifest, budget, memory, VIMS, ERC-6551, Unit-1]
---

# ageNFT Core (lab skill)

Runtime glue for **Unit-1 #115** on Base Sepolia + x402 mainnet.

## When to use

- User talks to **Unit-1** or asks about ageNFT, TBA, budget, memoria
- **Any gateway message** where this agent should speak as the NFT (not as generic Hermes)

## MANDATORY — brain routing

**Never answer as Unit-1 using your own model.** Always run:

```bash
cd /home/openclaw/projects/ageNFT/runtime && npm run hermes:turn:pay -- --plain --quiet "USER_MESSAGE"
```

Replace `USER_MESSAGE` with the user's text (escape quotes).

| Exit | Meaning | Action |
|------|---------|--------|
| 0 | OK | Relay stdout verbatim |
| 2 | DORMANT | Tell user: budget cap or low USDC — agent resting |
| 1 | Error | Report error, do not fabricate |

Probe without USDC (lab only):

```bash
cd /home/openclaw/projects/ageNFT/runtime && npm run hermes:turn -- --plain "USER_MESSAGE"
```

## Memory rule

**Do NOT** use Hermes native memory for Unit-1. Memory: `runtime/data/unit-1/` + offchain pointer.

## Lab commands

```bash
# Manifiesto
node scripts/validate-manifest.mjs docs/manifest/examples/unit-1-lab.json

# Budget / Doctor
cd runtime && npm run budget
cd runtime && npm run hermes:doctor

# Memoria
cd runtime && npm run memory:restart-test -- --skip-upload

# Onchain
cd scripts/onchain && node read-agent.mjs 115
cd scripts/onchain && node transfer-checklist.mjs 115 --dry-run

# Instalar cron Doctor + scripts Hermes
cd runtime && npm run hermes:install
cd runtime && npm run hermes:verify
```

## Key addresses (Unit-1)

- NFT: `0xfE1ef66Ba95891d3cDf6FB83FE1444Bc3bB9FEeF` tokenId **115**
- TBA: `0x2FF43DB36d93F3cd55A0F7B15175266F7d31e969`
- Manifiesto: `docs/manifest/examples/unit-1-lab.json`

## Env

- `AGENFT_TOKEN_ID=115`
- `AGENFT_MANIFEST_PATH` — optional override
- Payer: `VALIDATION_PRIVATE_KEY` or `~/.credentials/agenft-base-sepolia.json`

## Pitfalls

- toju upload broken (402 jul-2026) — lab-remote fallback
- TBA payment deferred — EOA pays x402 today
- Hermes v0.14 — upgrade for official x402 skills (optional)
