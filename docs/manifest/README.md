# Manifiesto ageNFT v1 (provisional)

> **Estado:** provisional — puede cambiar antes de v1 estable.
> Referenciado por `agentURI` onchain.

## Archivos

| Archivo | Uso |
|---------|-----|
| [`ageNFT-v1-provisional.schema.json`](ageNFT-v1-provisional.schema.json) | JSON Schema validación |
| [`examples/minimal.json`](examples/minimal.json) | Plantilla Fase 1 |
| [`examples/unit-1-lab.json`](examples/unit-1-lab.json) | Lab Unit-1 #115 (incl. `presence`, `collaborators`) |

## Órganos opcionales (borrador 2026-07-13)

| Órgano | Doc | Fase |
|--------|-----|------|
| `presence` | [`presence-organ.md`](../research/presence-organ.md) | 4.5 |
| `presence.contexts` | [`presence-context-layers.md`](../research/presence-context-layers.md) | 4.5 |
| `collaborators` | [`agenft-collaboration.md`](../research/agenft-collaboration.md) | 3–4 |
| `lifecycle` | [`onboarding-airdrop-orphanage.md`](../research/onboarding-airdrop-orphanage.md) | 4.6 |
| `social` | [`social-habitats-zora.md`](../research/social-habitats-zora.md) | 4.7 |
| `gateways` | [`chat-habitats-messaging.md`](../research/chat-habitats-messaging.md) | 3–4 |
| `mintConfiguration` | [`mint-configuration-wizard.md`](../research/mint-configuration-wizard.md) | 4.3 |
| Presets | [`presets/`](../manifest/presets/) | mint |

## Presets mint (plantillas incompletas)

| Archivo | Runtime | Chat default |
|---------|---------|--------------|
| [`presets/lab-hermes.json`](../manifest/presets/lab-hermes.json) | hermes-agent | Telegram |
| [`presets/openclaw.json`](../manifest/presets/openclaw.json) | openclaw | configurable |

Completar `identity` + `treasury` tras mint onchain.


1. **Público vs privado** — nunca PII, emails, ni credenciales manguera en manifiesto pinado
2. **Servicios x402 en mainnet** — cerebro/memoria pueden usar `eip155:8453` aunque NFT esté en Sepolia
3. **Al transferir** — manifiesto no cambia; solo `ownerOf`
4. **Actualizar órgano** — `setAgentURI` + Doctor; incrementar `updatedAt`

## Validación (Fase 1)

```bash
# Próximo script
node scripts/validate-manifest.mjs docs/manifest/examples/minimal.json
```

## Campos obligatorios v1 provisional

```
type, name, identity, treasury, organs, budget
organs.brain, organs.memory, organs.reflexes
budget.minOperatingBalanceUsdc, budget.organs, budget.global
```

Ver [`development-roadmap.md`](../architecture/development-roadmap.md) para cuándo implementar cada bloque en runtime.
