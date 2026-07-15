# Colaboración entre ageNFT — sin subagentes

> **Decisión 2026-07-13:** Un NFT = un agente singular. Lo que otros frameworks hacen con subagentes, ageNFT lo hace con **otro ageNFT contratado**.  
> Última revisión: 2026-07-13

---

## Principio

| Enfoque ajeno (ej. Eliza swarm) | Enfoque ageNFT |
|--------------------------------|----------------|
| Subagente = mini-programa interno, sin NFT | Colaborador = **otro ageNFT** con cuerpo propio |
| Sin identidad vendible | Cada uno tiene imagen, memoria, cartera, reputación |
| Un solo dueño | Red de agentes poseídos o contratados |

**Metáfora:** no contratas un brazo fantasma dentro de tu cabeza; contratas a un **profesional con DNI** para una tarea.

---

## Modelo operativo

```
Unit-1 (principal)
    │
    ├── Tarea: investigar precios
    │     → Contrato con Unit-7 (scout)
    │     → Pago x402 o transfer USDC entre TBAs
    │     → Entrega informe → fin del contrato
    │
    └── Tarea: traducir
          → Contrato con Aria-NFT
          → Misma mecánica
```

Cada ageNFT sigue siendo **uno**: un motor (Hermes), un manifiesto, un tokenId.

---

## Piezas necesarias (infraestructura)

| Pieza | Descripción | Fase |
|-------|-------------|------|
| **Contrato de tarea** | JSON o onchain: qué, plazo, precio, entregable | 3–4 |
| **Pago entre agentes** | x402 (pago por uso) o transfer directo TBA→TBA | 3 |
| **Lista de colaboradores** | `collaborators` en manifiesto | 3 |
| **Reputación** | ERC-8004 (registro estándar) opcional Fase 4 — consultar nota antes de pagar | 4 |
| **Descubrimiento** | Directorio de ageNFT disponibles para contratar | 4–5 |

---

## Manifiesto — bloque `collaborators` (borrador)

```json
{
  "collaborators": {
    "mode": "contract",
    "policy": "owner-approval-above-usd",
    "maxBudgetUsdPerTask": "0.50",
    "trusted": [
      {
        "agentId": 7,
        "registry": "0xfE1ef66Ba95891d3cDf6FB83FE1444Bc3bB9FEeF",
        "role": "scout",
        "note": "Unit-7 — búsqueda de ofertas LLM"
      }
    ]
  }
}
```

- `mode: contract` — explícitamente **no** subagentes internos.
- `trusted` — allowlist; ampliar con ERC-8004 reputation cuando exista registro público.

---

## Runtime

- **Hermes** encaja: un agente por instancia, sin enjambre obligatorio.
- **Eliza** no es necesario para multi-agente si cada pieza es otro NFT.
- El motor principal **delega** vía HTTP/x402/A2A a otro ageNFT, no spawnea subagente.

---

## Relación con ERC-8004

| Sin ERC-8004 (Fase 2–3) | Con ERC-8004 (Fase 4+) |
|-------------------------|------------------------|
| Colaboración solo con allowlist manual | Buscar agentes en directorio público |
| Confianza = conoces al otro NFT | Confianza = nota onchain + historial |
| Suficiente para lab | Necesario para marketplace abierto |

→ Ver [`watchlist.md`](watchlist.md) § ERC-8004 timing.

---

## Implicación para elección de motor

**Hermes preferido** para MVP: no necesitamos subagentes de Eliza; necesitamos **contratos entre NFTs**.

Evaluar Eliza solo si en Fase 5 hace falta swap/bridge masivo o adapter alternativo — no por multi-agente.
