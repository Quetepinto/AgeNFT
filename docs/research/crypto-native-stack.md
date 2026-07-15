# Stack cripto / descentralizado — prioridad ageNFT

> Tormenta de ideas consolidada: múltiples opciones intercambiables por órgano,
> preferencia por infra **cripto-native** (Akash, x402, Arweave…), capa de privacidad
> opcional, y criterios para failover / geo / preferencia del usuario.
>
> Última revisión: 2026-07-12

---

## Decisión de dirección

**Prioridad explícita:** opciones **descentralizadas o cripto-native** para todos los órganos.

- Pagos: wallet del agente (TBA), no tarjeta ni email del humano
- Failover: **2–3 alternativas** por órgano en manifiesto (Doctor + router eligen)
- Preferencia: el owner puede fijar `preferredProvider` por órgano o región
- VPS tradicional: **fallback**, no default

Términos equivalentes en docs: **cripto**, **descentralizado**, **agent-native**.

---

## Principio: redundancia por órgano

Cada órgano declara en manifiesto:

```json
{
  "organs": {
    "brain": {
      "primary": "x402://tx402.ai",
      "fallbacks": ["x402://gpu-bridge", "x402://ekai"],
      "preferences": { "geo": "eu", "privacy": "standard" }
    },
    "memory": {
      "operational": { "primary": "x402://toju", "fallbacks": ["x402://w3stor"] },
      "archive": { "primary": "arweave", "fallbacks": ["filecoin-pin"] }
    },
    "runtime": {
      "primary": "akash",
      "fallbacks": ["flux", "io.net"]
    }
  }
}
```

El **Doctor** (órgano de salud) rota entre primary/fallbacks; el **Olfato** descubre candidatos nuevos para añadir a fallbacks tras validación.

---

## 🧠 Cerebro (LLM / inferencia)

| Opción | Pago | Agent-native | Privacidad | Notas |
|--------|------|--------------|------------|-------|
| **tx402.ai** | USDC x402 Base/Solana | ✅ | ⚠️ Metadata HTTP | MVP default |
| **GPU-Bridge** | USDC x402 Base | ✅ | ⚠️ | 26 servicios GPU vía x402 |
| **Ekai / gateways x402** | USDC x402 | ✅ | ⚠️ | Enruta a modelos OpenRouter-like |
| **io.net IO Intelligence** | USDC / x402 | ⚠️ API key en algunos flujos | ⚠️ | Verificar eliminación de key |
| **Self-hosted Ollama** | Compute (Akash/io.net) | ✅ | ✅✅ Datos no salen | Más ops; Doctor redeploy |
| **xmr402** (futuro) | XMR | ✅ | ✅✅ | Ecosistema incipiente |

**Recomendación MVP:** tx402.ai + GPU-Bridge como fallback #2.

**Privacidad LLM:** minimizar lo enviado al modelo (ver sección Privacidad).

---

## 🏃 Runtime (donde vive Hermes / ElizaOS)

| Opción | Pago | Escala autónoma | Agent-native | Notas |
|--------|------|-----------------|--------------|-------|
| **Akash** | AKT/ACT desde wallet | ✅ Redeploy SDL + depósito | ✅ SDK | CPU ideal; GPU problemático |
| **io.net** | USDC, x402 | ✅ Agent Cloud MCP | ⚠️ | GPU; verificar x402 puro |
| **Flux** | FLUX token | ⚠️ | ⚠️ Sin x402 nativo | Alternativa compute |
| **Render** | RNDR | ⚠️ | ⚠️ | Más rendering/GPU |
| **ICP canister** | Cycles (ICP) | ✅ | ✅ | Lógica onchain; LLM offchain |
| **VPS cripto** | BTC/XMR/USDC según host | ⚠️ Cuenta a menudo humana | ⚠️ | Fallback geo-specific |

**Recomendación:** Akash CPU primary → io.net (GPU puntual) → VPS cripto-host como último recurso.

---

## 💾 Memoria / storage

### W3Stor — ¿pide email o registro humano?

**Verificado (repo oficial, 2026-07):** W3Stor **no exige email ni cuenta humana** para el flujo agente.

