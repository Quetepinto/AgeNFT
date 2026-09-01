# Decisiones ageNFT — índice

> Registro ordenado de decisiones de producto, seguridad y arquitectura.  
> **Regla:** si debatimos algo importante y no queda aquí, falta documentación.

---

## Cómo usar este índice

| Necesitas… | Ve a… |
|------------|--------|
| Dashboard + mini-chat + Hermes | [`dashboard-onboarding-chat.md`](dashboard-onboarding-chat.md) |
| Política transfer + Telegram | [`transfer-telegram-gateway.md`](transfer-telegram-gateway.md) |
| Seguridad Vault 0, bot nuevo, Vigilante | [`transfer-gateway-security.md`](transfer-gateway-security.md) |
| Precedente reusable (casos similares) | [`precedents/`](precedents/) |
| Chain Base mainnet | [`chain-base-mainnet.md`](chain-base-mainnet.md) |

---

## Marco de precedentes

Cuando un caso concreto (ej. handle Telegram al transferir) encierra un **patrón reusable**, lo formalizamos como **precedente** `P00N`.

### Plantilla mental (aplicar a cualquier cable/gateway)

1. **¿Qué viaja onchain?** — núcleo compacto (NFT, TBA, manifiesto, soul).
2. **¿Qué vive en Vault 0?** — tokens, keys, handles operativos del host.
3. **¿Nuevo owner = credencial nueva?** — default **sí** (`new-*-only`).
4. **¿Gate técnico?** — `ownerOf`, permisos, Reflejos.
5. **¿Revocación humana?** — BotFather, OAuth, API dashboard del proveedor.
6. **¿Probe verificable?** — HTTP/API que distingue vivo/muerto.
7. **¿Vigilante Hygiene?** — manifiesto obsoleto vs config real.
8. **¿Transfer sin wizard?** — riesgos + alarma Doctor/Vigilante.

**Principio:** cuantos **menos cables sueltos**, mejor. Cada gateway nuevo debe pasar por esta checklist antes de merge.

### Comparar casos futuros

Al diseñar Matrix, Discord, Nostr, tier E, hosting…

```
1. Leer precedente más cercano (empezar por P001 Telegram).
2. Tabla: qué tienen en común / en qué difieren.
3. Reutilizar: gate, wipe on transfer, new-credential-only, probe, Vigilante.
4. Documentar nuevo precedente si el patrón diverge en algo material.
```

---

## Decisiones por tema

| ID | Doc | Tema | Estado |
|----|-----|------|--------|
| D-TG-01 | `transfer-telegram-gateway.md` | Transfer = fin acceso bot | ✅ |
| D-TG-02 | `transfer-gateway-security.md` | Vault 0, bot nuevo, Vigilante | ✅ |
| D-DB-01 | `dashboard-onboarding-chat.md` | Mini-chat guiado + arnés | ✅ |
| D-NOM-01 | `nomenclatura-hermes-nous.md` | Solo Hermes = Nous; capas; MVP vs atajo | ✅ |
| D-CH-01 | `chain-base-mainnet.md` | Base mainnet Unit-Mainnet | ✅ |

---

## Precedentes

| ID | Caso | Patrón clave |
|----|------|--------------|
| [P001](precedents/P001-telegram-handle-transfer.md) | Handle Telegram al transferir | new-bot-only · owner gate · getMe probe · Vigilante |

---

## Implementación runtime (transfer / gateways)

| Comando | Función |
|---------|---------|
| `npm run owner:gate` | wallet operadora = ownerOf |
| `npm run gateway:verify-telegram` | probe getMe (vivo/muerto) |
| `npm run transfer:vigilante` | informe unificado post-transfer / Hygiene |
| `npm run hermes:doctor` | Vitality (TBA, cerebro, memoria) |

---

## Recordatorio para el agente

Si en el futuro el usuario olvida un tema debatido que **no** esté claro en estos docs:

1. Citar el precedente o decisión relevante.
2. Proponer alinear el caso nuevo al marco (tabla común/diferencias).
3. Actualizar docs **antes** o **junto** con el código.
