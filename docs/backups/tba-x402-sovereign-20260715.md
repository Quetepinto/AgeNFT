# Backup — spike TBA x402 soberano (2026-07-15)

## Veredicto

**PASS** — pagos x402 desde TBA Unit-Mainnet sin EOA como pagador.

## Mecanismo

- Owner NFT (`0xeAf1…C9f`) firma off-chain el hash EIP-712 de `TransferWithAuthorization`
- Pagador on-chain = TBA (`0x9BF1…3CCB`)
- Tokenbound V3 `isValidSignature` → magic `0x1626ba7e`

## Pruebas

| Script | Resultado |
|--------|-----------|
| `tba-sign-probe.mjs` | erc1271Pass + x402VerifyPass |
| `tba-x402-pay.mjs` | USDC TBA −0.000652 |
| `mainnet-checklist.mjs` | **8/8** |
| `runtime npm run once:pay` | payer mode: **tba** |

## Saldos TBA post-spike (aprox.)

- USDC: ~0.018
- ETH: ~0.00015

## Código nuevo

- `runtime/src/tba-payer-signer.mjs`
- `scripts/onchain/tba-sign-probe.mjs`
- `scripts/onchain/tba-x402-pay.mjs`

## Pendiente producto

- Session key para runtime sin owner key (post-transfer)
- dApp / Telegram → Unit-Mainnet
