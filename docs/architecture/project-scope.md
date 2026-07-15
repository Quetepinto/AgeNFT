# Alcance del proyecto — ageNFT vs aplicaciones

> ageNFT es un **proyecto independiente**. Star Atlas, trading, etc. son
> **casos de uso opcionales**, no el núcleo del producto.

---

## Qué es ageNFT (el proyecto)

Un **protocolo/paquete genérico**:

```
ageNFT = NFT + TBA + memoria + runtime + economía autónoma
```

Agnóstico de dominio. Puede ser:
- Asistente generalista
- Analista de mercados
- Piloto de juego Web3
- Agente de trading
- Cualquier especialización

**El repo `/home/openclaw/projects/ageNFT` es la fuente de verdad del producto.**

---

## Qué NO es ageNFT

| Proyecto | Relación |
|----------|----------|
| **StarAtlas** | Proyecto **separado**. Posible **vertical/aplicación** futura |
| **trading-hyperliquid-v2** | Otro proyecto. Patrones reutilizables |
| **Hermes-Nemotron (SA ops)** | Instancia operativa en SA, no el producto ageNFT |

```
ageNFT (protocolo)
    │
    ├── aplicación opcional: Star Atlas  ← /projects/StarAtlas
    ├── aplicación opcional: trading     ← /projects/trading-hyperliquid-v2
    └── aplicación opcional: (cualquiera)
```

Star Atlas **no define** ageNFT. ageNFT **podría** usarse para jugar SA algún día — como podría usarse para otra cosa.

---

## Documentación por capas

| Capa | Docs | Notas |
|------|------|-------|
| **Core ageNFT** | design-principles, digital-body, economics, brain-routing, agent-identity, blockchain-comparison | Siempre relevante |
| **Aplicación gaming** | gaming-vertical.md | Vertical genérica Web3 |
| **Aplicación SA** | star-atlas-vision.md | **Opcional** — solo si se persigue integración SA |

Al diseñar el MVP, **priorizar core**. SA entra cuando el cuerpo base funcione.

---

## Implicación para identidad del agente

La pregunta "¿el agente puede ser Hermes?" se responde en contexto **ageNFT genérico**:

- **Runtime:** ¿Hermes Agent (Nous) u otro?
- **Persona:** ¿nombre Hermes u original?
- **Dominio:** generalista al inicio; SA después si aplica

Ver [`agent-identity.md`](agent-identity.md) — sección "Alcance ageNFT (sin SA)".

---

## Nota de alcance (2026-07-12)

Usuario aclaró: ageNFT es proyecto separado de SA. SA es hipótesis de aplicación futura, no dependencia del diseño core.
