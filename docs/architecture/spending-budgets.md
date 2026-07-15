# Gastos y límites por órgano — presupuesto del cuerpo

> Cómo el ageNFT calcula costes, impone límites por órgano de pago,
> y evita que un bucle o un órgano caído vacíe la TBA.
>
> Complementa: [`economics.md`](economics.md), [`brain-routing.md`](brain-routing.md), [`digital-body.md`](digital-body.md)
>
> Última revisión: 2026-07-12

---

## Idea central

Cada órgano **de pago** tiene:

1. **Tarifa unitaria** (por request, por GB-día, por hora…)
2. **Contador** (gasto acumulado en ventana: hora / día / mes)
3. **Límite** (`cap`) configurable en manifiesto — owner puede override
4. **Acción al superar** — degradar, dormir, alertar owner, failover barato

```
TBA (USDC + tokens satélite)
        │
        ▼
┌───────────────────┐
│  🛡️ Reflejos       │  ← límites globales + buckets
│  (policy engine)  │
└─────────┬─────────┘
          │
    ┌─────┼─────┬─────────┬──────────┐
    ▼     ▼     ▼         ▼          ▼
  🧠    💾    🏃        🔍        🔒
Cerebro Memoria Runtime  Olfato   Nym/…
```

**Manguera del owner** no cuenta contra TBA — tiene límites **aparte** (config owner).

---

## Dos capas de enforcement

| Capa | Dónde | Qué garantiza |
|------|-------|---------------|
| **Dura (onchain)** | Session keys ERC-4337, subaccounts Agent-NFT | Techo criptográfico: no firmar por encima de X USDC/día |
| **Blanda (runtime)** | Hermes + Reflejos | Contadores por órgano, router elige fuente barata, Doctor degrada |

MVP: **runtime + manifiesto** suficiente. Fase 2: session keys onchain alineadas con mismos caps.

---

## Buckets de tesorería (global)

Antes de límites por órgano, la TBA se reparte **mentalmente** (y opcionalmente en vaults):

| Bucket | % default | Uso | Regla |
|--------|-----------|-----|-------|
| **Operating** | 60% | Órganos vitales (cerebro, memoria, gas) | Intocable por trading |
| **Growth** | 25% | Mejor model, más storage, Akash upscale | Doctor puede gastar con cap |
| **Savings** | 10% | Yield, reserva | Solo con `allowDefi: true` |
| **Risk** | 5% | Trading, DeFi agresivo | Pérdida máx = este bucket |

**Saldo mínimo de supervivencia (`minOperatingBalance`):** si TBA &lt; umbral → modo **dormant** (solo lectura memoria).

---

## Órganos de pago — tarifas y límites default

Precios **validados o estimados** (2026-07). Actualizar con [`validation-results.md`](../research/validation-results.md).

### 🧠 Cerebro (LLM vía x402)

| Fuente | Coste unitario (ref.) | Unidad |
|--------|----------------------|--------|
| tx402.ai / minimax-m3 | **~$0.0015–0.003** | por request chat corto |
| tx402.ai / GLM-5.2 | **~$0.003–0.004** | por request |
| GPU-Bridge | variable | por inferencia |
| **Manguera** | $0 en TBA | owner paga OpenRouter/etc. |

**Contadores:** `requests`, `usdEstimated`

**Límites default (perfil conversacional):**

```json
"brain": {
  "limits": {
    "perHour": { "requests": 30, "usd": 0.15 },
    "perDay": { "requests": 200, "usd": 1.00 },
    "perMonth": { "usd": 25.00 }
  },
  "onCapExceeded": "degrade_to_cheapest_then_dormant"
}
```

**Al superar cap:** router → fuente oportunista/gratis → manguera (si owner autorizó) → **dormant**.

---

### 💾 Memoria (storage)

| Fuente | Coste unitario (ref.) | Unidad |
|--------|----------------------|--------|
| toju (x402 Base) | **~$0.01 mín.** + ~$3e-12/byte/día | por upload + duración |
| W3Stor | por upload x402 | por MB + graph ops |
| Arweave | **~$5–8 / GB** one-shot | permanente |
| Pin re-pin Doctor | = nuevo upload | al expirar TTL |

**Ejemplo toju:** 1 MB × 30 días ≈ orden **$0.01–0.05** (mínimos de red aplican).

**Límites default:**

```json
"memory": {
  "limits": {
    "perDay": { "usd": 0.20, "uploadsMb": 50 },
    "perMonth": { "usd": 5.00, "archivesGb": 1 }
  },
  "onCapExceeded": "stop_new_writes_keep_read"
}
```

---

### 🏃 Runtime (compute host)

