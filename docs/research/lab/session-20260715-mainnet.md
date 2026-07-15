# Sesión 2026-07-15 — Mainnet + fin de dependencia VIMS

> Resumen de lo acordado y documentado en la sesión.

---

## Decisiones

1. **Cadena única = Base mainnet (`8453`)** — Sepolia solo dev efímero.
2. **VIMS no sirve para mainnet** — Unit-1 Sepolia queda como lab legacy.
3. **Construir ageNFT Registry propio** — sustituto de agent.vims.com.
4. **Unit-mainnet** — nuevo mint mainnet; no migrar token #115.

---

## Trabajo documentado hoy

| Entregable | Ruta |
|------------|------|
| Decisión cadena | [`decisions/chain-base-mainnet.md`](../decisions/chain-base-mainnet.md) |
| Plan migración | [`mainnet-migration.md`](../research/mainnet-migration.md) |
| VIMS vs propio | [`vims-vs-agenft-registry.md`](../research/vims-vs-agenft-registry.md) |
| Catálogo órganos (restaurado) | [`organ-assembly-catalog.md`](../research/organ-assembly-catalog.md) |
| Prueba TBA/x402 | [`lab/tba-x402-pay-report.json`](tba-x402-pay-report.json) |
| Próximos pasos | [`next-steps.md`](next-steps.md) |
| Bitácora | [`NOTES.md`](../NOTES.md) |

---

## Hallazgos técnicos (TBA + x402)

- EOA lab: **~0.045 USDC** mainnet — pago cerebro OK (~$0.00065/req).
- TBA Sepolia: contrato existe; **TBA mainnet: no desplegada** en esa dirección.
- **No enviar USDC** a TBA en mainnet sin contrato (fondos bloqueados).
- Pago x402 requiere **firma EIP-3009** desde dirección con USDC → TBA necesita session key / smart wallet (Fase 2.5).

Veredicto prueba: **PARTIAL** — circuito x402 OK; tesoro soberano pendiente.

---

## Respuestas a preguntas del usuario

| Pregunta | Respuesta |
|----------|-----------|
| ¿Pagamos USDC en Sepolia? | **No** — servicios x402 = mainnet. |
| ¿Cadena final? | **Base mainnet.** |
| ¿VIMS en mainnet? | **No** para nuestro producto hoy. |
| ¿Hora de nuestro VIMS? | **Sí** — ageNFT Registry en mainnet. |

---

## Siguiente acción recomendada

**Bloque B (en curso):** session key TBA para x402 soberano. Deploy + mint ✅ — ver [`mainnet-deploy-mint-20260715.md`](../../backups/mainnet-deploy-mint-20260715.md).

---

## Update noche — deploy + mint ✅

| Paso | Resultado |
|------|-----------|
| Deploy AgeNFT | `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839` |
| Mint Unit-Mainnet #1 | TBA `0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB` |
| Fondeo TBA | 0.02 USDC + 0.00015 ETH |
| Runtime turn `--pay` | OK desde EOA (~$0.000679) |
| Checklist mainnet | **7/8** (item 8 x402-TBA defer) |

Hallazgo actualizado: **TBA mainnet SÍ existe** en la dirección derivada del token #1 (no confundir con la TBA Sepolia lab en `0x2FF43…`).
