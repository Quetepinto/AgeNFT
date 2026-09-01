# P001 — Handle Telegram al transferir ageNFT

> **Estado:** Aprobado · **Fecha:** 2026-09-01  
> **Decisión padre:** [`transfer-telegram-gateway.md`](../transfer-telegram-gateway.md) · [`transfer-gateway-security.md`](../transfer-gateway-security.md)

**Usar este precedente** al diseñar cualquier gateway con identidad externa (Matrix `@`, Discord bot, Nostr npub operativo, webhooks con URL fija).

---

## Problema

Al transferir el NFT, el **token de Telegram** y el **@handle** viven en Vault 0 del ex-owner. Si no se cortan:

- El ex-owner podría seguir respondiendo en el handle viejo (confusión / estafa).
- El comprador podría arrancar mal cableado (token ajeno, handle obsoleto en manifiesto).
- Transfer directo en BaseScan **sin wizard** deja servicios vivos en hosts ajenos.

---

## Qué NO viaja onchain

| Pieza | Viaja |
|-------|-------|
| NFT, TBA, soul, URUIRU, Reflejos | ✅ |
| `@handle` Telegram | ❌ |
| Token BotFather | ❌ |
| Proceso bot en VPS vendedor | ❌ |

El manifiesto puede listar un handle **histórico** (mint). Tras transfer es **metadato obsoleto** hasta que el nuevo owner actualice o el Vigilante lo marque.

---

## Política

| Regla | Valor |
|-------|-------|
| Nuevo owner | **Bot nuevo** (`new-bot-only`) |
| Mismo @handle cooperativo | ❌ Descartado |
| Ex-owner | Parar servicio + **revocar** token |
| Gate runtime | `ownerOf` = wallet operadora |

---

## Capas de defensa

| # | Capa | Mecanismo | Cierra |
|---|------|-----------|--------|
| 1 | Gate | `owner-gate.mjs` | Operar ageNFT con wallet ajena |
| 2 | Identidad nueva | Bot + token del comprador | Reutilizar cable del vendedor |
| 3 | Revocación | BotFather `/revoke` | Token vivo en @handle viejo |
| 4 | Auto-wipe (roadmap) | Listener `Transfer` | Vault 0 local stale |
| 5 | Vigilante | `transfer:vigilante` | Config incoherente post-transfer |

---

## Probe

```http
GET https://api.telegram.org/bot<TOKEN>/getMe
```

| Respuesta | Significado |
|-----------|-------------|
| **200** | Token vivo — username en `result.username` |
| **401** | Token muerto — OK checklist ex-owner |

Comando: `npm run gateway:verify-telegram [--must-be-dead|--must-be-alive]`

---

## Transfer sin wizard (BaseScan)

| Riesgo | Vigilante lo detecta |
|--------|---------------------|
| wallet ≠ ownerOf | 🔴 `owner_gate` |
| Token presente + gate falla | 🔴 `token_alive_wrong_owner` |
| Handle manifiesto ≠ getMe | 🟠 `manifest_handle_stale` |
| Bot proceso + owner mismatch | 🔴 `bot_running_wrong_owner` |
| Sin token pero gateway cableado | 🟠 `token_missing` |

El ageNFT **no finge** normalidad: informe + DORMANT hasta re-cablear.

---

## Vigilante — checks Hygiene

Ver implementación: `runtime/src/transfer-vigilante.mjs`

| ID check | Severidad | Acción sugerida |
|----------|-----------|-----------------|
| `owner_gate` | critical | Pare bot; wallet correcta o ex-owner apague |
| `token_alive_wrong_owner` | critical | Revoca; crea bot nuevo |
| `manifest_handle_stale` | warning | Actualiza manifiesto o ignora hint histórico |
| `bot_running_wrong_owner` | critical | `pkill` bot + revocar |
| `token_missing` | warning | Crear bot en BotFather |
| `ex_owner_token_should_be_dead` | warning | Revocar (--must-be-dead para ex-owner) |

---

## Casos futuros — comparar con P001

| Caso | Común con P001 | Diferente |
|------|----------------|-----------|
| **Matrix bot** | Vault 0, new-only, owner gate, logout probe | Access token + device id; homeserver |
| **Discord bot** | Reset token en portal; new application opcional | OAuth2 scopes; guild invites |
| **Nostr DM** | nsec no viaja; rotar keys | npub público sí; relays distintos |
| **Webhook URL fija** | Invalidar secret; nueva URL comprador | No hay @handle; DNS/subdominio |
| **Tier E API keys** | Revocar en dashboard proveedor | Facturación SaaS del ex-owner |
| **SSH / hosting** | Apagar instancia vendedor | No hay probe HTTP estándar |

**Checklist reutilizable:** ver [`../README.md`](../README.md) — marco de precedentes.

---

## Implementación

| Pieza | Estado |
|-------|--------|
| `owner-gate.mjs` | ✅ |
| `gateway-verify-telegram.mjs` | ✅ |
| `transfer-vigilante.mjs` | ✅ |
| Listener Transfer → wipe | ⏳ |
| Wizard dashboard | ⏳ |

---

## Copy usuario (fijo)

**Ex-owner:** Revoca el bot en @BotFather. El comprador crea el suyo. Tu token no controla su ageNFT.

**Nuevo owner:** Crea bot **nuevo**. No uses el del vendedor. Ejecuta `npm run transfer:vigilante` antes de abrir chat público.
