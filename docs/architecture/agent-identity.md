# Identidad del agente — ¿Hermes u otro?

> **Alcance:** ageNFT es un proyecto **independiente** de Star Atlas.
> SA es una aplicación opcional futura. Esta doc responde: ¿quién es el agente
> dentro del paquete ageNFT genérico?
>
> Última revisión: 2026-07-12

---

## Alcance ageNFT (sin SA)

```
ageNFT (proyecto core)
    │
    │  identidad + TBA + memoria + runtime + economía
    │
    └── aplicaciones opcionales (después)
            ├── Star Atlas      ← otro repo, otro día
            ├── trading
            └── ...
```

La identidad del agente se define **a nivel protocolo**, no atada a un juego.

---

## Las capas del agente (genérico)

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 3 — DOMINIO        (opcional, plug-in)            │
│  Star Atlas, DeFi, consultoría, generalista…            │
├─────────────────────────────────────────────────────────┤
│  CAPA 2 — PERSONA        El "ser" del ageNFT            │
│  Nombre, memoria, personalidad, skills                  │
├─────────────────────────────────────────────────────────┤
│  CAPA 1 — RUNTIME        Motor de ejecución             │
│  Hermes Agent, OpenClaw, runtime propio…                │
└─────────────────────────────────────────────────────────┘
```

Un **ageNFT** empaqueta **Capa 2 + NFT + TBA + memoria**.
Capa 1 = intercambiable. Capa 3 = opcional, módulos después.

---

## ¿El ageNFT puede ser Hermes?

Pregunta en contexto **ageNFT puro** (no Star Atlas):

| Interpretación de "Hermes" | ¿Puede ser el agente? | ¿Permiso Nous? |
|----------------------------|------------------------|----------------|
| **Hermes Agent** (runtime OSS, MIT) | ✅ Sí — motor del ageNFT | **No** — uso, modificación y comercial OK |
| **Fork/custom encima de Hermes** | ✅ Sí | **No** — incluir aviso MIT al redistribuir código |
| **Producto llamado "Hermes ageNFT"** | ⚠️ Legalmente OK (MIT) | Evitar confusión de **marca** con Nous |
| **"Oficial Nous" / endorsement** | ❌ Sin acuerdo | **Sí** — es marketing, no licencia |

---

## ¿Crear agente propio vs usar Hermes?

| Opción | Descripción |
|--------|-------------|
| **A. ageNFT genérico + runtime Hermes** | Motor Nous, persona/nombre tuyo (puede no llamarse Hermes) |
| **B. Primera instancia llamada Hermes** | Nombre de persona; runtime Hermes u otro |
| **C. Identidad 100% original** | Nombre, prompt, runtime — cero dependencia de marca Nous |

**Recomendación para el protocolo ageNFT:**
- **Protocolo:** nombre neutro (`ageNFT`)
- **Instancias:** cada NFT con su persona (`Hermes`, `Aria`, `Unit-7`…)
- **Runtime:** Hermes Agent es **una opción**, no el producto

---

## Capa 1 — Runtime: Hermes Agent (Nous Research)

[Hermes Agent](https://github.com/NousResearch/hermes-agent) es el **runtime** — el motor de ejecución del agente (cron, gateway, skills, memoria, tools).

### Licencia: MIT — uso libre

```
Copyright (c) 2025 Nous Research
Licencia: MIT
```

**Sí, es código de uso público.** Puedes, sin pedir permiso a Nous:

| Acción | ¿Permitido? |
|--------|-------------|
| Usar el código | ✅ |
| Modificarlo | ✅ |
| Crear agente a medida encima | ✅ |
| Fork / integrar en ageNFT | ✅ |
| Uso comercial (vender ageNFT) | ✅ |
| Distribuir tu versión | ✅ |
| Sublicenciar | ✅ |

**Única obligación legal:** incluir el aviso de copyright y el texto MIT en copias o porciones sustanciales del código de Hermes que redistribuyas.

```text
Copyright (c) 2025 Nous Research
SPDX-License-Identifier: MIT
```

Fuente: [github.com/NousResearch/hermes-agent/LICENSE](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

### Qué NO implica la licencia MIT

| Tema | Detalle |
|------|---------|
| **Endorsement Nous** | No puedes decir "oficial de Nous" sin acuerdo — es **marca**, no copyright |
| **Nous Portal** | Servicio opcional de pago de Nous (modelos, Tool Gateway) — **no obligatorio** |
| **Marca "Hermes Agent"** | Evitar confusión en marketing; mejor "Built on Hermes Agent" o runtime propio |
| **Garantías** | MIT = "AS IS" — sin warranty |

### ageNFT + Hermes Agent — modelo limpio

```
ageNFT (tu producto, tu marca)
    │
    ├── contratos onchain (tuyos)
    ├── capa ageNFT (TBA, manifiesto, x402) — tuyo
    └── runtime: Hermes Agent (MIT) — motor OSS
            └── customización: skills, tools, prompts ageNFT — tuyos
