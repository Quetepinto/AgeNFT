# Backup — MVP mainnet producto (2026-07-15)

Snapshot tras cerrar capa producto MVP (dApp + Hermes + transfer).

## Entregables

- dApp default → Unit-Mainnet #1 (Base mainnet RPC + USDC)
- `dapp/transfer.html` — qué viaja al transferir
- `scripts/dapp/export-public-data.mjs` — export mainnet
- `runtime/pack/unit-mainnet/` — skill Hermes
- `scripts/hermes/install-unit-mainnet.mjs`
- `AGENTS.md` — contexto Hermes Unit-Mainnet
- Doctor probe — saldo TBA (no solo EOA)

## Comandos

```bash
cd runtime && npm run dapp:export
cd runtime && npm run hermes:install
cd runtime && npm run hermes:verify
```

## Pendiente operador

- Push dApp a GitHub Pages
- `hermes gateway` con bot Telegram activo
- Más USDC en TBA