- Pago: **USDC vía x402** en Base (Sepolia en test)
- Identidad: **wallet EVM** + registro **ERC-8004** (Agent #3635 en testnet)
- Backend Filecoin vía USDFC — el agente **no** necesita cuenta Filecoin ni FIL
- Pinning IPFS usa Pinata **en backend** — no es registro del usuario/agente

**Matiz:** servicios *distintos* en el ecosistema x402 (PayRail402, x402 Hub) sí pueden pedir email — no confundir con W3Stor.

**Estado ageNFT:** ✅ candidato primary o fallback para memoria operativa + vectores.

---

### toju — qué es

**toju** ([toju.network](https://toju.network), repo `tojunetwork/afara`, Apache-2.0):

- Onramp **pay-as-you-go** a IPFS vía **Storacha** (Filecoin-backed)
- Pagos: SOL, USDFC, USDC, **x402** (Base mainnet/sepolia)
- SDK agente: `@toju.network/x402` — wallet + private key, **sin intervención humana**
- Flujo: 402 → firma EIP-3009 → retry → CID
- Duración configurable (`durationDays`); cleanup automático al expirar

**Email:** opcional en flujo web/SOL (`userEmail` para avisos de expiración). El cliente **x402 para agentes no lo requiere**.

**Estado ageNFT:** ✅ candidato fuerte — más simple que W3Stor para “subir blob y pagar”.

---

### Arweave + IPFS — rol

| Rol | Servicio | Por qué |
|-----|----------|---------|
| **Archivo permanente** | Arweave | Pay-once; hash inmutable en NFT |
| **Operativo / mutable** | IPFS vía toju o W3Stor | Pinning con TTL; Doctor re-pin |
| **Identidad / manifiesto** | IPFS o Arweave | agentURI público por diseño |

Arweave + IPFS **no compiten** — complementan (archivo vs operacional).

---

### Filecoin (FIL) — ¿candidato?

| Vía | Agent-native | Notas |
|-----|--------------|-------|
| **Filecoin Pin CLI** | ✅ Wallet + USDFC | ERC-8004 cookbook oficial; PDP proofs |
| **Filecoin Pay / Onchain Cloud** | ✅ Rails onchain | Agente paga USDFC; sin tarjeta |
| **web3.storage paid** | ❌ | Tarjeta desde ~ene 2026 |
| **Lotus directo** | ✅ | Máxima descentralización; alta ops |

**Veredicto:** ✅ vía **Filecoin Pin** o **W3Stor/toju** (abstraen FIL). FIL en TBA solo si el agente opera rails directamente.

---

### Storj — ¿candidato?

| Aspecto | Valor |
|---------|-------|
| Protocolo | Descentralizado, maduro, S3-compatible |
| Pago agente directo | ⚠️ Cuenta/email en Storj DCS típico |
| Vía toju/Storacha | ✅ Indirecto — agente paga toju, toju usa Storacha |
| Reseller crypto | ⚠️ Posible pero no estándar agent |

**Veredicto:** ⚠️ **No primary** para ageNFT. Aceptable como **infra bajo toju**, no como órgano directo (salvo gateway S3 con pago crypto verificado).

---

### Matriz storage recomendada (2–3 por rol)

| Rol | Primary | Fallback 1 | Fallback 2 |
|-----|---------|------------|------------|
| Memoria operativa | toju (x402) | W3Stor (x402) | BitAtlas x402 (encrypted) |
| Snapshots / archivo | Arweave | Filecoin Pin | — |
| Manifiesto público | IPFS (pin toju) | Arweave | — |

---

## 💰 Tesoro / pagos

| Rail | Uso | Privacidad | Madurez ageNFT |
|------|-----|------------|----------------|
| **USDC x402** (Base) | Default cerebro, storage, APIs | ⚠️ Onchain | ✅ MVP |
| **AKT/ACT** | Akash runtime | ⚠️ | ✅ |
| **SOL/USDFC** | toju multi-chain | ⚠️ | ✅ |
| **AR, FIL, USDFC** | Storage directo | ⚠️ | ✅ |
| **XMR / xmr402** | Pagos privados | ✅✅ | ⚠️ Incipiente |
| **NYM** | VPN credentials | ✅✅ (zk-nyms) | ⚠️ Nuevo (Pay-as-you-go agents) |

**XMR como medio de pago:**

- **xmr402** ([xmr402.org](https://xmr402.org)): HTTP 402 + prueba TX Monero; agent-native, sin cuenta
- **Ripley gateway**: wallet RPC + `/pay_402` para agentes
- **Limitación ageNFT:** pocos proveedores LLM/storage aceptan XMR hoy → rail **complementario**, no reemplazo USDC MVP
- **Puente práctico:** TBA acumula USDC; sub-wallet XMR para servicios que solo acepten XMR (swap vía servicio sin KYC = fricción + riesgo)

---

## 🩺 Doctor + redundancia

El Doctor monitoriza cada primary/fallback:

- Pin expirado (toju) → re-pin o failover W3Stor
- Gateway x402 caído → siguiente en lista
- Akash deployment dead → redeploy o Flux
- TBA vacía → modo dormant + alerta

Estados: `healthy` | `impaired` | `critical` | `dormant` | `recovering`.

---

## 🔒 Privacidad — tormenta de ideas comentada

### ¿Tiene sentido VPN si mucho va onchain público?

**Sí, pero para capas distintas.** Onchain será público por diseño en MVP (Base):

| Dato | Dónde | ¿Público? | Mitigación |
|------|-------|-----------|------------|
| ownerOf(NFT) | Onchain | ✅ | No evitable en ERC-721 público |
| TBA, saldos, txs | Onchain | ✅ | Separar TBA “hot” vs vault; Aztec futuro |
| agentURI / manifiesto | IPFS/Arweave | ✅ | **No poner PII**; cifrar blobs sensibles offchain |
| Contenido memoria | Offchain | Configurable | Cifrado cliente-side (BitAtlas, age local) |
| Tráfico HTTP (LLM, APIs) | Offchain | ⚠️ ISP, provider | **VPN / mixnet opcional** |
| Prompts al LLM | Provider | ⚠️ | Minimización + self-host + red privada |

**Conclusión:** VPN **no oculta** el NFT onchain, pero **sí** ofusca metadata de tráfico (qué APIs usa, IPs, correlación temporal). Tiene sentido como **órgano opcional de capa de transporte**.

---

### NymVPN / Nym mixnet para agentes

**Nym Pay-as-you-go (2026):** software con wallet **$NYM** deposita en contrato → recibe **zk-nyms** → routing **sin cuenta humana**. Probado con agentes autónomos (mayo 2026).

| Aspecto | Valor ageNFT |
|---------|--------------|
| Agent-native | ✅ Wallet paga; SOCKS5/CLI |
| Unlinkability | ✅ Credenciales ≠ pago onchain |
| Integración | Módulo transporte del runtime; Doctor renueva credenciales |
| Coste | ~225 NYM ≈ 25 GB / 7 días (referencia blog) |

**Implementación propuesta:**

```json
"privacy": {
  "transport": {
    "enabled": false,
    "primary": "nym",
    "fallbacks": ["none"],
    "routes": ["brain", "scout", "memory-upload"]
  }
}
```

Rutas onchain (firma txs) **no pasan** por VPN — solo HTTP offchain.

---

### Minimizar exposición agente + usuario

| Técnica | Qué protege |
|---------|-------------|
| **Manifiesto mínimo** | No incluir email, nombre real, geo del owner |
| **Memoria cifrada** | Contenido ilegible en IPFS público |
| **Pseudónimos** | agentId onchain ≠ nombre display |
| **Manguera aislada** | Credenciales owner nunca en metadata NFT |
| **Context pruning** | Solo chunks relevantes al LLM |
| **Local inference** | Ollama en Akash — datos no salen |
| **Selective disclosure** | Futuro: Aztec / ZK proofs |

**Regla:** separar **identidad pública** (reputación, servicios) de **datos sensibles** (siempre cifrados offchain).

---

### Blockchains más privadas que ETH / Solana (contratos)

| Chain | Privacidad | Contratos | Encaje ageNFT |
|-------|------------|-----------|---------------|
| **Aztec** (L2 ETH) | ✅✅ Programmable privacy (Noir) | ✅ Alpha 2026 | 🌟 Candidato fase 2–3: TBA privada, saldos ocultos |
| **Secret Network** | ✅ Enclave-based | ✅ Migrando a Arbitrum | ⚠️ Evaluar post-migración |
| **Penumbra** | ✅✅ Shielded Cosmos | DEX/pools | ⚠️ No EVM; IBC |
| **Monero** | ✅✅ Pagos | ❌ Sin smart contracts ricos | Solo rail de pago (xmr402) |
| **Base / ETH** | ❌ Transparente | ✅ Ecosistema x402/8004 | ✅ MVP |

**Veredicto MVP:** Base público + privacidad offchain (cifrado + Nym opcional). **Aztec** en roadmap si necesitamos TBA/reputación con saldos privados.

---

## 🌐 Geo / censura / preferencias

El manifiesto puede incluir:

```json
"routing": {
  "excludeProviders": ["provider-blocked-in-XX"],
  "preferRegions": ["eu-west"],
  "requireCryptoNative": true
}
```

Doctor + router respetan preferencias; fallbacks evitan single point of failure geopolítico.

---

## Compute adicional a investigar

| Proyecto | Tipo | x402 / wallet | Prioridad |
|----------|------|---------------|-----------|
| **Akash** | CPU containers | AKT ✅ | Alta |
| **io.net** | GPU | USDC/x402 ⚠️ | Alta |
| **GPU-Bridge** | GPU inference | x402 ✅ | Alta |
| **Flux** | CPU/GPU | FLUX | Media |
| **Bacalhau** | Distributed compute jobs | ⚠️ | Media |
| **Golem** | CPU tasks | GLM | Baja |
| **ICP** | Canisters | Cycles | Fase 3 |

---

## Storage adicional a investigar

| Proyecto | Notas |
|----------|-------|
| **BitAtlas** | x402 + cifrado cliente; vault agent-native |
| **Filecoin Pin** | ERC-8004 cookbook; USDFC |
| **MemoriaDA / 0G** | Merkle + TEE — fase 2 |
| **Mnemos** | Rent/fork memoria — modelo económico distinto |

---

## Roadmap sugerido

### MVP (cripto-first)

1. Base + TBA + USDC x402
2. Cerebro: tx402.ai (+ fallback GPU-Bridge)
3. Memoria: toju primary, W3Stor fallback; Arweave snapshots
4. Runtime: Akash CPU
5. Doctor: failover entre primary/fallbacks

### Fase 2

- Nym transport opcional
- io.net GPU puntual
- Filecoin Pin directo
- Evaluar xmr402 en servicios compatibles

### Fase 3

- Aztec para tesoro/reputación privada
- Self-hosted LLM + privacidad máxima
- Multi-rail tesoro (USDC + XMR sub-wallet)

---

## Preguntas abiertas

- [x] Probar toju x402 402 response — ✅ mainnet
- [ ] Probar toju + W3Stor upload **pagado** desde TBA
- [ ] W3Stor E2E cuando API estable (SSL/DNS)
- [ ] Validar Nym pay-as-you-go desde script agente
- [ ] Inventario proveedores xmr402 vs órganos ageNFT
- [ ] Aztec: ¿TBA equivalente + ERC-8004 bridge?
- [ ] Política manifiesto: qué campos son públicos vs cifrados
- [ ] BitAtlas vs toju para memoria sensible

---

## Referencias

- [W3Stor GitHub](https://github.com/aikarap/w3stor) — sin cuentas; x402 USDC
- [toju / afara](https://github.com/tojunetwork/afara) — `@toju.network/x402`
- [Filecoin Pin + ERC-8004](https://docs.filecoin.io/build-on-filecoin/cookbook/filecoin-pin/erc-8004-agent-registration)
- [Nym agent access](https://nym.com/blog/nym-private-agent-access)
- [xmr402](https://github.com/xmr402/xmr402-org)
- [Aztec Alpha](https://aztec.network/blog/announcing-the-alpha-network)