```

**No necesitas permiso de Nous** para construir ageNFT sobre Hermes Agent. Es explícitamente lo que permite MIT.

Alternativas si quisieras cero dependencia de marca: runtime propio mínimo, OpenClaw, LangChain, etc. — pero **Hermes es válido legalmente**.

### Atribución recomendada (buena práctica)

En README / LICENSE de ageNFT:

```markdown
ageNFT includes or builds upon Hermes Agent
Copyright (c) 2025 Nous Research — MIT License
https://github.com/NousResearch/hermes-agent
```

---

## Capa 2 — Persona: la identidad del NFT

Lo que **viaja con el token** y define al ser:

- Nombre y descripción (`agentURI`)
- Memoria acumulada (IPFS/Arweave)
- Skills, reputación ERC-8004
- Especialización declarada (o generalista)

**Esto lo creas tú.** No requiere permiso de Nous ni de ATMTA ni de nadie.

Ejemplos de instancias ageNFT:
```
ageNFT #1  "Hermes"     — generalista, mensajero, multi-tool
ageNFT #42 "Kael"       — analista DeFi
ageNFT #99 "Pilot-UST"  — (si algún día) vertical SA
```

---

## Capa 3 — Dominio (opcional, incl. SA)

Módulos plug-in que añaden tools y memoria de dominio:

```json
{
  "plugins": [
    { "domain": "star-atlas", "enabled": false },
    { "domain": "hyperliquid", "enabled": false }
  ]
}
```

Star Atlas entra **aquí**, cuando exista. Ver [`star-atlas-vision.md`](star-atlas-vision.md) — doc de **aplicación opcional**, no core.

---

## Matriz de permisos (ageNFT genérico)

| Acción | ¿Permiso? |
|--------|-----------|
| Crear ageNFT con persona propia | No |
| Usar Hermes Agent OSS como runtime | No (licencia OSS) |
| Usar x402, ERC-8004, ERC-6551 | No (estándares abiertos) |
| Llamar instancia "Hermes" en privado | No |
| Producto comercial "Hermes" colisionando con Nous | Evitar |
| Usar marca/IP de terceros (juegos, etc.) | Sí |

---

## Decisión propuesta (core ageNFT)

```
Proyecto:     ageNFT (genérico, agnóstico)
MVP persona:  por definir — no atada a SA
Runtime MVP:  evaluar (Hermes Agent es candidato, no obligación)
SA:           aplicación futura en repo separado StarAtlas
```

---

## Relacionado

- Alcance proyecto → [`project-scope.md`](project-scope.md)
- SA como app opcional → [`star-atlas-vision.md`](star-atlas-vision.md)

---

## Notas (2026-07-12)

- Usuario aclaró: ageNFT ≠ Star Atlas. Pregunta Hermes era sobre ageNFT hipotético genérico.
- SA puede ser vertical futura; diseño core no debe asumir gaming.
