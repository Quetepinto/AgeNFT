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
| 9 | Memoria IPFS/toju primary | ⏸ |
| 10 | ≥5 USDC operativo en TBA | ✅ ~5.02 USDC |
| 11 | Vídeo demo 2 min | ⏸ |
| 12 | Avatar Gespenster URUIRU (dApp + manifiesto) | ✅ |

---

## Comandos demo

```bash
node scripts/onchain/mainnet-checklist.mjs 1
cd runtime && npm run once:pay
node scripts/onchain/tba-x402-pay.mjs
cd runtime && npm run dapp:export
```

---

## Siguiente después del MVP

- Fondear TBA a ≥5 USDC
- Publicar dApp (GitHub Pages push)
- Activar gateway Telegram en Hermes (si no está corriendo)
- Session key post-transfer (runtime sin clave owner)