| Fuente | Coste unitario (ref.) | Unidad |
|--------|----------------------|--------|
| Akash CPU | **~$0.5–3 / mes** | deployment pequeño 1 vCPU |
| VPS cripto | **~$5–10 / mes** | fallback |
| Hermes en mismo VPS | incluido en runtime | — |

**Límites:** más por **depósito mensual** que por request.

```json
"runtime": {
  "limits": {
    "perMonth": { "usd": 10.00, "akt": 50 }
  },
  "onCapExceeded": "no_upscale_alert_owner"
}
```

---

### 🔍 Olfato (scout)

| Coste | Notas |
|-------|-------|
| LLM barato para clasificar | ~$0.001 × N fuentes/día |
| HTTP scraping | casi $0 |
| Validación activa (probe x402) | ~$0.002 × M candidatos/día |

**Límites default:**

```json
"scout": {
  "limits": {
    "perDay": { "usd": 0.10, "probes": 20 }
  },
  "onCapExceeded": "pause_discovery"
}
```

---

### 🩺 Doctor (mantenimiento)

| Coste | Notas |
|-------|-------|
| Probes `no_agent` (Hermes cron) | **$0** |
| Cron LLM solo si fallo | ~$0.01–0.05 / incidente |
| Failover + setAgentURI | gas Base ~$0.001–0.01 |

```json
"doctor": {
  "limits": {
    "perDay": { "usd": 0.25, "transplants": 3 }
  },
  "onCapExceeded": "alert_owner_only_manual"
}
```

---

### 🔒 Privacidad (Nym, opcional)

| Coste (ref. blog Nym 2026) | ~225 NYM ≈ 25 GB / 7 días |
| Límite | `perWeek: { nym: 250 }` |

---

### ⛓️ Gas onchain (Base)

| Operación | Coste ref. |
|-----------|------------|
| Transfer, x402 settle | incluido en x402 |
| setAgentURI, mint | **~$0.001–0.05** |
| DeFi tx | variable |

```json
"gas": {
  "limits": { "perDay": { "usd": 0.50 } }
}
```

---

### 🔌 Manguera (owner — no TBA)

Límites **del owner**, no del agente:

```json
"hose": {
  "ownerLimits": {
    "perDay": { "requests": 100 },
    "allowedModels": ["openrouter/*"]
  },
  "countsAgainstTba": false
}
```

---

## Perfiles de configuración — estimación mensual

Calculadora simplificada: **suma órganos × uso asumido**.

### Perfil A — Dormido / coleccionable

| Órgano | Uso | USD/mes |
|--------|-----|---------|
| Cerebro | 0 req | $0 |
| Memoria | pin existente | ~$0 |
| Runtime | off / mínimo | $0–1 |
| Gas | 0 | $0 |
| **Total** | | **$0–1** |

---

### Perfil B — Conversacional (1h/día owner)

| Órgano | Uso | USD/mes |
|--------|-----|---------|
| Cerebro | ~60 req/día × $0.002 | **~$3.6** |
| Memoria | 10 MB/mes pinning | **~$0.10** |
| Runtime | Akash micro | **~$2** |
| Scout | off | $0 |
| Doctor | probes only | **~$0.05** |
| Gas | ocasional | **~$0.10** |
| **Total** | | **~$6–8/mes** |

---

### Perfil C — Activo 24/7 (autonomía media)

| Órgano | Uso | USD/mes |
|--------|-----|---------|
| Cerebro | 500 req/día × $0.002 | **~$30** |
| Memoria | 100 MB + 1 snapshot AR | **~$2 + $0.50** |
| Runtime | Akash 2 vCPU | **~$5** |
| Scout | 10 probes/día | **~$1** |
| Doctor | 5 incidentes/mes | **~$0.25** |
| Gas | regular | **~$0.50** |
| **Total** | | **~$39–45/mes** |

---

### Perfil D — Autónomo + ingresos (objetivo Fase 2)

Igual que C + **voz x402** que ingresa ≥ gastos. Break-even cuando ingresos x402 ≥ **~$40/mes** (según tráfico propio).

---

## Fórmula estimador (manifiesto → USD/mes)

```
monthlyUsd =
  brain.requestsPerDay × 30 × brain.avgCostPerRequest
+ memory.newMbPerMonth × memory.costPerMbMonth
+ memory.arweaveGb × arCostPerGb
+ runtime.monthlyHostingUsd
+ scout.probesPerDay × 30 × scout.costPerProbe
+ doctor.incidentsPerMonth × doctor.costPerIncident
+ gas.txPerMonth × gas.avgCostPerTx
+ privacy.nymBundlesPerMonth × nym.costPerBundle
```

**`avgCostPerRequest`** lo actualiza el router según fuente real (x402 headers devuelven `estimatedCostUsd`).

El runtime puede exponer:

```
GET /budget/estimate  →  proyección 7d/30d según manifiesto + contadores
GET /budget/status    →  gasto por órgano vs cap en ventana actual
```

