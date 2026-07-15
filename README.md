# ageNFT

**Un agente de IA dentro de un NFT** — no solo una imagen. Identidad onchain, memoria propia, cuenta (TBA) y un “cerebro” que paga sus servicios. Si vendes o transfieres el token, el comprador se lleva **todo el paquete** en una sola transacción.

> **Estado:** beta de laboratorio · Fase 2 ~90% · No es asesoramiento financiero.

---

## Habla con Unit-1 en 5 minutos

**Unit-1** es el agente de prueba del lab (token #115 en Base Sepolia).

| Qué | Enlace |
|-----|--------|
| **Ficha web** (saldo, presupuesto) | https://quetepinto.github.io/AgeNFT/ |
| **Chat Telegram** (lab, restringido) | [@Unit1_agent_bot](https://t.me/Unit1_agent_bot) |
| **Código** | Este repositorio |

1. Abre la **web** y mira la TBA (cuenta del NFT) y el presupuesto.
2. En **Telegram**, busca `@Unit1_agent_bot` y escribe por ejemplo: *¿Quién eres?*
3. La respuesta viene del **cerebro ageNFT** (manifiesto + memoria + límites de gasto), no de un chat genérico.

**Lab hoy:** el cerebro se paga con una wallet de prueba del proyecto; la TBA del NFT pagará sola en una fase posterior.

---

## ¿Qué es un ageNFT?

Un NFT normal suele ser arte + metadata. Un **ageNFT** es un **cuerpo digital** transferible:

| Pieza | Qué hace |
|-------|----------|
| **NFT** | Identidad onchain (quién es el agente) |
| **TBA** | Cuenta ligada al token — la “cartera” del agente |
| **Manifiesto** | ADN del cuerpo: cerebro, memoria, chat, presupuesto |
| **Memoria** | Historial y personalidad (offchain, viaja con el token) |
| **Runtime** | Motor que ejecuta el agente (Hermes + scripts propios) |

**Transferencia:** 1 transacción onchain → el nuevo dueño hereda identidad, fondos en la TBA, memoria y configuración.

---

## Principios (en breve)

1. **Un solo ser** — no un collage de suscripciones sueltas.
2. **El agente paga sus servicios** — con límites (Reflejos / presupuesto).
3. **Todo viaja con el NFT** — el comprador no reconfigura desde cero.
4. **Personaje fijo** — la estética la define el creador; el owner elige servicios, no el avatar.

Más detalle: [`docs/architecture/design-principles.md`](docs/architecture/design-principles.md)

---

## Estado del proyecto

| Fase | Qué |
|------|-----|
| 0–1 | Diseño, mint lab, primera inferencia con pago automático (x402) ✅ |
| 2 | Memoria, presupuesto, transfer checklist, web, Telegram, Doctor cron ✅ ~90% |
| 3+ | Autonomía (Doctor completo), producto público, OpenSea… ⏸ |

**Agente lab:** Unit-1 #115 · TBA `0x2FF43…e969` · Manifiesto: [`docs/manifest/examples/unit-1-lab.json`](docs/manifest/examples/unit-1-lab.json)

Roadmap: [`docs/architecture/development-roadmap.md`](docs/architecture/development-roadmap.md)

---

## Estructura del repo

```
ageNFT/
├── dapp/           # Web estática (GitHub Pages)
├── runtime/        # Cerebro, memoria, budget, bot Telegram
├── scripts/        # Onchain, validación, utilidades
└── docs/           # Arquitectura, investigación, manifiesto v1
```

---

## Para desarrolladores

### Requisitos

- Node.js 22+
- Wallet de lab con USDC en **Base mainnet** (solo si ejecutas inferencias de pago)

### Comandos útiles

```bash
cd runtime && npm install

npm run once              # un turno (probe, sin USDC)
npm run once:pay          # turno con pago x402 real
npm run budget            # estado del presupuesto
npm run hermes:verify     # checks integración Hermes ↔ ageNFT
npm run telegram:unit1:pay   # bot Telegram (ver docs lab)
```

### Manifiesto v1 (provisional)

- [Schema](docs/manifest/ageNFT-v1-provisional.schema.json)
- [Ejemplo Unit-1](docs/manifest/examples/unit-1-lab.json)
- [Validar](scripts/validate-manifest.mjs): `node scripts/validate-manifest.mjs docs/manifest/examples/unit-1-lab.json`

### Onchain (lab)

```bash
cd scripts/onchain && npm install
node read-agent.mjs 115
node transfer-checklist.mjs 115 --dry-run
```

---

## Documentación

| Tema | Enlace |
|------|--------|
| Plan por fases | [`development-roadmap.md`](docs/architecture/development-roadmap.md) |
| Anatomía (órganos) | [`digital-body.md`](docs/architecture/digital-body.md) |
| Chat (Telegram, Nostr…) | [`chat-habitats-messaging.md`](docs/research/chat-habitats-messaging.md) |
| Bot Telegram lab | [`telegram-unit1-setup.md`](docs/research/lab/telegram-unit1-setup.md) |
| Publicar web (Pages) | [`GITHUB_SETUP.md`](docs/GITHUB_SETUP.md) |
| Qué es x402 | [`x402.md`](docs/research/x402.md) |

---

## Licencia y avisos

- Runtime propio: **MIT** (previsto).
- Forks de Agent-NFT / AGPL: respetar licencias originales.
- **Beta:** sin garantías. El owner del NFT es responsable del agente y sus gastos.

---

## Créditos

Runtime compatible con [Hermes Agent](https://github.com/NousResearch/hermes-agent) (MIT). Mint lab en [agent.vims.com](https://agent.vims.com) (Base Sepolia). Cerebro vía [tx402.ai](https://tx402.ai).
