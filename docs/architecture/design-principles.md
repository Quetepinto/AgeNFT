# Principios de diseño — ageNFT

> Metas fijadas antes de estudiar en detalle los proyectos existentes.
> Estas reglas gobiernan todas las decisiones técnicas.

---

## Meta central: el Cuerpo Digital

El usuario debe percibir un ageNFT como **un solo ser digital** — un paquete, un cuerpo — no como un collage de suscripciones que él gestiona.

```
┌─────────────────────────────────────────────────┐
│              🧬 ageNFT (Cuerpo Digital)          │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Cerebro │ │ Memoria │ │ Tesoro  │  ...      │
│  │  (LLM)  │ │(historial)│ │(wallet)│           │
│  └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │                  │
│  Los órganos pueden estar en servicios distintos │
│  pero el USUARIO solo ve UN ser.                │
└─────────────────────────────────────────────────┘
```

Los órganos pueden vivir en infraestructura diferente (chain, IPFS, API de inferencia, etc.). Eso es invisible para el usuario. Lo que importa es la **experiencia de unidad**.

---

## Principio 1 — Soberanía del agente

> **El agente es propietario de todos los servicios que usa. Nunca el usuario humano.**

| ✅ Permitido | ❌ Prohibido |
|-------------|-------------|
| El agente paga con su TBA/wallet | API key del usuario en `.env` |
| Cuenta/registro a nombre del `agentId` | Suscripción Claude/OpenAI del usuario |
| Credenciales derivadas del NFT | OAuth con Google del usuario |
| x402 pay-per-request desde wallet del agente | Billing con tarjeta del usuario |
| Storage pagado desde wallet del agente | Pinning en cuenta Pinata del dev |

### Corolario

Si un servicio **requiere** identidad humana (KYC, tarjeta, email personal), **no es compatible** con ageNFT salvo que exista un proxy agent-native (x402, wallet billing, registro por `agentId`).

### Implicación para el owner humano

El usuario **posee** el NFT (propiedad legal/onchain), pero **no opera** los servicios internos. Es dueño de un cuerpo digital, no administrador de sus suscripciones.

### Excepción explícita: la Manguera 🔌

El owner **puede prestar** sus suscripciones (OpenRouter, Claude, etc.) al agente via **manguera** — credenciales cifradas, revocables, **no transferibles** con el NFT. Ver [`brain-routing.md`](brain-routing.md).

Esto no viola la transferencia limpia: al vender el NFT, la manguera del owner anterior se desconecta; el comprador conecta la suya o usa solo combustible soberano.

```
Owner humano ──posee──→ NFT ──controla──→ TBA ──paga──→ servicios
                              └──identifica──→ registros offchain
```

---

## Principio 2 — Transferencia como un todo

> **Al transferir el ageNFT, todo viaja ensamblado. El receptor no suscribe nada.**

### Experiencia objetivo

```
Owner A                          Owner B
   │                                │
   │  transfer(tokenId)             │
   │ ─────────────────────────────→ │
   │         1 TX onchain           │
   │                                │
   │                    Abre el agente → funciona.
   │                    Sin registros. Sin API keys. Sin setup.
```

### Qué significa técnicamente

Hay dos niveles:

| Nivel | Qué es | Objetivo |
|-------|--------|----------|
| **Onchain (atómico)** | 1 TX transfiere NFT + control de TBA + activos en TBA + punteros | ✅ Obligatorio |
| **Offchain (por construcción)** | Memoria, reputación, endpoints siguen al `agentId`/hash | ✅ Debe seguir automáticamente |
| **Prohibido (acoplamiento al user)** | Cualquier cosa que requiera acción del nuevo owner post-transfer | ❌ Descartar |

### Mecanismo: todo cuelga del NFT

```
                    ERC-721 (ageNFT)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ERC-6551 TBA     agentURI         agentId
    (wallet)         (metadata)    (ERC-8004)
         │               │               │
    USDC, tokens    memoryHash       reputation
    NFTs, permisos  runtimeRef       validation
```

**Regla de oro:** si algo no se transfiere automáticamente al cambiar `ownerOf(tokenId)`, no pertenece al cuerpo — es una dependencia externa ilegítima.

---

## Principio 3 — Ensamblaje invisible

> **Los órganos se conectan entre sí por referencias onchain, no por configuración del usuario.**

El manifiesto del agente (onchain o en `agentURI`) es el **mapa del cuerpo**:

