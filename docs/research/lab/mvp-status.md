# MVP mainnet — estado (2026-07-15)

> **Agente:** Unit-Mainnet #1 · **Cadena:** Base mainnet · **Checklist:** 8/8

---

## Definición MVP (este release)

Un ageNFT demostrable donde:

1. Existe un NFT + TBA en mainnet
2. La TBA paga el cerebro (x402) sin EOA como pagador permanente
3. Manifiesto + runtime + memoria local funcionan
4. Hay ficha web pública y camino Telegram/Hermes
5. Está documentado qué viaja al transferir

---

## Checklist producto

| # | Criterio | Estado |
|---|----------|--------|
| 1 | NFT minteado AgeNFT registry | ✅ |
| 2 | TBA fondeada (USDC + gas) | ✅ ~0.018 USDC |
| 3 | Pago x402 desde TBA | ✅ |
| 4 | Runtime default Unit-Mainnet | ✅ |
| 5 | dApp mainnet | ✅ |
| 6 | Página transfer | ✅ `dapp/transfer.html` |
| 7 | Hermes skill + scripts | ✅ `npm run hermes:install` |
| 8 | Doctor mira TBA | ✅ |
| 9 | Memoria toju + IPFS (primary) | ⏸ kubo ✅ · toju API pendiente |
| 10 | ≥5 USDC operativo en TBA | ✅ ~5.02 USDC |
| 11 | Vídeo demo 2 min | ⏸ |
| 12 | Avatar Gespenster URUIRU (dApp + manifiesto) | ✅ |
| 13 | Sentidos: STT, OCR, visión, traducción | ⏸ Bloque 5 |
| 14 | Presencia opcional (avatar / movimiento) | ⏸ Bloque 4 |
| 15 | Dashboard owner (⚙️ en todos los hábitats) | ⏸ |
| 16 | Autofinanciación TBA (Bloque 7) | ⏸ |
| 17 | Tiers G/D/E por órgano + gastos Dashboard | ⏸ |
| 18 | Doctor dual (Vitality + Hygiene) | ⏸ |

---

## Siguiente después del MVP

**Orden acordado (Bloque 3):** 1 → 2 → 6 → 3 → 7. **Presencia (Bloque 4):** 4 → 5 → 7. Dashboard transversal desde 1.

- **Bloque 4** Presencia (avatar opcional): [`presence-optional.md`](../presence-optional.md)
- **Bloque 5** Sentidos: [`senses-organ.md`](../senses-organ.md)
- **Dashboard:** [`owner-dashboard.md`](../owner-dashboard.md)
- Detalle: [`next-steps.md`](next-steps.md)

---

## Comandos demo

```bash
node scripts/onchain/mainnet-checklist.mjs 1
cd runtime && npm run once:pay
node scripts/onchain/tba-x402-pay.mjs
cd runtime && npm run dapp:export
```
