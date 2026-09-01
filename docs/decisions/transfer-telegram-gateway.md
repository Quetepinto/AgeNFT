# Decisión — Transferir ageNFT = finalizar acceso al bot

> **Estado:** Aprobado · **Fecha:** 2026-08-31  
> **Regla:** `TRANSFERIR EL AgeNFT = FINALIZAR ACCESO AL BOT` — sin excepciones de producto.

---

## Principio

Un ageNFT es un **cuerpo compacto onchain** (NFT + TBA + manifiesto + soul). Los **cables** (cerebro, memoria, Telegram…) se configuran en runtime, pero **Telegram no es parte del núcleo** — vive en Vault 0.

Al cambiar `ownerOf`:

1. El **ex-owner pierde derecho a operar** el cuerpo (gate runtime).
2. El **ex-owner pierde el bot** (revocar token + parar servicio).
3. El **nuevo owner** crea **bot nuevo** — nunca reutiliza el del vendedor.

---

## Política Telegram (única vía)

```
Transfer NFT onchain
    ↓
Gateway Telegram → unbound (sin token válido del ex-owner)
    ↓
EX-OWNER (obligatorio):
  • parar servicio bot en su host
  • revocar/regenerar token en @BotFather
    ↓
NUEVO OWNER:
  • crear SU bot en BotFather (nuevo @handle)
  • token en SU Vault 0
  • runtime con SU wallet = ownerOf(tokenId)
```

| Pieza | ¿Viaja con el NFT? |
|-------|-------------------|
| URUIRU, soul, TBA, Reflejos | ✅ Sí (núcleo compacto) |
| `@Unit1_agent_bot` / token API | ❌ No (Vault 0) |
| VPS / Hermes del vendedor | ❌ No |

---

## Opción descartada: «modo cooperativo» (mismo @handle)

**Descartada por diseño** — no se implementa ni se documenta como camino de producto.

Idea rechazada: transferir propiedad del bot en BotFather al comprador y conservar el mismo `@handle`.

| Riesgo | Por qué descartamos |
|--------|---------------------|
| Ex-owner con copia del token | Sigue respondiendo hasta revocar — ventana peligrosa |
| Dependencia post-venta | Comprador necesita cooperación del vendedor (no trustless) |
| Dos operadores, un handle | Confusión de identidad; parece un solo URUIRU cuando no lo es |
| Puerta a abuso | Antiguo owner como “extraño” con acceso al mismo bot |

**Alternativa si se conocen:** hablar por Telegram **humano** o que cada uno tenga **su ageNFT** — no mezclar propiedad del bot.

---

## Candado técnico (implementado)

### 1. `ownerOf` gate (runtime)

En cada turno y al arrancar el bot Telegram:

```
ownerOnChain = ownerOf(tokenId)
operatorWallet = AGENFT_OPERATOR_ADDRESS || wallet en ~/.credentials
si ownerOnChain ≠ operatorWallet → DORMANT / exit(3)
```

Archivo: `runtime/src/owner-gate.mjs`  
Integrado en: `run-turn.mjs`, `telegram-unit-mainnet-bot.mjs`

Solo `--force` en CLI de lab salta el gate (nunca en producción).

### 2. Revocación token (ex-owner, manual obligatorio)

Telegram no lee blockchain. El ex-owner **debe** revocar el token en BotFather. Sin eso la API sigue activa aunque el gate bloquee el cerebro ageNFT.

**Doble candado:** gate ownerOf + revocación token.

---

## Checklists

### Ex-owner (inmediatamente tras `safeTransferFrom`)

1. Parar servicio: `systemctl stop agenft-telegram-mainnet` (o equivalente)
2. Revocar token en @BotFather
3. No mantener runtime apuntando a ese tokenId con wallet ajena

### Nuevo owner (antes de chat público)

1. Verificar `ownerOf` en BaseScan
2. Crear **bot nuevo** en BotFather
3. `AGENFT_OPERATOR_ADDRESS` = su wallet owner
4. `npm run owner:gate` → OK
5. `npm run telegram:mainnet:pay`

Script: `scripts/onchain/transfer-mainnet.mjs <tokenId> <to>`

---

## Manifiesto (`ageNFT/v1`)

```json
{
  "body": {
    "model": "compact-core",
    "core": ["identity", "treasury", "soul", "reflexes", "budget", "visual"],
    "cables": ["brain", "memory", "gateways", "runtime", "presence", "doctor"]
  },
  "transfer": {
    "vault0NeverTravels": true,
    "transferEndsBotAccess": true,
    "gateways": {
      "telegram": {
        "binding": "owner-vault0",
        "onOwnerChange": "invalidate-and-rebind",
        "policy": "new-bot-only"
      }
    },
    "runtimeGate": {
      "requireOwnerOfMatch": true,
      "onMismatch": "dormant_refuse_turns"
    }
  }
}
```

---

## Qué NO hacer

| Idea | Estado |
|------|--------|
| Modo cooperativo mismo @handle | ❌ Descartado |
| Token Telegram en manifiesto / IPFS | ❌ Prohibido |
| Asumir que transfer NFT apaga Telegram solo | ❌ Falso |
| Ex-owner sigue operando con `--force` en producción | ❌ Solo lab explícito |

---

## Implementación

| Componente | Estado |
|------------|--------|
| `owner-gate.mjs` | ✅ |
| `run-turn.mjs` | ✅ |
| `telegram-unit-mainnet-bot.mjs` | ✅ |
| `transfer-mainnet.mjs` + checklist | ✅ |
| `transfer-gateway-security.md` (Vault 0, bot nuevo, probe) | ✅ |
| `gateway:verify-telegram.mjs` | ✅ |
| Auto-wipe Vault 0 al detectar transfer | ⏳ |
| `transfer:vigilante.mjs` | ✅ |
| Wizard Dashboard post-transfer | ⏳ Fase posterior |

---

## Docs relacionados

- **[`transfer-gateway-security.md`](transfer-gateway-security.md)** — FAQ bot nuevo, tres capas de cierre, Vault 0, probe `getMe`
- [`memory-transfer-policy.md`](../research/memory-transfer-policy.md)
- [`transfer-local-hosting.md`](../research/transfer-local-hosting.md)
- [`dapp/transfer.html`](../../dapp/transfer.html)
