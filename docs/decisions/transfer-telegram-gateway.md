# Decisión — Telegram y cambio de owner del ageNFT

> **Estado:** Aprobado · **Fecha:** 2026-08-31  
> Bloquea replanteos de transferencia antes del prototipo público.

---

## Problema

Transferir el NFT (1 tx onchain) **no** transfiere el bot de Telegram:

- El **token** del bot vive en Vault 0 (`~/.credentials`), no en el manifiesto ni en chain.
- Quien conserve token + VPS puede seguir respondiendo en `@…_bot` aunque ya no sea `ownerOf(tokenId)`.
- BotFather ligó el bot a una **cuenta Telegram humana**, no a una wallet.

Hay que definir el corte por defecto entre ex-owner y nuevo owner.

---

## Decisión (default de producto)

### 1. El handle Telegram **no** es parte del núcleo inseparable

| Núcleo compacto (viaja con el NFT) | Cable desmontable (Vault 0) |
|--------------------------------------|-----------------------------|
| NFT, TBA, soul, URUIRU, Reflejos, presupuesto | Token Telegram, runtime host, `.env` |

El comprador hereda **URUIRU** (personaje), no `@Unit1_agent_bot` (enchufe técnico).

### 2. Camino default al transferir: **bot nuevo del comprador**

```
Transfer NFT onchain
  → gateway Telegram pasa a estado unbound (sin token válido)
  → ex-owner: checklist obligatorio (revocar + apagar)
  → nuevo owner: crea SU bot en BotFather → nuevo token → su runtime
```

**Por qué es el default:**

- Venta **sin confianza**: el comprador no depende del Telegram del vendedor.
- Corte claro: token viejo revocado = API de Telegram deja de aceptar al ex-owner.
- Coherente con Vault 0: credenciales nunca viajan en el NFT.
- El nombre `@Unit1_agent_bot` es legado lab; en producto el owner elige handle (o lo genera el wizard).

### 3. Camino opcional (cooperativo): **misma cuenta @handle**

Solo si vendedor y comprador acuerdan explícitamente:

1. Vendedor transfiere **propiedad del bot** en BotFather a la cuenta Telegram del comprador (función nativa de Telegram).
2. Comprador **regenera token** (el anterior queda invalidado).
3. Comprador configura su runtime con el token nuevo.

No es default: requiere cooperación post-venta y cuenta Telegram del comprador.

### 4. Corte técnico en runtime (obligatorio implementar)

Independiente del camino Telegram, el **runtime ageNFT** debe:

```
Al arrancar y antes de cada turno:
  ownerOnChain = ownerOf(AGENFT_TOKEN_ID)
  operatorWallet = wallet configurada en el host (AGENFT_OPERATOR_ADDRESS o signer)
  si ownerOnChain ≠ operatorWallet → DORMANT + no procesar Telegram/chat
```

Efecto:

- VPS del ex-owner con wallet vieja **deja de operar** el cuerpo aunque conserve un token robado/copiado.
- El token Telegram solo sirve si quien lo usa **también** es owner onchain en ese host — o si el host no implementa el check (por eso hace falta revocar token).

**Doble candado:** revocación token (Telegram) + gate `ownerOf` (ageNFT).

### 5. Checklist ex-owner (obligatorio en transferencia)

| Paso | Quién | Acción |
|------|-------|--------|
| 1 | Vendedor | `safeTransferFrom` — NFT + TBA |
| 2 | Vendedor | Parar servicio bot (`systemctl stop …`) |
| 3 | Vendedor | Revocar/regenerar token en BotFather (invalida API) |
| 4 | Vendedor | (Opcional) Exportar memoria IPFS si política `full` |
| 5 | Comprador | Verificar `ownerOf` en BaseScan |
| 6 | Comprador | Crear bot nuevo **o** recibir transfer BotFather |
| 7 | Comprador | Configurar runtime + token en **su** Vault 0 |
| 8 | Comprador | Probar turno `--pay` desde TBA + mensaje Telegram |

Sin pasos 2–3 el ex-owner **puede** seguir respondiendo — es incumplimiento de protocolo, no bug del NFT.

### 6. Manifiesto — campos objetivo

```json
{
  "body": {
    "model": "compact-core",
    "core": ["identity", "treasury", "soul", "reflexes", "budget"],
    "cables": ["brain", "memory", "gateways", "runtime", "presence"]
  },
  "transfer": {
    "vault0NeverTravels": true,
    "gateways": {
      "telegram": {
        "binding": "owner-vault0",
        "onOwnerChange": "invalidate-and-rebind",
        "defaultPath": "new-bot",
        "optionalPath": "botfather-transfer-same-handle"
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

| Idea | Por qué no |
|------|------------|
| Meter token Telegram en manifiesto / IPFS | Filtración; contradice Vault 0 |
| Asumir que transfer NFT apaga el bot solo | Telegram no lee `ownerOf` |
| Mismo token compartido entre dos hosts | Dos operadores = dos cerebros; confuso y inseguro |
| Default = transferir bot BotFather | Bloquea ventas trustless |

---

## Implementación (orden)

1. **Documentación** — esta decisión + `transfer.html` + manifiesto ejemplo ✅
2. **`ownerOf` gate** — `run-turn.mjs`, `telegram-unit-mainnet-bot.mjs`, Doctor alerta
3. **Wizard post-transfer** — Dashboard (fase posterior)
4. **Script transfer mainnet** — incluye checklist pasos 2–3 en output

---

## Docs relacionados

- [`memory-transfer-policy.md`](../research/memory-transfer-policy.md) — Vault 0
- [`transfer-local-hosting.md`](../research/transfer-local-hosting.md) — wizard hosting
- [`dapp/transfer.html`](../../dapp/transfer.html) — UX comprador
