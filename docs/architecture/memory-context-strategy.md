# Context vs Memory — estrategia y método Karpathy

> **Estado:** reflexión anotada · no implementado  
> **Origen:** conversación 2026-07-12 — experiencia previa con estructuras tipo Karpathy en agentes  
> **Relacionado:** [`digital-body.md`](digital-body.md), [`vims-exploration-loop.md`](../research/vims-exploration-loop.md)

---

## Problema que queremos resolver

Separar **Context** (estático) de **Memory** (experiencial) tiene sentido arquitectónico — VIMS lo hace (`AgentContextRegistry` vs `AgentMemory` / `.pixe`), ageNFT lo refleja con `staticHash` y `experientialHash`.

Pero en intentos anteriores con estructuras **tipo Karpathy** (carpetas markdown, `SOUL.md`, diarios, etc.) los resultados fueron mediocres por dos razones recurrentes:

1. **Cuesta “acordarse” de actualizar** — la memoria depende del humano o del LLM opt-in; deja de mantenerse en cuanto hay fricción.
2. **El agente no consulta lo guardado** — leer docs es tool opcional; el modelo responde sin RAG/preflight.

**Conclusión provisional:** Karpathy como **formato** puede servir; Karpathy como **protocolo de comportamiento** (confiar en que el agente lee/escribe solo) **no**.

---

## Mapa Karpathy → ageNFT

| Patrón Karpathy (informal) | Órgano ageNFT | Hash / puntero |
|----------------------------|---------------|----------------|
| `SOUL.md`, reglas de identidad | Context | `staticHash` |
| `skills.md`, tools, políticas | Context | `staticHash` |
| Preferencias de usuario | Context (categoría preference) | `staticHash` |
| Diario, sesiones, hechos nuevos | Memory | `experientialHash` |
| Consolidación periódica | Memory + Doctor | merge → nuevo hash |

VIMS equivalente: `skills.md` onchain vs capsule `.pixe` experiencial.

---

## Propuesta ageNFT (hipótesis — a reflexionar)

No otro folder de markdowns sin runtime. **Enforcement en el loader**, no disciplina del LLM:

```
1. PRELOAD   — context obligatorio en system prompt (soul + skills, tamaño acotado)
2. RETRIEVE  — memory obligatorio pre-inferencia (último L0 + top-k L1; resto bajo demanda)
3. INFER     — cerebro (x402 / Hermes)
4. AUTOWRITE — post-turn: delta automático → storage (toju / .pixe); sin “¿guardar?”
5. DOCTOR    — cron: consolidar deltas, comparar hashes onchain, alertar drift
```

### Tiers (inspirado en VIMS L0/L1/L2)

| Tier | Contenido | Cuándo va al prompt |
|------|-----------|---------------------|
| **L0** | Resumen ≤32 tokens-equivalent | Siempre |
| **L1** | Overview ≤128 tokens-equivalent | Casi siempre |
| **L2** | Contenido completo | Solo retrieval / tool |

### Reglas de diseño propuestas

- **Context:** poco, estable; humano edita solo soul/skills ocasionalmente.
- **Memory:** crece automático; humano casi nunca edita a mano.
- **Lectura:** runtime inyecta — el LLM no decide si leer.
- **Escritura:** runtime persiste post-turn — el LLM no decide si escribir.
- **Onchain:** hashes como señal de versión; Doctor detecta desincronización offchain.

---

## Plantilla pack (opcional, futuro)

```
agenft-pack/
  soul.md           → Context
  skills.md         → Context
  memory/
    latest.json     → experiential (auto)
    archive/        → cold
```

Útil como **convención legible por humanos**; el producto es el **ManifestLoader + políticas**, no la carpeta.

---

## Preguntas abiertas (para reflexionar)

- [ ] ¿Qué tamaño máximo de context preload (tokens) antes de partir en L1/L2?
- [ ] ¿Consolidación cada N turnos o por cron Doctor (15 min / diario)?
- [ ] ¿Memoria operacional en toju vs `.pixe` onchain vs híbrido?
- [x] **Lab jul-2026:** puntero offchain `remote-pointer.json` + cápsula; toju roto → `lab-remote` fallback
- [ ] ¿Cifrado offchain obligatorio para memory (privacidad manifiesto)?
- [ ] ¿Subaccount TBA con `PERM_MEMORY_WRITE` para autowrite sin owner EOA?
- [ ] ¿Cómo medir “el agente consultó memoria” en tests (telemetría runtime)?

---

## Decisión explícita pendiente

| Opción | Pros | Contras |
|--------|------|---------|
| **A. Karpathy pack + runtime estricto** | Familiar, legible, alineado con Hermes | Hay que implementar loader bien |
| **B. Solo manifiesto JSON** | Simple | Menos legible, mismo problema sin runtime |
| **C. Confiar en LLM + tools** | Menos código | Historial demuestra que falla |

**Inclinación provisional:** **A** — formato Karpathy mínimo (`soul.md`, `skills.md`) + **runtime que obliga** preload/autowrite/doctor.

---

## Referencias

- VIMS lab: `skills.md` + `.pixe` en Unit-1 (#115) — ver [`vims-exploration-loop.md`](../research/vims-exploration-loop.md)
- Manifiesto lab: [`unit-1-lab.json`](../manifest/examples/unit-1-lab.json)
- Roadmap Fase 2 memoria: [`development-roadmap.md`](development-roadmap.md)
