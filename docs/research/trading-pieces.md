# Piezas de trading — AgeNFT (cableables, no cableadas)

> **Estado:** 📐 diseño + preview local · **2026-09-18**  
> **No cablear** a TBA / `hands.enabled` todavía. Trading sigue **opt-in, último recurso**, bloque 7.7.

El dashboard de estrategias (repo `TRADING` en Mint) y el visor-dragón son **piezas plug & play**: Organ Studio / el manifiesto podrán enchufarlas cuando el cuerpo esté listo. Hasta entonces viven en local y no mueven dinero del ageNFT.

---

## Metáfora

| En el mercado | En el cuerpo ageNFT |
|---------------|---------------------|
| Estrategia guardada | Política del órgano **Manos** (`hands`) |
| Bot que ejecuta la activa | Runtime + Reflejos (cap `riskPct`) |
| Liquidez = **alimento** | Oportunidad que el cuerpo puede o no cazar |
| Dragón que busca comida | Visor de **olfato de mercado** (no opera) |
| TBA | Estómago — solo come del bucket **risk**, nunca de operating |

**Regla:** el dragón **mira**. Las manos **solo actúan** si el owner enchufa la pieza y el bucket de riesgo tiene saldo. Sin cable = teatro + laboratorio.

---

## Dos piezas (independientes)

```
                    ┌─────────────────────────┐
                    │  ageNFT manifiesto      │
                    │  organs.hands.enabled[] │  ← vacío hoy
                    │  treasury.riskPct = 5%  │
                    └───────────┬─────────────┘
                                │  (cable futuro)
           ┌────────────────────┼────────────────────┐
           ▼                                         ▼
┌──────────────────────┐                 ┌─────────────────────────┐
│ trading-strategies   │                 │ dragon-liquidity        │
│ Biblioteca + YAML    │                 │ Visor: dragón caza      │
│ GET /api/active      │                 │ liquidez-alimento       │
│ Hábitat: política    │                 │ Hábitat: visión         │
└──────────────────────┘                 └─────────────────────────┘
           │                                         │
           └──────────── se pueden enchufar ─────────┘
                         juntas o por separado
```

| Pieza | Repo | UI local | Contrato HTTP | Órgano destino | ¿Opera? |
|-------|------|----------|---------------|----------------|---------|
| `trading-strategies/v1` | `TRADING` | `/` | `/api/active/bundle` | `hands` (política) | No. Solo emite spec. |
| `dragon-liquidity/v0` | `TRADING` | `/dragon/` | `/api/dragon/feed` | `senses` (visión) + opcional `hands` | No. Feed sintético hoy. |

Manifiestos en el repo trading: `pieces/*.json`. Listado vivo: `GET http://127.0.0.1:8788/api/pieces`.

---

## Cómo se cablearía (cuando toque)

1. Owner opt-in en Dashboard ⚙️ → Economía → **Trading**.
2. `organs.hands.enabled` incluye `"trading-hl"` (nombre estable, no inventar otro órgano).
3. Runtime lee la estrategia **activa** (`load_active` / `/api/active/bundle`).
4. Reflejos: `budget.organs.hands.limits.perDay` + `treasury.buckets.riskPct`.
5. Doctor Vitality: si no hay SL / si el pack es mainnet sin `manage_only` → no arranca.
6. El visor-dragón es **opcional**: si está enchufado, el feed real sustituye el sintético; si no, el cuerpo opera a ciegas (no recomendado).

**No** mezclar con Scout de costes LLM ni con Voice x402. Comida de mercado ≠ leads sociales.

Borrador de manifiesto (no aplicar a Unit-Mainnet):

```json
{
  "organs": {
    "hands": {
      "enabled": [],
      "dex": "hyperliquid",
      "pieces": {
        "policy": { "id": "trading-strategies", "href": "http://127.0.0.1:8788/api/active/bundle" },
        "vision": { "id": "dragon-liquidity", "href": "http://127.0.0.1:8788/api/dragon/feed", "optional": true }
      }
    }
  },
  "treasury": {
    "income": { "optional": ["trading"] }
  }
}
```

`enabled: []` se queda así hasta flag humana.

---

## Qué espera (explícito)

- Liquidez **en tiempo real** (libro Hyperliquid, heatmaps, HIP-3).
- Cable runtime → TBA.
- Que el dragón dispare órdenes.

Hoy el visor **repite un mercado sintético** para afinar la metáfora visual.

---

## Docs hermanos

- Economía: [`self-funding.md`](self-funding.md) · Bloque 7.7
- Catálogo: [`organ-assembly-catalog.md`](organ-assembly-catalog.md) § Manos
- Taxonomía: [`pieces-taxonomy.md`](pieces-taxonomy.md)
- Organ Studio: [`organ-studio-visual.md`](organ-studio-visual.md)
- Lab trading (VPS): `~/Projects/TRADING` + Arnés `docs/trading.md`
