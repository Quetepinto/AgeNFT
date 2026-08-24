# Organ Studio — control visual plug & play

> **Estado:** Visión medio-largo plazo · **Jul-2026**  
> Complementa el [Dashboard](owner-dashboard.md) (formularios y gastos) con una **vista de cuerpo** — conectar órganos, ver salud, soñar configuraciones.

---

## La idea en criollo

Hoy el manifiesto es JSON y el Dashboard será listas y toggles. **Organ Studio** sería un **entorno visual sencillo**: ves tu ageNFT como un **diagrama de cuerpo** — cerebro, memoria, chat, sentidos, doctores… — y conectas o desconectas piezas **arrastrando**, sin tocar archivos.

**Plug & play:** encender un órgano = elegir proveedor (tier G/D/E) y que el runtime + Doctor lo **provisionen** solos.

**No es lo mismo que el Dashboard:**

| Dashboard ⚙️ | Organ Studio 🎛️ (nombre provisional) |
|--------------|--------------------------------------|
| Gastos, TBA, caps, legal | **Mapa vivo** del cuerpo |
| Formularios por sección | **Nodos + cables** entre órganos |
| Owner administra | Owner **ve y cablea** relaciones |
| MVP cercano (dApp settings) | Medio-largo plazo, más “soñar” |

Ambos accesibles desde el mismo hábitat; Studio puede ser pestaña **“Cuerpo”** junto a **“Ajustes”**.

---

## Qué verías en pantalla (mock mental)

```
        ┌─────────┐
        │ Cerebro │──x402──┐
        └────┬────┘        │
             │             ▼
        ┌────▼────┐   ┌─────────┐     ┌──────────┐
        │ Runtime │──►│ Memoria │────►│ Biblioteca│
        │ Hermes  │   │ toju    │     │ IPFS     │
        └────┬────┘   └─────────┘     └──────────┘
             │
    ┌────────┼────────┬──────────┐
    ▼        ▼        ▼          ▼
Telegram  Sentidos  Presencia  Doctor Qi
 (verde)   (gris)   (apagado)  (pulso)
```

- **Color / pulso** = Vitality (Qi): vivo, dormido, enfermo.
- **Clic en nodo** = panel lateral: tier, fallback, coste estimado.
- **Cable roto** = Hygiene bloqueó conexión insegura.
- **Arrastrar** nuevo gateway desde paleta → Doctor pregunta credenciales (V0).

---

## ¿Existe algo parecido?

| Producto / patrón | Qué hace | Qué le falta para ageNFT |
|-------------------|----------|-------------------------|
| **Node-RED**, **n8n** | Flujos visuales nodos | No NFT, TBA, órganos onchain, Doctores |
| **Langflow / Flowise** | Cadenas LLM visuales | Solo cerebro; no cuerpo completo |
| **Home Assistant** | UI dispositivos + automatización | Domótica, no agente transferible |
| **Grafana / Datadog** | Métricas y alertas | Observabilidad, no cableado |
| **Docker Desktop** | Contenedores ON/OFF | Infra genérica, no manifiesto ageNFT |
| **React Flow / Rete.js** | Librerías UI grafo | **Motor de UI**, no producto agente |
| **Mint wizard** (borrador) | Formulario al nacer | Una vez; no vida continua del cuerpo |

**Hueco:** ninguno une **NFT + TBA + órganos + tiers + dos Doctores + transfer** en un **studio visual** para el owner no técnico.

ageNFT podría ser el **primer “IDE del cuerpo digital”** — open source, manifiesto como fuente de verdad, vista grafo como proyección.

---

## Funciones soñadas (por fase)

| Fase | Función | Estado |
|------|---------|--------|
| **S0** | Leer manifiesto → diagrama estático (solo ver) | 💡 |
| **S1** | ON/OFF órgano + tier G/D/E desde nodo | 💡 |
| **S2** | Arrastrar fallback (segundo cerebro, segundo storage) | 💡 |
| **S3** | Simulación “¿cuánto cuesta este cuerpo?” antes de aplicar | 💡 |
| **S4** | Doctor preview: “si conectas tier E, Hygiene pide consentimiento” | 💡 |
| **S5** | Export/import **preset** de cuerpo (plantilla Gespenster, gaming…) | 💡 |
| **S6** | Modo **trial/venta**: vista comprador — qué órganos incluye el hash | 💡 |

**Plug & play técnico (debajo):**

1. Cambio en Studio → diff manifiesto → owner firma `setAgentURI` o tx batch.
2. Doctor Vitality aplica: despliega gateway, sync memoria, probe cerebro.
3. Hygiene audita antes de commit si hay tier E o gateway nuevo.

---

## Modelo de datos (borrador)

Vista grafo **no sustituye** manifiesto — es proyección:

```json
{
  "organStudio": {
    "layout": "agenft-organ-graph/v1",
    "nodes": [
      { "id": "brain", "organ": "brain", "x": 120, "y": 40, "status": "alive" },
      { "id": "memory", "organ": "memory", "x": 120, "y": 140, "status": "alive" }
    ],
    "edges": [
      { "from": "runtime", "to": "brain", "kind": "invokes" },
      { "from": "brain", "to": "memory", "kind": "readwrite" }
    ]
  }
}
```

`layout` puede vivir offchain (IPFS) — no crítico onchain. Lo crítico sigue siendo `organs` en ageNFT/v1.

---

## Relación con otras piezas

| Pieza | Enlace |
|-------|--------|
| Dashboard | Pestaña hermana; números y legal |
| Doctores | Colores del grafo = probes |
| Mint wizard | Plantilla inicial del grafo al nacer |
| Transfer wizard | Post-compra: grafo “vacío” → rellenar hosting |
| Cross-chain | Nodo “cadena nativa” + satélites — ver [`cross-chain-agent-migration.md`](cross-chain-agent-migration.md) |
| Taxonomía | [`pieces-taxonomy.md`](pieces-taxonomy.md) |

---

## Riesgos / límites

| Riesgo | Mitigación |
|--------|------------|
| UI bonita, manifiesto desincronizado | Single source: commit solo vía Doctor + diff |
| Demasiado complejo para usuario casual | Modo **Simple** (solo toggles) vs **Studio** (grafo) |
| Mantener editor grafo caro | S1 estático; interactividad incremental |
| Parecer “no-code scam” | Open source + hash manifiesto auditable |

---

## Preguntas abiertas

- [ ] ¿Web dApp (React Flow) o desktop (Tauri) para Studio?
- [ ] ¿Preset “URUIRU mínimo” vs “URUIRU completo” en un clic?
- [ ] ¿Integrar con Canvas/mapas que ya tenemos?

---

*Idea usuario Jul-2026 — clasificar primero, implementar cuando Dashboard v1 exista.*
