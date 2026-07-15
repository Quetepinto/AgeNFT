# TBA x402 soberano — spike completado ✅

> **Estado:** **RESUELTO** (Jul-15 noche) · Checklist **8/8**  
> **TBA:** `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB`

---

## Resultado

**No hace falta session key** para el MVP. Tokenbound V3 (Solady ERC-1271) acepta:

1. Owner del NFT firma el **digest EIP-712** off-chain (`owner.sign({ hash: digest })`)
2. Pagador x402 = **dirección TBA** (`from` en TransferWithAuthorization)
3. Facilitador x402 verifica vía `TBA.isValidSignature(digest, signature)` → `0x1626ba7e`

Pagos reales confirmados: TBA USDC bajó en cada `--pay` (~$0.00065/req).

---

## Implementación

| Pieza | Ruta |
|-------|------|
| Signer TBA | `runtime/src/tba-payer-signer.mjs` |
| Cerebro x402 | `runtime/src/brain-tx402.mjs` (acepta `signer`) |
| Resolver auto TBA/EOA | `resolvePayerSigner()` — default `AGENFT_PAYER=auto` |
| Probe firma | `scripts/onchain/tba-sign-probe.mjs` |
| Pago E2E | `scripts/onchain/tba-x402-pay.mjs` |
| Reporte | `docs/research/lab/tba-x402-pay-report.json` |

### Env

| Variable | Valores | Default |
|----------|---------|---------|
| `AGENFT_PAYER` | `auto` \| `tba` \| `eoa` | `auto` (TBA si ≥0.005 USDC) |

---

## Session keys (futuro)

Session key sigue siendo útil para **delegar gasto sin clave del owner** (runtime en VPS, transfer post-venta). No bloquea el producto MVP.

Opciones futuras:
- Tokenbound `execute` con EOA delegada + policy Reflejos
- Clave de sesión acotada en manifiesto

---

## Comandos

```bash
node scripts/onchain/tba-sign-probe.mjs      # firma ERC-1271 local
node scripts/onchain/tba-x402-pay.mjs        # pago real tx402.ai
node scripts/onchain/mainnet-checklist.mjs 1 # 8/8
cd runtime && npm run once:pay               # payer auto → TBA
```

---

## Referencias

- x402 verify ERC-1271: `@x402/evm` → `verifyTypedDataSignature`
- TBA impl: `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` (Tokenbound V3)
