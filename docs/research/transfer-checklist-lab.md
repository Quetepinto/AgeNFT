# Transfer checklist lab — Unit-1 (#115)

> Ejecutado: **2026-07-13** · Script: `scripts/onchain/transfer-checklist.mjs`

## Resultado

| Fase | Score | Notas |
|------|-------|-------|
| post-transfer-out (temp owner) | 7/7* | *Tras fix poll RPC |
| post-transfer-back (canonical) | **7/7 ✅** | Round-trip OK |

**Veredicto:** ✅ **TRANSFER CHECKLIST PASSED**

Report JSON: [`transfer-checklist-115.json`](lab/transfer-checklist-115.json)

## Checklist digital-body

| # | Check | Resultado |
|---|-------|-----------|
| 1 | `ownerOf` = expected owner | ✅ pre y post |
| 2 | TBA sin cambiar | ✅ `0x2FF43…e969` estable |
| 2b | TBA funded | ⚠️ 0 ETH (warning, no blocker) |
| 3 | Manifiesto validado | ✅ `unit-1-lab.json` |
| 4 | Memoria offchain + preload | ✅ `lab-remote://memory-remote/capsule.json` |
| 5 | Context onchain | ✅ `skills.md` fileCount=1 |
| 6 | Memory onchain VIMS | ✅ versionCount=1 |
| 7 | x402 service activo | ✅ `agenft-lab-chat` |
| 8 | Pago x402 desde TBA | ⏸ DEFER Fase 2+ |

## Lecciones

1. **RPC lag Base Sepolia:** tras `safeTransferFrom`, hay que **poll `ownerOf`** antes del checklist (1–12 s).
2. **Gas explícito:** `200000n` más fiable que estimador default en return transfer.
3. **Clave temp:** guardada en `lab/transfer-temp-115.json` hasta éxito; script `recover-agent.mjs` por si acaso.
4. **Memoria offchain independiente del owner NFT:** puntero + cápsula resuelven igual con temp owner y canonical.

## Comandos

```bash
cd scripts/onchain
node transfer-checklist.mjs 115           # round-trip E2E
node transfer-checklist.mjs 115 --dry-run # sin transfer
node recover-agent.mjs 115                # recuperación manual
```

Pre-sync memoria:

```bash
cd runtime && npm run memory:sync -- --provider=lab-remote
```
