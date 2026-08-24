# Runtime adapters — Hermes, OpenClaw, ElizaOS

> **Estado:** Diseño · **Jul-2026**  
> Responde: ¿un ageNFT distinto por motor? ¿OpenClaw en lugar de Hermes?

---

## Respuesta corta

**No hace falta un ageNFT distinto por runtime.** El NFT es el **cuerpo** (TBA, manifiesto, órganos, memoria, biblioteca). El motor es un **órgano E1 intercambiable** — un campo en el manifiesto, no otro contrato ni otro estándar.

El owner **puede elegir** Hermes, OpenClaw o ElizaOS (futuro), pero:

| Fase | Motor recomendado | Por qué |
|------|-------------------|---------|
| **MVP hoy** | **Hermes** + `run-turn.mjs` | Telegram, cron Doctor, skill `agenft-core`, checklist 8/8 |
| **Próximo** | **OpenClaw** como adapter | Workspace dev, integraciones Cursor; llama al mismo `run-turn` |
| **Fase 5+** | **ElizaOS** opcional | Swap/bridge/ERC-8004 — no por x402 ni por cerebro base |

**Complejidad real:** mantener **N adapters delgados**, no reimplementar memoria/budget/TBA en cada motor.

---

## Arquitectura — capa protocolo vs motor

```
┌─────────────────────────────────────────────────────────────┐
│ ageNFT protocol (SIEMPRE igual, cualquier motor)              │
│  manifiesto · TBA · Reflejos · M1/M2/M3 · Biblioteca ·      │
│  saleConfigHash · Doctor · gateways policy                  │
└─────────────────────────────────────────────────────────────┘
                            │
                    runTurn()  ← API única (ya existe)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  HermesAdapter      OpenClawAdapter      ElizaOSAdapter
  skill + cron       skill / MCP / hook   plugin Fase 5
  Telegram gateway   Cursor workspace     swap/8004
```

**Regla:** un motor **activo** por instancia; **múltiples gateways** de chat en paralelo OK.

El manifiesto declara cuál corre hoy:

```json
{
  "runtime": {
    "engine": "hermes-agent",
    "engineVersion": ">=0.14",
    "hosting": { "primary": "local", "fallbacks": ["akash", "vps"] },
    "adapter": "agenft-run-turn/v1"
  }
}
```

Valores `engine` (schema): `hermes-agent` · `openclaw` · `elizaos` · `custom` · `minimal`.

---

## ¿Por qué NO es “un NFT muy diferente”?

| Pieza | ¿Cambia entre motores? |
|-------|------------------------|
| Contrato NFT + TBA | ❌ mismo |
| `agentURI` / manifiesto ageNFT/v1 | ❌ mismo schema |
| Cerebro x402, budget, Reflejos | ❌ mismo |
| Memoria V0/M1/M2/M3, Biblioteca B | ❌ mismo capas y políticas |
| `saleConfigHash`, trial, transfer | ❌ mismo |
| **Solo cambia** | `runtime.engine` + scripts instalación + credenciales gateway |

Analogía: mismo coche (NFT), motor gasolina o híbrido (Hermes/OpenClaw) — la carrocería y la matrícula no cambian.

Al **transferir**, el comprador puede **cambiar motor** en el wizard post-transfer (como reconfigurar Telegram) — no invalida el NFT.

---

## Comparativa de motores

| Criterio | Hermes | OpenClaw | ElizaOS |
|----------|--------|----------|---------|
| **Estado lab** | ✅ integrado | ⏳ candidato | ⏳ spike hecho |
| **Gateway Telegram/cron** | ✅ maduro | ⚠️ vía integración | ⚠️ plugins |
| **x402 + TBA 6551** | ✅ skill → `run-turn` | ✅ mismo path | ❌ gap AgentAccountV2 |
| **Budget / Reflejos** | ✅ en protocolo | ✅ en protocolo | ⚠️ reimplementar o bridge |
| **Memoria ageNFT** | ✅ skill prohibe memoria Hermes | ✅ mismo | ⚠️ adapter |
| **Workspace / IDE** | CLI | ✅ **Cursor nativo** | servidor Eliza |
| **Swap / bridge / CCTP** | skills limitados | ⏳ | ✅ plugin wallet |
| **ERC-8004** | ⏳ | ⏳ | ✅ SDK listo |
| **Post-transfer** | ⚠️ reinstalar skill | ⚠️ reconfig workspace | ⚠️ redeploy Eliza |

Spike Jul-2026: [`spike-web3-runtime-comparison.md`](../backups/spike-web3-runtime-comparison-20260713.md) — **run-once gana en x402**; Eliza gana en breadth Web3 si unificáis wallet model.

---

## OpenClaw — ¿en lugar de Hermes?

