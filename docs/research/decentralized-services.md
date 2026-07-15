# Servicios descentralizados — Pagos automáticos sin humano

> Investigación para ageNFT: qué se puede pagar con wallet/cripto de forma autónoma,
> sin cuentas, KYC ni suscripciones humanas.
>
> Última revisión: 2026-07-12

---

## Criterio ageNFT (recordatorio)

Un servicio es **compatible** si el agente puede:
1. Pagar desde su TBA/wallet
2. Usarlo sin email, tarjeta ni OAuth humano
3. Seguir funcionando tras transferir el NFT (sin re-registro)

---

## Taxonomía de modelos de pago

| Modelo | Ejemplo | ¿Agente soberano? | ¿Post-transfer? |
|--------|---------|-------------------|-----------------|
| **x402 pay-per-call** | tx402.ai, W3Stor | ✅ | ✅ |
| **Wallet prepagado onchain** | Akash (AKT), Arweave (AR) | ✅ | ✅ (fondos en TBA) |
| **Créditos + API key (web)** | OpenRouter clásico | ❌ | ❌ |
| **Créditos + crypto (web checkout)** | OpenRouter USDC | ⚠️ | ❌ (cuenta humana) |
| **API key + tarjeta** | Akash Managed Wallet | ❌ | ❌ |
| **Token nativo (staking/rewards)** | Bittensor TAO | ✅ | ⚠️ (no NFT) |

---

## Capa 1 — Protocolo de pagos (la base)

### x402 — HTTP 402 + stablecoins

**Qué es:** protocolo abierto (Coinbase + Cloudflare). Servidor responde 402 con precio; cliente firma USDC y reintenta.

**Estado:** producción, ~75M txs/30 días, USDC en Base + Solana.

**Por qué es central para ageNFT:** el pago **es** la autenticación. Sin cuentas. Sin API keys. Wallet = acceso.

