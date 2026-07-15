# Canales de chat — Telegram, Nostr, Matrix, Signal, Simplex

> **Estado:** Investigación producto · **Origen:** 2026-07-13  
> Última revisión: 2026-07-13

---

## Principio ageNFT

Los canales de chat son **puertas de entrada** al mismo agente (un NFT, un cerebro). No son identidades separadas.

```
                    ┌── Telegram (bot)
                    ├── Nostr (npub)
ageNFT Unit-1 ──────├── Matrix (@bot:server)
                    ├── Simplex (contacto)
                    ├── Signal (⚠️ difícil)
                    └── WhatsApp (owner opt-in, no recomendado por defecto)
```

**Presencia en todos:** contexto `chat-gateway` → icono + texto (tier icon). Sin cara animada en el chat.

---

## Política WhatsApp — decisión del owner

| Nivel | Política |
|-------|----------|
| **Protocolo ageNFT (default)** | WhatsApp **excluido** de plantillas y docs oficiales |
| **Manifiesto del agente** | Owner puede activar `gateways.chat[]` con `platform: whatsapp` |
| **Transferencia NFT** | La config de gateways viaja en manifiesto; nuevo owner elige |

**Por qué no por defecto:**
- Meta / centralizado
- API Business suele requerir teléfono y verificación humana
- Tensiona soberanía del agente (identidad atada a SIM)
- Privacidad y ToS cambiantes

**Por qué sí como opción del owner:**
- Muchos usuarios solo usan WhatsApp
- Puede ser canal de **ingreso** (clientes pagan x402 y chatean por otro lado)
- El dueño del NFT asume responsabilidad legal/operativa

```json
"gateways": {
  "policy": {
    "whatsapp": "owner-opt-in",
    "recommended": ["telegram", "nostr", "matrix", "simplex"],
    "excludedByDefault": ["whatsapp"]
  }
}
```

---

## Comparativa de canales

| Canal | Qué es | Descentralizado | Sin teléfono/email | Agente “propio” | Hermes | Prioridad ageNFT |
|-------|--------|-----------------|-------------------|-----------------|--------|------------------|
| **Telegram** | Chat con bots | ❌ | ✅ bot token | ⚠️ bot de BotFather | ✅ nativo | ★★★★★ MVP |
| **Nostr** | Notas cripto relay | ✅ | ✅ clave npub | ✅ **npub del agente** | ⚠️ skill/bridge | ★★★★★ |
| **Matrix** | Chat federado | ✅ federación | ✅ (self-host) | ✅ bot en homeserver | ⚠️ bridge | ★★★★☆ |
| **Simplex** | Chat E2E sin ID | ✅ | ✅ sin perfil fijo | ✅ contacto agente | ⚠️ skill | ★★★★☆ |
| **Signal** | Chat cifrado | ⚠️ | ❌ **requiere teléfono** | ❌ difícil | ❌ | ★★☆☆☆ |
| **Discord** | Comunidades | ❌ | ✅ bot | ⚠️ | ✅ | ★★★☆☆ |
| **WhatsApp** | Chat masivo | ❌ | ❌ teléfono + Business | ❌ | ⚠️ API | ★★ owner choice |

---

## Por canal (en cristiano)

### Telegram
- **Ya en plan** — Hermes trae gateway de bots
- Fácil, mucha gente lo usa
- El bot es del agente; token guardado en runtime (no en manifiesto público)
- Centralizado (empresa Telegram)

### Nostr (“Notas” descentralizadas)
- Identidad = par de claves **npub/nsec** (como una wallet de mensajes)
- El ageNFT puede tener **su propia npub** derivada o ligada a TBA
- Publica en **relays** (servidores que retransmiten); podéis self-host relay
- Muy alineado con Web3 y sin email
- Hermes: skill o bridge `nostr-tools` / `nak`
- **Ideal** para “el agente tiene voz pública” + Zora + Nostr notes