**No sustitución obligatoria** — **opción paralela** para perfiles distintos:

| Perfil owner | Motor natural |
|--------------|---------------|
| Quiere Telegram + cron + VPS sin IDE | **Hermes** |
| Vive en Cursor, automatiza repo, skills | **OpenClaw** |
| Gaming DeFi, multi-chain, 8004 | **ElizaOS** (más adelante) |
| Solo API web / dApp chat | **`minimal`** (`chat-api.mjs`) |

OpenClaw encaja con la tesis “wrapper con valor” (vídeo G Bascunana): ageNFT = protocolo; OpenClaw = **host** que ejecuta el protocolo.

**Adapter OpenClaw (diseño):**

1. Skill o regla que en mensajes del agente llame `run-turn` / `chat-api`.
2. No memoria nativa OpenClaw para datos del NFT — igual que Hermes.
3. `AGENTS.md` / rules apuntan a manifiesto + pack `unit-mainnet`.
4. Doctor: cron del sistema o automatización Cursor, no duplicar lógica.

**Ventaja:** el usuario que ya usa OpenClaw no instala Hermes.  
**Coste:** mantener segundo adapter + docs de instalación.

---

## ElizaOS — cuándo sí

Evaluar **solo si** necesitáis:

- AgentAccountV2 / spend policies distintas de TBA 6551
- Swap, bridge, CCTP masivo
- Registro ERC-8004 nativo en runtime

**No** migrar a Eliza solo por x402 — ya resuelto con TBA + `@x402/fetch` + Reflejos.

Gap conocido: TBA ERC-6551 ≠ `AGENTWALLET_ACCOUNT_ADDRESS` de Eliza — hace falta adapter o contrato puente (Fase 5).

---

## Elección en mint vs post-mint

| Momento | Qué elige |
|---------|-----------|
| **Mint wizard** | `runtime.engine` default (Hermes recomendado MVP) |
| **Dashboard** | Cambiar motor (requiere reinstalar adapter; Doctor avisa) |
| **Post-transfer** | Nuevo owner elige motor en wizard mudanza |
| **Trial** | Motor del vendedor **no** es lo que se vende — se vende manifiesto + memoria/biblioteca; el comprador monta su motor |

En trial: lo relevante es `saleConfigHash` (órganos, memoria, biblioteca), no si el vendedor usaba Hermes en su laptop.

---

## Complejidad — ¿demasiado para el producto?

| Enfoque | Complejidad | Veredicto |
|---------|-------------|-----------|
| **Un motor forever (Hermes)** | Baja | OK para MVP cerrado |
| **Protocolo + 2 adapters (Hermes + OpenClaw)** | Media | ✅ **recomendado** — mismo NFT, dos hosts |
| **3 motores + paridad feature** | Alta | ❌ postergar Eliza hasta Fase 5 |
| **NFT distinto por motor** | Muy alta | ❌ **no hacer** — antipatrón |

**Principio:** toda lógica “ageNFT” vive en `run-turn.mjs` y módulos `runtime/src/*`. Los motores son **thin wrappers**.

Checklist adapter nuevo:

- [ ] Invoca `runTurn()` sin bypass de budget
- [ ] No usa memoria nativa del motor
- [ ] Lee manifiesto + pack del NFT
- [ ] Doctor probe compatible
- [ ] Doc instalación 1 página

---

## Manifiesto — presets (mint wizard)

| Preset | `runtime.engine` | Gateways default |
|--------|------------------|------------------|
| **Hermes Telegram** | `hermes-agent` | Telegram ☑ |
| **OpenClaw dev** | `openclaw` | web + opcional Telegram |
| **Minimal API** | `minimal` | chat-api / dApp |
| **Eliza advanced** | `elizaos` | configurable (Fase 5) |

Fuente UX borrador: [`mint-configuration-wizard.md`](../backups/mint-configuration-wizard.md).

---

## Decisión Jul-2026

1. **MVP:** Hermes + `run-turn` — no cambiar.
2. **Documentar** OpenClaw como segundo adapter — no bloquea MVP.
3. **ElizaOS** — decisión abierta Fase 5; spike ya hecho.
4. **Un solo tipo de NFT** — `runtime.engine` es preferencia del owner, no taxonomía de contrato.
5. **Transfer:** motor es infra del operador (como VPS); memoria/biblioteca siguen políticas ya definidas.

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Runtime local vs hospedado |
| [`memory-layers-access.md`](memory-layers-access.md) | Qué viaja en venta |
| [`library-storage-policy.md`](library-storage-policy.md) | Biblioteca separada |
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Fila E1 Runtime |
| [`lab/spike-web3-runtime-comparison`](../backups/spike-web3-runtime-comparison-20260713.md) | Spike Hermes/Eliza |
