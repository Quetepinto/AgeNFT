# ageNFT

**Un agente de IA dentro de un NFT** — no solo una imagen. Identidad onchain, memoria propia, cuenta (TBA) y un “cerebro” que paga sus servicios. Si vendes o transfieres el token, el comprador se lleva **todo el paquete** en una sola transacción.

> **Estado:** **Unit-Mainnet #1 en vivo** (Base mainnet) · Sepolia lab legacy · No es asesoramiento financiero.

---

## ⚠️ Migración a Base mainnet

**Unit-Mainnet #1** ya está minteado con registro propio **AgeNFT**.

| Qué | Dirección / enlace |
|-----|-------------------|
| Contrato AgeNFT | [`0x76FC…eB839`](https://basescan.org/address/0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839) |
| Token #1 + TBA | [`0x9BF1…3CCB`](https://basescan.org/address/0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB) |
| Manifiesto | [`docs/manifest/examples/unit-mainnet.json`](docs/manifest/examples/unit-mainnet.json) |

**Unit-1 #115** sigue en lab Sepolia (VIMS) — no se migra el token.

| Doc | Qué |
|-----|-----|
| [`docs/decisions/chain-base-mainnet.md`](docs/decisions/chain-base-mainnet.md) | Decisión cadena |
| [`docs/research/mainnet-migration.md`](docs/research/mainnet-migration.md) | Plan |
| [`docs/research/lab/addresses.base-mainnet.json`](docs/research/lab/addresses.base-mainnet.json) | Direcciones live |

---

## Habla con Unit-Mainnet (MVP)

**Unit-Mainnet** es el agente público en **Base mainnet** — NFT #1, TBA soberana, pagos x402 desde la tesorería del token.

| Qué | Enlace |
|-----|--------|
| **Ficha web** (TBA, presupuesto) | https://quetepinto.github.io/AgeNFT/ |
| **Qué viaja al transferir** | [`dapp/transfer.html`](dapp/transfer.html) |
| **Chat Telegram** | [@Unit1_agent_bot](https://t.me/Unit1_agent_bot) |
| **NFT en BaseScan** | [token #1](https://basescan.org/token/0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839?a=1) |

1. Abre la **web** — saldo USDC/ETH de la TBA en tiempo real.
2. En **Telegram**, escribe por ejemplo: *¿Quién eres?*
3. La respuesta viene del **cerebro ageNFT** (manifiesto + memoria + Reflejos), pagando desde la **TBA**.

**Lab legacy:** [Unit-1 #115 Sepolia](docs/manifest/examples/unit-1-lab.json) — solo archivo; no es el producto MVP.

---

## MVP mainnet — qué incluye hoy

| Pieza | Estado |
|-------|--------|
| Mint + TBA Base mainnet | ✅ |
| Pago cerebro desde TBA (x402) | ✅ |
| Manifiesto + runtime + memoria local | ✅ |
| dApp (ficha + transfer) | ✅ |
| Hermes / Telegram (skill + scripts) | ✅ instalar con `npm run hermes:install` |
| Checklist E2E | ✅ 8/8 |

Pendiente MVP+: memoria IPFS/toju, vídeo demo. TBA fondeada (~5 USDC). Rostro: **URUIRU** (Gespenster).

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
| 2 | Memoria, presupuesto, transfer, web, Telegram, Doctor | ✅ MVP mainnet |
| 3+ | Mercado, OpenSea, autonomía completa | ⏸ |

**Agente MVP:** Unit-Mainnet #1 · TBA soberana · [`unit-mainnet.json`](docs/manifest/examples/unit-mainnet.json)

**Lab legacy:** Unit-1 #115 Sepolia

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

npm run once:pay          # turno — paga desde TBA (auto)
npm run budget            # estado del presupuesto
npm run dapp:export       # actualizar JSON público de la web
npm run hermes:install    # skill + cron Doctor (Unit-Mainnet)
npm run hermes:verify     # checks Hermes ↔ ageNFT
```

### Manifiesto v1 (provisional)

- [Schema](docs/manifest/ageNFT-v1-provisional.schema.json)
- [Ejemplo Unit-Mainnet](docs/manifest/examples/unit-mainnet.json)
- [Ejemplo Unit-1 lab](docs/manifest/examples/unit-1-lab.json)
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
| **Migración mainnet** | [`mainnet-migration.md`](docs/research/mainnet-migration.md) |
| Cadena Base mainnet | [`chain-base-mainnet.md`](docs/decisions/chain-base-mainnet.md) |
| VIMS → registro propio | [`vims-vs-agenft-registry.md`](docs/research/vims-vs-agenft-registry.md) |
| Spec contratos | [`agenft-registry-spec.md`](docs/architecture/agenft-registry-spec.md) |
| Catálogo órganos | [`organ-assembly-catalog.md`](docs/research/organ-assembly-catalog.md) |
| Próximos pasos | [`next-steps.md`](docs/research/lab/next-steps.md) |
| Qué es x402 | [`x402.md`](docs/research/x402.md) *(backup)* |

---

## Licencia y avisos

- Runtime propio: **MIT** (previsto).
- Forks de Agent-NFT / AGPL: respetar licencias originales.
- **Beta:** sin garantías. El owner del NFT es responsable del agente y sus gastos.

---

## Créditos

Runtime compatible con [Hermes Agent](https://github.com/NousResearch/hermes-agent) (MIT). Lab histórico: mint VIMS Sepolia (Unit-1). **Producto:** ageNFT Registry en Base mainnet. Cerebro vía [tx402.ai](https://tx402.ai).
