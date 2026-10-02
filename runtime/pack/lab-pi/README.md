# Lab Pi — spike ageNFT (`runTurn`)

Host **Pi (pi.dev)** as a thin adapter. Brain = same protocol as Hermes (`hermes:turn:pay` / `runTurn()`).  
**Does not** replace Hermes on Unit-Mainnet / VPS. Telegram disabled in the lab preset.

## Prerequisites

- Node.js + deps in `runtime/` (`npm install` there)
- ageNFT repo checkout
- Optional: Pi CLI / app installed ([pi.dev](https://pi.dev)) to exercise the skill interactively
- Paid turns need USDC + payer keys — **not** required for smoke

## How to test the spike (3 steps)

1. **Smoke (no USDC):** from `runtime/`:

```bash
npm run pi:smoke
```

2. **Probe turn (no `--pay`):**

```bash
AGENFT_TOKEN_ID=1 npm run hermes:turn -- --plain --quiet "ping"
```

Expect exit `0` and probe-style stdout (or dormant/error per protocol — do not invent).

3. **Install skill on Pi (when you have Pi)** — copy `skills/agenft-core/SKILL.md` into Pi’s skills dir (see skill file). Optional SYSTEM: this pack’s `SYSTEM.md`. Then send one lab message and confirm Pi shells `hermes:turn:pay` and relays stdout.

Paid lab turn (optional, spends USDC):

```bash
AGENFT_TOKEN_ID=1 AGENFT_PAYER=auto npm run hermes:turn:pay -- --plain --quiet "hola"
```

## Files

| Path | Role |
|------|------|
| `skills/agenft-core/SKILL.md` | Mandatory routing → `hermes:turn:pay` |
| `SYSTEM.md` | Minimal host rules for a Pi session |
| `docs/backups/pi-custom.json` | Manifest preset (`engine: "custom"`, `engineVersion: "pi-lab"`) |
| `scripts/pi/smoke-lab.mjs` | Dry-run checks + optional probe |

## Out of scope

- Product VPS / Unit-Mainnet Telegram / Doctor cron
- Expanding schema enum with `"pi"`
- Promoting Pi to default or second product host (OpenClaw stays “próximo”)
