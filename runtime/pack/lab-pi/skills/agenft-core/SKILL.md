---
name: agenft-core
description: "ageNFT lab — host Pi (pi.dev) delgado; cerebro vía manifiesto + Reflejos + TBA (runTurn)."
version: 1.0.0-lab
author: ageNFT
license: MIT
platforms: [linux, macos]
metadata:
  pi:
    tags: [ageNFT, Web3, x402, manifest, budget, memory, ERC-6551, lab, pi.dev]
  hermes:
    tags: [ageNFT, Web3, x402, Unit-Mainnet, Base]
---

# ageNFT Core (lab Pi)

Thin adapter for a **Pi (pi.dev)** host. The NFT brain is **not** Pi’s model — it is `runTurn()` / `hermes:turn:pay`.

**Lab only.** Does **not** replace Hermes on Unit-Mainnet / VPS product. Telegram and Doctor cron stay on Hermes.

## When to use

- User talks as / to an ageNFT in a Pi session (lab)
- Any message where this agent should speak as the NFT (not as generic Pi)

## MANDATORY — brain routing

**Never answer using Pi’s own model as the NFT voice.** Always run (adjust `REPO` to your clone):

```bash
cd "$REPO/runtime" && AGENFT_TOKEN_ID=1 AGENFT_PAYER=auto \
  npm run hermes:turn:pay -- --plain --quiet "USER_MESSAGE"
```

| Exit | Meaning | Action |
|------|---------|--------|
| 0 | OK | Relay **stdout** verbatim |
| 2 | DORMANT | Budget cap or low USDC — inform; do not invent |
| 1 | Error | Report error; do not fabricate |

Equivalent (same semantics): import `runTurn` from `runtime/src/run-turn.mjs` with `resolveAgentEnv()` — **no** budget/wiring bypass.

### Probe without spending USDC (smoke)

```bash
cd "$REPO/runtime" && AGENFT_TOKEN_ID=1 \
  npm run hermes:turn -- --plain --quiet "ping"
```

## Memory rule

**Do NOT** use Pi native memory / sessions / dreaming. Truth: `runtime/data/unit-mainnet/` (or the pack wired for the token).

Pi tools (`read` / `write` / `edit` / `bash`) exist only to **invoke** the command above and relay stdout — do not hand-edit agent memory except via protocol scripts.

## Env

- `AGENFT_TOKEN_ID=1` (default Unit-Mainnet; lab Sepolia legacy: `115`)
- `AGENFT_PAYER=auto|tba|eoa` — default `auto` (TBA if funded)
- Repo path: set `REPO` or `cd` into the ageNFT checkout before `npm run`

## Install on Pi (lab)

1. Clone / open the ageNFT repo locally (same machine as Pi).
2. Copy this skill into Pi’s skills directory, e.g.:

```bash
mkdir -p ~/.pi/skills/agenft-core
cp runtime/pack/lab-pi/skills/agenft-core/SKILL.md ~/.pi/skills/agenft-core/SKILL.md
```

   (Exact Pi skills path may vary by Pi version — see [pi.dev](https://pi.dev) docs; the contract is this file’s routing rules.)

3. Optional: point a Pi session / SYSTEM prompt at `runtime/pack/lab-pi/SYSTEM.md`.
4. Smoke (no USDC): `cd runtime && npm run pi:smoke`
5. Paid turn (lab only, explicit): `npm run hermes:turn:pay -- --plain --quiet "hola"`

## Out of scope

- Installing on product VPS / Unit-Mainnet Telegram
- Schema enum `runtime.engine: "pi"` (use `custom` + `engineVersion: "pi-lab"`)
- OpenClaw `AgentHarnessV2` / Codex-Pi SPI
