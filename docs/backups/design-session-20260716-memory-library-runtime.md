# Backup diseño memoria + biblioteca + runtime — 2026-07-16

Snapshot de decisiones de la sesión (tarde).

## Memoria (V0–M3)

- V0 vault: nunca terceros
- M1 canon: soul, URUIRU — siempre
- M2 personal/PII: oculto en alquiler; opcional en venta
- M3 capability: viaja en capability-only; **curación** — excluir skills (ej. pentesting)
- Clasificar al aprender (`layers`, `risk`, `capabilityId`)
- Trial/venta: `saleConfigHash` — lo probado = lo comprado

## Biblioteca (B)

- Archivos consulta (PDF, corpus RAG) — capa aparte de M2/M3
- B-pack (IPFS) · B-local · B-cloud — opcional por archivo
- Trial: solo `libraryInclude`; `libraryHash` en oferta
- **No estructura Karpathy** — índice JSON + blobs; runtime indexa; RAG bajo demanda
- M1 = soul/skills Karpathy lite solo

## Runtime (E1)

- **Un NFT, varios motores posibles** — no NFT distinto por motor
- MVP: Hermes + `run-turn.mjs`
- Próximo: OpenClaw adapter (Cursor/workspace)
- Fase 5: ElizaOS opcional (swap/8004, no x402 core)
- `runtime.engine` en manifiesto; transfer puede cambiar motor

## Companion BYOA (visión)

- Humano + agente en cualquier app, misma UI
- Piezas: browser MCP, WebMCP, MCP, A2A — falta slot unificado
- ageNFT = pasaporte portable
- Doc: `companion-agent-byoa.md`

## Organ Studio + cross-chain

- Organ Studio: grafo visual órganos (medio-largo plazo)
- Cross-chain: lock + mirror, chainOverlays
- Docs: `organ-studio-visual.md`, `cross-chain-agent-migration.md`

## Taxonomía

- `pieces-taxonomy.md` — mapa maestro clasificación
- Estados ✅ 📐 💡 ⏸ 🔗

## Docs creados/actualizados

- `memory-layers-access.md`
- `library-storage-policy.md`
- `memory-transfer-policy.md`
- `runtime-adapters.md` (nuevo)
- `companion-agent-byoa.md` (nuevo)
- `pieces-taxonomy.md` (nuevo)
- `design-index-20260716.md`
- `transfer.html`
- `NOTES.md`