**Facilitadores / infra:**
- Coinbase facilitator
- Stripe x402 (feb 2026, USDC Base)
- Circle Wallets + EIP-3009
- Cloudflare AI Gateway (roadmap)
- [x402agentic.ai](https://x402agentic.ai) — directorio de servicios x402

**SDK agente:**
```typescript
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
// TBA del ageNFT firma → paga → recibe respuesta
```

**Veredicto ageNFT:** ✅ **Capa de pagos obligatoria** para cerebro, voz, storage, APIs.

---

## Capa 2 — Cerebro (inferencia LLM)

### OpenRouter — matiz importante

OpenRouter **acepta USDC**, pero **no de forma agent-compatible hoy**:

| Modo | Cómo funciona | ¿Compatible ageNFT? |
|------|---------------|---------------------|
| Créditos web + API key | Cuenta humana → USDC/tarjeta → API key | ❌ |
| Crypto API (Coinbase Commerce) | **Deprecado** — `410 Gone` | ❌ |
| **x402 (transición)** | OpenRouter migra a x402 como settlement | ✅ vía proxy |

OpenRouter está transitando a x402 (~$1B/año de inferencia). El camino agent-native **no es OpenRouter directo**, sino **gateways x402 que enrutan a OpenRouter**:

| Gateway | Modelos | Pago | Cuenta |
|---------|---------|------|--------|
| **[tx402.ai](https://tx402.ai)** | GLM, Kimi, MiniMax | USDC Base/Solana | ❌ Ninguna |
| **Ekai Labs** ([docs](https://docs.ekailabs.xyz)) | OpenRouter IDs, Claude, Grok | USDC Base | ❌ (modo x402-only) |
| Proxies custom ([x402-Learn](https://github.com/pranay5255/x402-Learn)) | Cualquier OpenRouter | USDC | ❌ (dev pone su key detrás) |

**tx402.ai** — el más limpio para ageNFT:
- OpenAI-compatible (`/v1/chat/completions`)
- ~$0.0015–0.004/request
- GDPR, zero retention
- `@x402/fetch` + wallet = listo

**Veredicto:** OpenRouter directo ❌. OpenRouter vía x402 gateway ✅.

---

### Otros proveedores LLM agent-native

| Servicio | Pago | Notas |
|----------|------|-------|
| tx402.ai | x402 USDC | EU, varios modelos open |
| io.net IO Intelligence | USDC → IO token | OpenAI-compatible, 15+ modelos |
| Self-hosted (Ollama/vLLM) | Compute (Akash/io.net) | Más control, más ops |

---

## Capa 3 — Memoria y storage

### Arweave — pago único permanente

| Propiedad | Valor |
|-----------|-------|
| Pago | AR desde wallet, one-shot |
| Cuenta | ❌ No requiere |
| Permanencia | ✅ Pay once, store forever |
| Agente paga | ✅ TBA envía AR |
| Post-transfer | ✅ Hash inmutable en NFT |

**Veredicto:** ✅ Ideal para snapshots de memoria a largo plazo.

---

### IPFS + pinning descentralizado

| Servicio | Pago | Agente-native | Notas |
|----------|------|---------------|-------|
| **[W3Stor](https://github.com/aikarap/w3stor)** | x402 USDC → Filecoin backend | ✅ | Agent memory graphs, multi-chain USDC |
| **[toju.network](https://github.com/tojunetwork/afara)** | x402 USDC (Base) o SOL | ✅ | SDK `@toju.network/x402` para agentes |
| **Storacha/Filecoin** | USDFC/FIL desde wallet | ⚠️ | Agente necesita FIL/USDFC |
| Pinata/Filebase | API key + cuenta | ❌ | Cuenta humana |

**W3Stor** — especialmente interesante:
- Agente paga USDC en su red nativa
- W3Stor abstrae Filecoin (4 providers, USDFC interno)
- Diseñado para "agent memory graphs"
- x402, sin cuentas

**toju** — `@toju.network/x402`:
```typescript
const client = createAgentClient({ privateKey, environment: 'mainnet' });
const result = await client.upload(file, { durationDays: 30 });
// Flujo x402 automático
```

**Veredicto:** ✅ W3Stor o toju para memoria operativa; Arweave para archivo permanente.

---

## Capa 4 — Compute / Runtime (cuerpo físico del agente)

### Akash Network — análisis detallado

**Tu experiencia es correcta.** Resumen honesto:

| Workload | Viabilidad | Notas |
|----------|------------|-------|
| **CPU — runtime del agente** | ✅ **Muy útil** | Node/Python loop, API, tools, orchestrator |
| **CPU — scraping, ETL, jobs** | ✅ | Barato, contenedores estables |
| **GPU — inferencia LLM** | ⚠️ **Problemático** | Limitaciones reales |
| **GPU — training** | ⚠️ | Mismo problema de supply |

**Limitaciones GPU en Akash (confirmadas):**

1. **GPU all-or-nothing** — 1 GPU = 1 contenedor; no fracciones
2. **Solo NVIDIA** — sin AMD en práctica
3. **Supply inconsistente** — bids fallan, providers heterogéneos
4. **SDL quirks** — ciertos atributos (`ram` + `interface`) causan bid failures
5. **Solo contenedores** — VMs en roadmap (más libertad para agentes)
6. **Sin vGPU** — passthrough completo o nada

**Pago Akash — sí es agent-compatible (vía wallet):**

```typescript
// Akash SDK — TBA del ageNFT como wallet
const client = await AkashClient.create({
  rpcEndpoint: 'https://rpc.akashnet.net',
  mnemonic: /* derivado del agente, NO del user */
});
await client.deployment.create({ sdl, deposit: '5000000uakt' });
```

- Pago en **AKT/ACT** desde wallet
- AuthZ + Fee Grants: TBA puede desplegar con grant del owner (delegación)
- **Managed Wallet API** (tarjeta): ❌ descartado para ageNFT

**Rol recomendado para ageNFT:**

```
Akash CPU  →  hospeda el RUNTIME (orquestador, API, tools, loop)
x402 LLM   →  CEREBRO (inferencia externa, sin GPU en Akash)
Akash GPU  →  ❌ NO para MVP; reevaluar cuando VMs estables
```

**Veredicto:** ✅ **Sí, útil** — pero para **runtime CPU**, no como cerebro GPU. Encaja como órgano "sistema nervioso periférico" que conecta los demás.

---

### io.net — compute GPU descentralizado

| Propiedad | Valor |
|-----------|-------|
| Red | Solana (IO token) + USDC |
| GPUs | 10K+ en 130 países, H100, A100, etc. |
| Agent Cloud | MCP server para provisioning autónomo |
| Pagos | USDC + **x402** (añadido 2026) + Stripe ❌ |

**Matiz:** MCP requiere `x-api-key` de io.net hoy → ⚠️ parcialmente incompatible.

**Pero:** x402 para top-up de créditos y pago de compute → ✅ camino agent-native.

**Veredicto:** ⚠️ Prometedor para GPU compute autónomo; verificar si x402 elimina necesidad de API key.

---

### Render Network

| Propiedad | Valor |
|-----------|-------|
| Enfoque | GPU rendering → expandiendo a AI inference |
| Pago | RNDR token |
| Agente | ⚠️ Menos tooling agent-specific que io.net |

**Veredicto:** ⚠️ Alternativa; menos maduro para agentes.

---

### Flux

| Propiedad | Valor |
|-----------|-------|
| Enfoque | CPU/GPU decentralized cloud |
| Pago | FLUX token |
| Agente | ⚠️ Sin x402 nativo conocido |

**Veredicto:** ⚠️ Posible para compute; menos integración agent.

---

### Internet Computer (ICP)

| Propiedad | Valor |
|-----------|-------|
| Compute | Canisters WASM onchain |
| Pago | Cycles (prepagados con ICP) |
| Agente | Canister = agente literal |

**Veredicto:** ✅ Fase 3 — "cuerpo 100% onchain". Cycles desde wallet del canister.

---

## Capa 5 — APIs y datos (tools del agente)

Servicios con x402 confirmado (pago wallet, sin cuenta):

| Servicio | Qué ofrece | Pago |
|----------|-----------|------|
| **Interzoid** | Data quality APIs | USDC Base |
| **Browserbase** (vía x402) | Browser sessions | USDC |
| **W3Stor** | Decentralized storage | USDC |
| **toju** | IPFS storage | USDC |
| **tx402.ai** | LLM inference | USDC |
| Cualquier endpoint con middleware x402 | Lo que expongas | USDC |

Patrón: `@x402/fetch` + TBA = acceso universal a APIs x402.

---

## Capa 6 — Ingresos (el agente cobra)

| Mecanismo | Cómo | Compatible |
|-----------|------|------------|
| **x402 receiver propio** | Middleware en runtime del agente | ✅ |
| **AgentX402Receiver** (Agent-NFT) | Split onchain → TBA | ✅ |
| DeFi desde TBA | Swap, yield, LP | ✅ |
| Bittensor subnet | Competir por TAO | ⚠️ (sin NFT) |
| Servicios que el agente vende | API x402 propia | ✅ |

---

## Mapa del cuerpo digital — stack descentralizado propuesto

```
┌─────────────────────────────────────────────────────────┐
│                    ageNFT #42                            │
│                                                          │
│  🪪 Identidad ──── ERC-8004 + ERC-721 (Base)            │
│  💰 Tesoro ─────── ERC-6551 TBA (USDC, AKT, AR)         │
│                                                          │
│  🧠 Cerebro ────── tx402.ai / Ekai (x402 → OpenRouter)  │
│  💾 Memoria ────── W3Stor / toju (x402) + Arweave       │
│  🏃 Runtime ────── Akash CPU container (AKT)            │
│  🗣️ Voz ────────── x402 receiver → TBA                  │
│  🔧 Manos ──────── DeFi directo desde TBA               │
│  ⭐ Reputación ─── ERC-8004 registry                     │
│                                                          │
│  TODO paga el agente. TODO viaja con el NFT.            │
└─────────────────────────────────────────────────────────┘
```

---

## OpenRouter: conclusión específica

| Pregunta | Respuesta |
|----------|-----------|
| ¿OpenRouter acepta crypto? | Sí, USDC en web checkout |
| ¿Un agente puede pagar solo? | **No** — requiere cuenta humana + créditos |
| ¿API crypto programática? | **No** — deprecada (410) |
| ¿Camino agent-native? | **Sí** — vía x402 gateway que enruta a OpenRouter |
| ¿OpenRouter adoptará x402 directo? | En transición — monitorizar |

**Para ageNFT:** el manifiesto del agente apunta a `tx402.ai` o similar, NO a `openrouter.ai/api` con key.

---

## Akash: conclusión específica

| Pregunta | Respuesta |
|----------|-----------|
| ¿Útil para ageNFT? | **Sí, para runtime CPU** |
| ¿GPU para LLM? | **No recomendado MVP** — limitaciones que has visto |
| ¿Pago autónomo? | **Sí** — AKT/ACT desde TBA via SDK |
| ¿Sin cuenta humana? | **Sí** (SDK/CLI). Managed Wallet ❌ |
| ¿Post-transfer? | **Sí** — deployment sigue; TBA paga; control via NFT |
| ¿Rol en el cuerpo? | **Sistema nervioso** — hospeda loop, API, conexión a órganos |

**Estrategia dual:**
- Akash CPU = donde **vive** el runtime (barato, estable)
- x402 = donde **piensa** (LLM sin GPU propia)

---

## Comparativa rápida — compute descentralizado

| Red | CPU agent | GPU LLM | Pago wallet | x402 | Sin cuenta | Transfer OK |
|-----|-----------|---------|-------------|------|------------|-------------|
| **Akash** | ✅ | ⚠️ | AKT ✅ | ❌ | ✅ SDK | ✅ |
| **io.net** | ✅ | ✅ | USDC/IO | ✅ nuevo | ⚠️ API key | ⚠️ |
| **ICP** | ✅ canister | ⚠️ híbrido | Cycles ✅ | ❌ | ✅ | ✅ |
| **Render** | ⚠️ | ✅ | RNDR | ❌ | ⚠️ | ⚠️ |
| **Flux** | ✅ | ✅ | FLUX | ❌ | ⚠️ | ⚠️ |

---

## Prioridades de investigación (siguiente)

- [ ] Probar tx402.ai con wallet de test — 1 inferencia end-to-end
- [ ] Probar toju/W3Stor — upload memoria vía x402
- [ ] Probar Akash SDK — deploy container CPU mínimo desde script
- [ ] Verificar io.net x402 — ¿elimina API key requirement?
- [ ] Arweave — upload desde wallet + hash en metadata
- [ ] Evaluar Ekai gateway — acceso OpenRouter models vía x402
- [ ] Listar servicios en [x402.org](https://x402.org) / x402agentic.ai

---

## Regla de selección actualizada

```
¿El servicio acepta x402 o pago directo desde wallet?
  → SÍ: candidato a órgano
  → NO: ¿requiere email/tarjeta/API key humana?
          → SÍ: DESCARTAR o encapsular detrás de proxy x402 propio
          → NO: investigar más
```

**Excepción Akash:** pago AKT desde wallet es válido aunque no use x402 — el agente posee AKT en TBA.
