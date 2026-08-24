# Backup pre-memoria-viaja 2026-08-24

Antes de hidratar memoria al arranque y de apuntar CLI a Unit-Mainnet:

- `runtime/src/run-turn.mjs` — preload local sin restore de pointer
- `runtime/src/memory-toju.mjs` — cápsula sin capas V0; hydrate solo latest.json
- `runtime/src/memory-sync.mjs` y `memory-restart-test.mjs` — default `unit-1-lab.json`
- `runtime/src/budget-status.mjs` — default lab Sepolia + EOA credentials
- `runtime/src/doctor-probe.mjs` — sin estado de memoria
