# Capas de memoria, acceso y trial — diseño fino

> **Estado:** Diseño · **Jul-2026**  
> Complementa [`memory-transfer-policy.md`](memory-transfer-policy.md).

---

## ¿Qué es PII?

**PII** = *Personally Identifiable Information* — en español, **datos personales identificables**.

| Ejemplo PII | ¿Por qué importa? |
|-------------|------------------|
| Nombre real, email, teléfono | Identifican a una persona |
| Dirección, DNI, cuenta bancaria | Sensibles / legales |
| “Mi hijo Pedro va al colegio X” | Inferencia directa |
| Historial médico, opiniones íntimas | Privacidad |

En ageNFT: si un delta de memoria contiene PII del **owner**, no debe llegar a un tercero (alquiler) ni al comprador salvo política **full** explícita.

**No es PII:** “URUIRU sabe explicar qué es un Gespenster” (capacidad aprendida, no identifica a nadie).

**No es la Biblioteca:** archivos PDF, corpus RAG y documentos de consulta viven en capa **B** aparte — ver [`library-storage-policy.md`](library-storage-policy.md).

---

## Cuatro capas (clasificar desde el primer aprendizaje)

Cada pieza de memoria se **etiqueta al guardarse** — no al transferir en urgencia.

```
┌──────────────────────────────────────────────────────────────┐
│ V0 — VAULT (nunca terceros / nunca onchain público)          │
│  passwords, API keys, tokens, manguera, notas owner privadas │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ M1 — CANON (siempre con el NFT)                              │
│  soul, URUIRU, skills base, manifiesto público, Reflejos     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ M2 — PERSONAL (vivencias del owner / PII / contexto privado) │
│  “Ayer hablé con mi hermana de…” · datos identificables      │
│  → ALQUILER: oculto · VENTA: full | reset | archivo          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ M3 — CAPABILITY (herramientas y saber aprendido, NO personal)│
│  “Sé OCR en carteles” · procedimientos reutilizables        │
│  → VENTA: viaja por defecto en capability-only — PERO el     │
│    vendedor puede **excluir capacidades concretas** (curación)│
└──────────────────────────────────────────────────────────────┘
```

### Matiz clave (tu idea)

| Alquilar / servicio puntual | Quitar | Mantener |
|---------------------------|--------|----------|
| Tercero usa el agente | M2 personal, V0 | M1 canon, **M3** (salvo caps bloqueadas por owner) |

El inquilino usa un **URUIRU competente**, no lee el diario del owner.

### Curación M3 — excluir capacidades al vender

No todo M3 debe viajar siempre. El owner puede **quitar habilidades concretas** antes de transfer/trial — por reputación, legalidad o preferencia.

| Caso | Por qué excluir |
|------|-----------------|
| “Sabe explicar pentesting / hackear sistemas” | Comprador o autoridades podrían **asociar al vendedor** con actividad dudosa |
| Skills de nicho controvertido | Estigma, ToS marketplace |
| Capacidades obsoletas o erróneas | Higiene del producto vendido |

**No es censura del NFT en vida** — es **lista de exportación** al momento de la venta, como elegir qué carpetas llevas en una mudanza.

| Acción owner | Efecto |
|--------------|--------|
| Marcar capability `id` como **excluida de venta** | No entra en `saleConfigHash` ni en cápsula al comprador |
| Marcar `risk: sensitive` al aprender | Dashboard sugiere revisar antes de vender |
| **Purgar** antes de commit trial | Borrado irreversible de esa capability M3 (con confirmación) |

El comprador en trial ve **lista explícita** de capacidades incluidas — no sorpresas post-compra.

**Importante:** excluir M3 **no** borra M2 (diario) automáticamente; son decisiones separadas.

---

## Clasificación en tiempo real (al aprender)

En cada `autowrite` (futuro `memory-classifier`):

```json
{
  "delta": {
    "ts": "…",
    "layers": {
      "personal": false,
      "capability": true,
      "pii": false
    },
    "tags": ["ocr", "gespenster", "skill"],
    "capabilityId": "cap-ocr-carteles-v1",
    "risk": "none",
    "exportable": true,
    "user": "…",
    "assistant": "…"
  }
}
```

| Quién clasifica | Cuándo |
|-----------------|--------|
| Reglas + heurísticas | Siempre (rápido) |
| Cerebro (prompt fijo) | Si ambiguo |
| Doctor Hygiene | Auditoría / corrección + flag `risk: sensitive` |
| Owner | Override en Dashboard; **excluir de venta** / purgar |

Valores `risk` sugeridos: `none` · `sensitive` · `regulated` · `owner-only` (nunca exportable).

**Objetivo:** al reset, alquiler o venta → filtro por `layer`, no caos manual.

Doc futuro: `learning-system.md` (pendiente conversación).

---

## Modos de acceso (no solo venta)

| Modo | Quién usa | Ve M2 | Usa M3 | Ve V0 | Biblioteca |
|------|-----------|-------|--------|-------|------------|
| **Owner** | Dueño NFT | ✅ | ✅ | ✅ | completa (local + nube + pack) |
| **Rental / préstamo** | Tercero temporal | ❌ | ✅ | ❌ | solo B-pack incluido |
| **Servicio puntual** | Cliente x402 | ❌ | ✅ | ❌ | solo B-pack incluido |
| **Trial (prueba)** | Comprador potencial | ❌* | ✅ según config | ❌ | solo `libraryInclude` |
| **Post-compra** | Nuevo owner | según política | según política | su propio V0 | según política venta |

\* Trial: sin memoria personal del vendedor; capacidades y **biblioteca** de la config de prueba.

---

## Alquiler / préstamo — cómo hacerlo bien

