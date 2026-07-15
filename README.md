# ageNFT

Agente IA embebido en un NFT: identidad onchain, memoria no fungible, wallet propia y runtime offchain acoplado al token.

## Concepto

Un **ageNFT** no es solo un JPEG con metadata. Es un paquete transferible que combina:

| Capa | Qué es | Dónde vive |
|------|--------|------------|
| Identidad | NFT + registro de agente | Onchain |
| Tesorería | Wallet del token (TBA / PDA) | Onchain |
| Memoria | Historial, personalidad, skills | Offchain (IPFS/Arweave) + hash onchain |
| Cerebro | LLM + tools | Offchain (runtime) |
| Economía | Cobrar/pagar servicios | x402, DeFi acotado, APIs propias |

Al transferir el NFT, el nuevo dueño hereda identidad, fondos, memoria y reputación.

## Principios de diseño

1. **Cuerpo digital** — el usuario percibe un solo ser, no un collage de suscripciones
2. **Soberanía del agente** — el agente es propietario de todos los servicios que usa, nunca el usuario
3. **Transferencia como un todo** — 1 TX onchain; el receptor no se suscribe a nada
4. **Órganos intercambiables** — servicios pueden cambiar; identidad y memoria persisten
5. **Stack cripto-native** — preferencia por infra descentralizada/cripto; 2–3 alternativas por órgano

→ Detalle en [`docs/architecture/design-principles.md`](docs/architecture/design-principles.md)

## Estado

**Fase 0** ✅ · **Fase 1** ✅ · **Fase 2** en curso (~85%)

Ver [`docs/architecture/development-roadmap.md`](docs/architecture/development-roadmap.md)

**Publicar en GitHub:** [`docs/GITHUB_SETUP.md`](docs/GITHUB_SETUP.md)  
**dApp estática:** [`dapp/`](dapp/) → GitHub Pages

- [x] Crear repositorio y estructura
- [x] Fijar principios de diseño y anatomía del cuerpo digital
- [x] Inventario inicial servicios descentralizados → [`docs/research/decentralized-services.md`](docs/research/decentralized-services.md)
- [x] Validación parcial servicios → [`validation-results.md`](docs/research/validation-results.md) (tx402 ✅ toju ⚠️ jul-2026)
- [x] Validación E2E con pago (wallet USDC Base **mainnet** — `runtime/npm run once:pay`) ✅ 2026-07-12
- [x] Fase 1: mint + runtime loader + memory autowrite → [`runtime/README.md`](runtime/README.md)
- [x] Fase 2.2 Reflejos (BudgetTracker) + Fase 2.1 memoria offchain + restart test ✅
- [x] Fase 2.3 Transfer checklist Unit-1 round-trip ✅ → [`transfer-checklist-lab.md`](docs/research/transfer-checklist-lab.md)
- [x] Fase 1 cierre: 1 inferencia tx402 pagada (Unit-1, tx402.ai minimax)

## Estructura

```
ageNFT/
├── contracts/     # Smart contracts (identidad, TBA, registries)
├── runtime/       # Servidor del agente (LLM, memoria, tools)
├── scripts/       # Deploy, mint, utilidades
└── docs/
    ├── manifest/        # Schema + ejemplos manifiesto v1
    ├── research/
    └── architecture/
```

### Manifiesto
- [ageNFT/v1 provisional](docs/manifest/README.md)
- [Schema JSON](docs/manifest/ageNFT-v1-provisional.schema.json)
- [Ejemplo minimal (Fase 1)](docs/manifest/examples/minimal.json)

## Documentación

### Arquitectura
- [Plan de desarrollo por fases](docs/architecture/development-roadmap.md)
- [Alcance del proyecto (ageNFT ≠ SA)](docs/architecture/project-scope.md)
- [Principios de diseño](docs/architecture/design-principles.md)
- [Anatomía del cuerpo digital](docs/architecture/digital-body.md)
- [Economía — ingresos, gastos, valoración](docs/architecture/economics.md)
- [Gastos y límites por órgano](docs/architecture/spending-budgets.md)
- [Cerebro multi-fuente — scout y manguera](docs/architecture/brain-routing.md)
- [Gaming Web3 — vertical de ingresos *(aplicación opcional)*](docs/architecture/gaming-vertical.md)
- [Visión Star Atlas *(aplicación opcional)*](docs/architecture/star-atlas-vision.md)
- [Identidad del agente — ¿Hermes u otro?](docs/architecture/agent-identity.md)
- [Comparativa de blockchains](docs/architecture/blockchain-comparison.md)

### Investigación
- [Stack cripto-native + privacidad + redundancia por órgano](docs/research/crypto-native-stack.md)
- [Validación práctica Fase 0](docs/research/validation-results.md)
- [Líneas activas: ERC-8181 + ElizaOS](docs/research/watchlist.md)
- [¿Qué es x402?](docs/research/x402.md)
- [Servicios descentralizados (pagos automáticos)](docs/research/decentralized-services.md)
- [Servicios agent-compatible (checklist)](docs/research/agent-compatible-services.md)
- [Investigación profunda + ideas accionables](docs/research/similar-projects-deep-dive.md)

## Relación con otros proyectos del workspace

**ageNFT es independiente.** Los demás proyectos son fuentes de experiencia o aplicaciones opcionales futuras — no definen el producto core.

| Proyecto | Relación con ageNFT |
|----------|---------------------|
| StarAtlas | Repo **separado**. Posible vertical gaming más adelante |
| trading-hyperliquid-v2 | Patrones de bot autónomo reutilizables |
| fondear-openrouter | Financiación de APIs de modelos |

→ Alcance formal: [`docs/architecture/project-scope.md`](docs/architecture/project-scope.md)