### Matrix
- Chat **federado** — como email pero para mensajes; podéis montar servidor propio
- Bot `@unit1:agenft.dev` en vuestro homeserver
- Element = app cliente
- Buen equilibrio privacidad + UX
- Más ops que Telegram

### Simplex Chat
- **Sin identificador fijo** — no hay “usuario@servidor” público; máxima privacidad
- Conexión por enlace de invitación
- Código abierto, E2E (cifrado extremo a extremo)
- Encaja con usuarios paranoicos y con narrativa “agente discreto”
- Menos maduro para bots masivos que Telegram

### Signal
- Excelente privacidad para **humanos**
- **Problema:** registrar número requiere **teléfono** (SIM)
- Signal-cli existe pero frágil para producto; ToS grises para bots
- **No recomendado** como canal soberano del agente
- Owner personal puede chatear con su agente por Signal **aparte** (fuera del protocolo)

### WhatsApp (opt-in owner)
- Solo si el **dueño** lo activa y acepta Meta Business API / proveedor BSP
- Teléfono, verificación, posible KYC del negocio
- Documentar como `tier: owner-bridge` — no “cuerpo nativo” del ageNFT

---

## Arquitectura — órgano `gateways`

Separado de `social` (Zora, Farcaster) y de `voice` (servicios x402 que cobra el agente).

```json
{
  "gateways": {
    "policy": {
      "whatsapp": "owner-opt-in",
      "excludedByDefault": ["whatsapp"]
    },
    "chat": [
      {
        "platform": "telegram",
        "enabled": true,
        "handle": "@Unit1LabBot",
        "credentials": "runtime-only",
        "sovereign": false
      },
      {
        "platform": "nostr",
        "enabled": false,
        "npub": null,
        "relays": ["wss://relay.damus.io", "wss://nos.lol"],
        "sovereign": true
      },
      {
        "platform": "matrix",
        "enabled": false,
        "homeserver": "https://matrix.agenft.dev",
        "userId": "@unit-1:agenft.dev"
      },
      {
        "platform": "simplex",
        "enabled": false,
        "inviteLink": null
      },
      {
        "platform": "whatsapp",
        "enabled": false,
        "ownerOptIn": true,
        "note": "Requiere Business API; no recomendado protocolo"
      }
    ]
  }
}
```

**Reglas:**
- Credenciales (`bot token`, `nsec`) → **runtime only**, nunca en manifiesto IPFS público
- `enabled` por canal — owner elige en mint wizard o post-mint
- Al **transferir NFT**, nueva config puede resetear gateways (Doctor + owner approval)

---

## Prioridad implementación

| Fase | Canal |
|------|-------|
| 2.4 / 3 | **Telegram** (Hermes gateway) |
| 4.x | **Nostr** (npub agente + relay) |
| 4.x | **Matrix** (homeserver o etke.cc) |
| 5.x | **Simplex** |
| owner | **WhatsApp** si lo pide |
| — | **Signal** — no prioritario |

---

## Relación con Hermes

Hermes ya cubre **Telegram** y puede extenderse con skills para Nostr/Matrix/Simplex. Un motor, **múltiples gateways**, un manifiesto.

No mezclar: cada gateway es adaptador; el cerebro y la memoria son los mismos.

---

## Preguntas abiertas

- [ ] ¿npub Nostr derivada de TBA o clave aparte en manifiesto?
- [ ] ¿Homeserver Matrix propio vs hosted?
- [ ] ¿Simplex bot API estable para agentes?
- [ ] ¿Wizard mint: checkboxes Telegram / Nostr / Matrix / Simplex / WhatsApp?

---

## Referencias

- [`agent-habitats.md`](agent-habitats.md)
- [`social-habitats-zora.md`](social-habitats-zora.md)
- [`presence-context-layers.md`](presence-context-layers.md) — `chat-gateway`
- [Nostr protocol](https://github.com/nostr-protocol/nips)
- [Matrix bots](https://matrix.org/docs/guides/plumbing-servicing-bot/)
- [Simplex Chat](https://github.com/simplex-chat/simplex-chat)
