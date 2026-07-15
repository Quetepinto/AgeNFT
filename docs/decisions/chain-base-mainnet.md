# Decisión — Base mainnet como cadena única

> **Estado:** Aprobado · **Fecha:** 2026-07-15  
> **Reemplaza:** modelo lab “Sepolia identidad + mainnet pagos”

---

## Decisión

**ageNFT vive en Base mainnet (`eip155:8453`).**  
Base Sepolia solo para pruebas puntuales de contratos antes del deploy; **no** es la cadena del producto.

| Capa | Cadena | Notas |
|------|--------|-------|
| NFT, TBA, registro, reputación | **Base mainnet** | Una sola cadena = transferencia coherente |
| Cerebro, memoria, voz (x402) | **Base mainnet** | tx402.ai, toju, etc. ya operan en 8453 |
| USDC del agente | **Base mainnet** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Sepolia | Solo dev efímero | Descartar como hogar del agente publicado |

---

## Por qué no seguir en Sepolia

1. **Los servicios que el agente paga no están en testnet** — tx402 y toju responden en mainnet; Sepolia no sirve para USDC real.
2. **La TBA de Sepolia no existe en mainnet** — misma dirección, distinto chainId → contrato distinto o vacío; el tesoro queda partido.
3. **El comprador espera un activo real** — OpenSea, Zora y recargas USDC son mainnet.
4. **Transferencia 1-TX pierde sentido** si identidad y dinero están en cadenas distintas.

---

## Qué implica para Unit-1 (#115 Sepolia)

Unit-1 **sigue siendo lab histórico** en Sepolia (VIMS). **No migrar** el token #115 a mainnet.

Plan:
- **Unit-2** (o nombre nuevo) = primer ageNFT **nativo mainnet**
- Unit-1 queda como referencia de transfer checklist y experimentos
- Memoria/conversación de Unit-1 puede **exportarse** al manifiesto del nuevo token (opcional)

---

## Referencias

- [`mainnet-migration.md`](../research/mainnet-migration.md) — plan de ejecución
- [`vims-vs-agenft-registry.md`](../research/vims-vs-agenft-registry.md) — por qué dejamos VIMS
- [`tba-x402-pay-report.json`](../research/lab/tba-x402-pay-report.json) — prueba PARTIAL (EOA paga, TBA mainnet no existe)
