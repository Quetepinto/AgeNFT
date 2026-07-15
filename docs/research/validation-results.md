# Resultados de validación práctica — Fase 0

> Probes ejecutados **antes** de implementar MVP. Actualizar al re-ejecutar
> `scripts/validation/probe-services.mjs`.
>
> Última ejecución: **2026-07-12** (entorno Cursor/servidor)

---

## Resumen ejecutivo

| Servicio | Estado | Implicación para ageNFT |
|----------|--------|-------------------------|
| **Base Sepolia RPC** | ✅ | Chain test accesible |
| **tx402.ai** | ✅ HTTP 402 + x402 v2 | Cerebro agent-native **confirmado** |
| **toju (mainnet)** | ✅ 402 + pricing | Storage agent-native **confirmado** |
| **toju staging (Sepolia)** | ❌ Timeout | Path testnet roto desde aquí |
| **agent.vims.com** | ✅ Live | Mint Agent-NFT disponible |
| **W3Stor API** | ⚠️ Problemas infra | Ver sección W3Stor |
| **Pago E2E** | ⏸️ Pendiente | Requiere wallet con USDC mainnet |

### Hallazgo crítico: mainnet vs Sepolia

**tx402.ai** y **toju mainnet** devuelven x402 en **`eip155:8453` (Base mainnet)**, no Sepolia.

Implicaciones:

1. Validación E2E con pago real = **micro-USDC en Base mainnet** (~$0.002/inferencia, ~$0.000001 storage mínimo según quote)
2. Base Sepolia sigue útil para **contratos** (Agent-NFT mint en agent.vims.com)
3. **Desacople:** identidad onchain testnet + servicios x402 mainnet es viable en Fase 0 (wallet TBA con USDC mainnet para órganos)

---

## Detalle por servicio

### tx402.ai (cerebro)

```
POST /v1/chat/completions → 402 Payment Required
payment-required: x402Version 2
networks: eip155:8453 (USDC), solana (USDC, USX)
coste ejemplo minimax-m3: ~$0.002565 / request
modelos listados: 5 (GLM, Kimi, MiniMax…)
health: ok, protocol x402
```

**Conclusión:** ✅ Candidato #1 cerebro. EU sovereign / zero data retention en descripción del recurso (verificar SLA).

---

### toju (memoria operativa)

```
GET /health → 200
GET /pricing/quote?size=1000&duration=7 → totalCost=1 (unidad mínima API)
POST /upload/agent → 402, network eip155:8453
SDK: @toju.network/x402 v0.1.0
  mainnet → api.toju.network
  sepolia → staging-api.toju.network (NO RESPONDE — timeout 8–15s)
```

**W3Stor vs email:** no aplicable aquí; toju x402 **no pide registro**.

**Conclusión:** ✅ Primary storage operativo. ⚠️ Staging/Sepolia no usable hoy — usar mainnet micro-pagos o esperar fix toju.

---

### W3Stor (memoria alternativa)

Probes manuales:

| Host | Resultado |
|------|-----------|
| `api.w3stor.xyz` | Cert SSL **hostname mismatch**; `/upload` → 405 (nginx, app distinta) |
| `api.w3s.storage` | **DNS no resuelve** |
| Docs GitHub | Indican x402 + Base Sepolia, Agent #3635 ERC-8004 |

**Conclusión:** ⚠️ **No validado E2E**. Documentación prometedora; infra API inconsistente. Mantener como fallback #2; reintentar cuando corrijan DNS/SSL o probar SDK `@w3stor/sdk` desde entorno local.

**Email/registro:** repo oficial confirma **solo wallet + x402** (sin email).

---

### agent.vims.com (identidad Agent-NFT)

- HTTP 200
- Meta: ERC-721 + ERC-6551 TBA + memoria onchain + royalty vault
- Base (testnet mint según docs previas)

**Conclusión:** ✅ Siguiente paso manual: mint humano en UI + inspeccionar TBA en Sepolia.

---

## Prueba con pago (--pay)

No ejecutada (sin `VALIDATION_PRIVATE_KEY` con USDC).

Pasos para completar:

```bash
# 1. Wallet de prueba con ~$1 USDC en Base mainnet (+ un poco ETH gas)
export VALIDATION_PRIVATE_KEY=0x...

# 2. Instalar deps (ajustar versiones @x402/* si npm falla)
cd scripts/validation && npm install

# 3. Ejecutar
node probe-services.mjs --pay
```

Validará: 1 inferencia tx402.ai + 1 upload toju con CID.

---

## Decisiones sugeridas post-validación

1. **MVP servicios:** tx402.ai + toju mainnet (x402 USDC Base)
2. **MVP contratos:** Base Sepolia + Agent-NFT canonical
3. **W3Stor:** fallback documentado; validar en sprint aparte
4. **toju staging:** abrir issue o usar mainnet micro-budget
5. **Doctor:** incluir failover tx402 ↔ GPU-Bridge; toju ↔ W3Stor ↔ Arweave

---

## Comandos

```bash
cd ageNFT/scripts/validation
node probe-services.mjs --quick    # sin npm si solo probes HTTP
```

JSON machine-readable: `validation-results.latest.json`

---

## Pendiente validar

- [ ] Pago E2E tx402 + toju (wallet mainnet)
- [ ] W3Stor upload vía SDK
- [ ] Mint en agent.vims.com + lectura TBA
- [ ] Akash deploy CPU mínimo desde SDK
- [ ] Nym pay-as-you-go desde script
- [ ] Filecoin Pin CLI + USDFC testnet