```json
{
  "type": "ageNFT/v1",
  "agentId": 42,
  "organs": {
    "brain":    { "type": "x402-llm",    "endpoint": "https://...", "paidBy": "tba" },
    "memory":   { "type": "ipfs",        "cid": "bafy...",         "paidBy": "tba" },
    "treasury": { "type": "erc6551-tba", "address": "0x..." },
    "identity": { "type": "erc8004",     "registry": "0x8004..." },
    "voice":    { "type": "x402-api",    "endpoint": "https://..." }
  }
}
```

El runtime resuelve órganos leyendo este manifiesto. El usuario nunca edita esto manualmente (salvo upgrades deliberados del agente).

---

## Principio 4 — Autonomía económica (aspiracional)

> **El agente procura pagar sus propios gastos con ingresos propios.**

No es requisito del día 1, pero orienta decisiones:

- Preferir servicios **pay-per-use** (x402) sobre suscripciones mensuales
- Preferir **prepaid** (USDC en TBA) sobre billing recurrente con tarjeta
- El agente puede **cobrar** por sus servicios (x402 receiver) → TBA
- Si la TBA se queda sin fondos, el agente degrada gracefully (no rompe la transferencia)

```
Ingresos (x402, DeFi, trabajo) ──→ TBA ──→ Gastos (LLM, storage, compute)
                                        ↑
                              Owner puede recargar (opcional, no obligatorio)
```

---

## Principio 5 — Órganos intercambiables, identidad persistente

> **Los servicios pueden cambiar; la identidad del agente no.**

Un agente puede migrar de OpenRouter-x402 a otro proveedor LLM, o de IPFS a Arweave, actualizando su manifiesto. Pero:

- El `agentId` / `tokenId` **nunca cambia**
- La memoria acumulada **persiste** (nuevo snapshot, hash actualizado)
- La reputación onchain **sigue al agentId**
- El usuario percibe al **mismo ser** con órganos renovados (como un trasplante)

---

## Anti-patrones (descartar desde el diseño)

| Anti-patrón | Por qué viola los principios |
|-------------|------------------------------|
| "Conecta tu API key de OpenAI" | Servicio del usuario, no del agente |
| "Regístrate en nuestro SaaS" | Cuenta humana, no transferible en 1 TX |
| Wallet del dev que firma por el agente | Agente no es soberano |
| Memoria en PostgreSQL del servidor | No viaja con el NFT; muere al cambiar host |
| NFT solo como ticket de acceso a un SaaS | No es un cuerpo; es un pase de abono |
| Metadata mutable por el platform owner | El agente no controla su cuerpo |

---

## Test de compatibilidad de servicios

Antes de integrar cualquier servicio, pasar este checklist:

```
□ ¿Se puede pagar desde la wallet del agente (TBA)?
□ ¿El registro/acceso usa agentId o wallet, no email humano?
□ ¿Al transferir el NFT, el servicio sigue funcionando sin acción del nuevo owner?
□ ¿No requiere KYC/tarjeta personal?
□ ¿Es pay-per-use o prepaid (no suscripción con billing humano)?
□ ¿Las credenciales son derivables del agentId/NFT (no secretos del dev)?
```

**6/6 ✅** → compatible  
**4-5** → evaluar workaround  
**<4** → descartar o encapsular detrás de proxy agent-native

---

## Relación con proyectos existentes

Estos principios se evaluarán contra cada proyecto en [`existing-projects.md`](../research/existing-projects.md):

| Proyecto | ¿Respeta soberanía del agente? | ¿Transferencia como un todo? |
|----------|-------------------------------|------------------------------|
| Agent-NFT | Parcial (TBA ✅, runtime ❌) | Parcial |
| ERC-8004 | Identidad ✅, servicios ❌ | Identidad ✅ |
| AAWP | Wallet agente ✅, SBT no transferible ❌ | ❌ (no transferible) |
| Coinbase AgentKit | CDP = cuenta del dev ⚠️ | ❌ |
| Karen | Wallet ✅, sin NFT ❌ | N/A |

La brecha común: **identidad y wallet onchain existen; runtime y servicios siguen acoplados al desarrollador**. ageNFT debe cerrar esa brecha.

---

## Próximos pasos de diseño

1. [ ] Definir anatomía formal del cuerpo → [`digital-body.md`](digital-body.md)
2. [ ] Inventariar servicios agent-compatible → [`../research/agent-compatible-services.md`](../research/agent-compatible-services.md)
3. [ ] Diseñar el manifiesto `ageNFT/v1`
4. [ ] Diseñar flujo de transferencia (1 TX + verificación post-transfer)
5. [ ] Evaluar cada proyecto existente contra estos principios