### Principios

1. **Session scope** — acceso por tiempo o por N turnos; no es `transfer()`.
2. **Vista filtrada** — runtime carga M1+M3; M2 y V0 excluidos del contexto.
3. **Sin escribir en M2** — lo que diga el inquilino puede ir a buffer efímero o M3 anónimo (política).
4. **Reflejos activos** — caps estrictos; TBA del owner paga (o inquilino paga x402 aparte).
5. **Audit log** — owner ve qué usó el tercero (metadatos, no necesariamente texto íntimo del inquilino).

### Manifiesto (borrador)

```json
{
  "access": {
    "rental": {
      "enabled": false,
      "maxDurationHours": 24,
      "exposeLayers": ["M1", "M3"],
      "hideLayers": ["V0", "M2"],
      "allowWritePersonal": false
    }
  }
}
```

### Implementación gradual

| Fase | Entregable |
|------|------------|
| R0 | Este doc + capas en schema |
| R1 | Filtro preloadContext por modo |
| R2 | Session key temporal (sin transfer NFT) |
| R3 | Dashboard “Alquilar” + audit |

---

## Trial → compra — configuración fijada e inmutable

### Problema

El comprador prueba un ageNFT y teme que, al comprar, reciba **otro** (menos capacidades, otro cerebro, memoria distinta).

### Solución de diseño

1. **Antes del trial**, el vendedor publica una **configuración de venta** concreta (manifiesto snapshot + capas memoria + órganos ON/OFF + **lista M3 incluidas/excluidas** + **biblioteca incluida** `libraryInclude`).
2. Se calcula **`saleConfigHash`** = hash canónico de esa config.
3. Se registra **onchain** (evento o campo en contrato AgeNFT v2):

```solidity
// Esbozo conceptual
event SaleOfferCommitted(
  uint256 indexed tokenId,
  bytes32 saleConfigHash,
  MemoryPolicy memoryPolicy,  // full | reset | capability-only
  uint64 trialEndsAt
);
```

4. **Durante trial**: el agente corre **exactamente** esa config — auditable en Dashboard (“modo prueba”).
5. **Al comprar** (`transfer`): el contrato o checklist exige que el estado entregado coincide con `saleConfigHash` — **ni más ni menos**.
6. **Irreversible para el vendedor** tras commit: no puede bajar tier/cerebro acordado sin cancelar la oferta y abrir otra (nuevo hash).

### Transparencia (obligatoria)

| UI / doc | Contenido |
|----------|-----------|
| Dashboard vendedor | “Estás fijando config de venta — **irreversible** tras commit” |
| Dashboard comprador trial | “Ves config hash 0xabc… — compra incluye **exactamente** esto” |
| Alertas | Lista checkbox: órganos, memoria policy, **biblioteca** (docs IPFS vs local/nube), TBA saldo **no** incluido en hash si no se pacta |
| `transfer.html` + marketplace | Badge trial + enlace explorer al evento |

### Errores del vendedor

- **Antes de commit:** puede corregir libremente.
- **Tras commit, antes de venta:** solo cancelar oferta (evento `SaleOfferCancelled`) — no mentir en trial.
- **Tras venta:** transfer ejecuta lo acordado; disputas = prueba onchain.

**Máxima claridad > perfección** — el comprador confía en el hash, no en la palabra.

---

## Políticas de memoria en venta (resumen)

| Política | M2 personal | M3 capability | M1 canon |
|----------|-------------|---------------|----------|
| **full** | ✅ | ✅ (todas exportables) | ✅ |
| **reset-total** | ❌ | ❌ | ✅ |
| **capability-only** | ❌ | ✅ **lista curada** | ✅ |
| **capability-curated** | ❌ | ✅ solo IDs en allowlist | ✅ |
| **rental-session** | ❌ | ✅ (uso; respeta bloqueos owner) | ✅ |

`capability-only` = sin diario; **todas** las M3 exportables salvo las que marques excluidas.  
`capability-curated` = el hash de venta incluye **allowlist explícita** de `capabilityId` — máxima transparencia para el comprador.

### Ejemplo allowlist en oferta de venta

```json
{
  "saleMemory": {
    "policy": "capability-curated",
    "m3Include": ["cap-ocr-carteles-v1", "cap-gespenster-curador-v1"],
    "m3Exclude": ["cap-pentest-overview-v1"],
    "m3ExcludeReason": "seller-reputation — no incluida en esta venta"
  }
}
```

El comprador ve: *“Este URUIRU incluye OCR y curaduría Gespenster. No incluye pentesting.”*

---

## Checklist producto (construir con esto claro)

- [ ] `capabilityId` + `risk` + `exportable` en cada delta M3
- [ ] Dashboard: curar M3 antes de venta / trial (checkbox + purgar)
- [ ] `m3Include` / `m3Exclude` dentro de `saleConfigHash`
- [ ] Classifier en autowrite (v1 reglas)
- [ ] preloadContext respeta modo (owner | rental | trial | public)
- [ ] `saleConfigHash` en contrato o evento indexer
- [ ] Dashboard trial vs sale audit
- [ ] Hygiene audita clasificación errónea
- [ ] Textos legales / disclaimers en transfer + trial

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`memory-transfer-policy.md`](memory-transfer-policy.md) | Reset vs full |
| [`library-storage-policy.md`](library-storage-policy.md) | Docs consulta, IPFS/local/nube |
| [`voice-external-income.md`](voice-external-income.md) | Servicio puntual x402 |
| [`dual-doctor.md`](dual-doctor.md) | Hygiene clasifica fugas |
| [`owner-dashboard.md`](owner-dashboard.md) | Trial + rental UI |