---

## Esquema manifiesto — `budget`

```json
{
  "budget": {
    "currency": "USD",
    "minOperatingBalanceUsdc": "5.00",
    "buckets": {
      "operatingPct": 60,
      "growthPct": 25,
      "savingsPct": 10,
      "riskPct": 5
    },
    "organs": {
      "brain": {
        "limits": {
          "perHour": { "requests": 30, "usd": 0.15 },
          "perDay": { "requests": 200, "usd": 1.00 }
        },
        "onCapExceeded": "degrade_to_cheapest_then_dormant",
        "assumptions": {
          "avgCostPerRequestUsd": 0.002
        }
      },
      "memory": {
        "limits": { "perDay": { "usd": 0.20 }, "perMonth": { "usd": 5.00 } },
        "onCapExceeded": "stop_new_writes_keep_read"
      },
      "runtime": {
        "limits": { "perMonth": { "usd": 10.00 } },
        "onCapExceeded": "no_upscale_alert_owner"
      },
      "scout": {
        "limits": { "perDay": { "usd": 0.10 } },
        "onCapExceeded": "pause_discovery"
      },
      "doctor": {
        "limits": { "perDay": { "transplants": 3, "usd": 0.25 } },
        "onCapExceeded": "alert_owner_only_manual"
      },
      "gas": {
        "limits": { "perDay": { "usd": 0.50 } }
      },
      "hose": {
        "countsAgainstTba": false,
        "ownerLimits": { "perDay": { "requests": 100 } }
      }
    },
    "global": {
      "perDayUsdHardCap": 2.00,
      "onGlobalCapExceeded": "dormant_except_doctor_probes"
    }
  }
}
```

---

## Flujo al pagar (cerebro x402 ejemplo)

```
1. Router elige fuente cerebro
2. Reflejos: ¿brain.day.usd + estimatedCost ≤ cap?
   NO → degradar o rechazar
   SÍ → continuar
3. x402 fetch firma desde TBA
4. Tras 200 OK: incrementar contador brain
5. Si ≥ 80% cap → alerta owner ("fiebre económica")
6. Si ≥ 100% cap → onCapExceeded
```

Contadores en **runtime** (SQLite/JSON); hash opcional en memoria para auditoría.

---

## Quién configura qué

| Parámetro | Quién | ¿Viaja con NFT? |
|-----------|-------|-----------------|
| Límites default manifiesto | Owner al mint / agente con policy | ✅ en agentURI |
| Override temporal | Owner (`ownerOf`) | ❌ runtime local |
| Manguera limits | Owner | ❌ |
| Caps onchain duros | Owner firma session key policy | ✅ en contrato |

Al **transferir** NFT: nuevo owner hereda manifiesto y caps; puede ajustar overrides.

---

## UI / UX para el owner

```
┌─────────────────────────────────────────────┐
│ ageNFT #42 — Presupuesto                    │
├─────────────────────────────────────────────┤
│ TBA: 12.40 USDC  │  Runway: ~18 días (est.) │
├─────────────────────────────────────────────┤
│ 🧠 Cerebro    $0.42 / $1.00 hoy  ████░░ 42% │
│ 💾 Memoria    $0.01 / $0.20 hoy  ░░░░░░  5% │
│ 🏃 Runtime    $2.10 / $10/mes  ██░░░░ 21% │
│ 🔍 Olfato     $0.00 / $0.10 hoy  ░░░░░░  0% │
├─────────────────────────────────────────────┤
│ Proyección 30d: ~$7.20 (perfil B detectado) │
│ [Editar límites] [Recargar TBA]             │
└─────────────────────────────────────────────┘
```

**Runway** = `operatingBalance / projectedDailyBurn`.

---

## Integración Doctor + Reflejos

| Evento | Doctor | Reflejos |
|--------|--------|----------|
| Órgano caído | Failover a fallback | — |
| Cap órgano alcanzado | Degradar; no bypass | Enforce |
| TBA &lt; minOperating | Modo dormant | Block pagos |
| Bucles LLM | — | Circuit breaker global |
| Scout propone API cara | Validar; no auto-aumentar cap | Block si &gt; cap |

---

## Decisiones abiertas

- [ ] Contadores onchain vs offchain
- [ ] Subaccounts Agent-NFT por órgano (PERM_PAY granular)
- [ ] Estimador en dApp vs solo runtime API
- [ ] Alertas: onchain event vs Telegram owner

---

## Referencias de precio

| Fuente | Dato |
|--------|------|
| tx402.ai probe 2026-07-12 | minimax ~$0.002565/request |
| toju quote API | mínimo ~$0.01 por operación pequeña |
| [`validation-results.md`](../research/validation-results.md) | Probes Fase 0 |
