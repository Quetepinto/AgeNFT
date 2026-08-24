# Biblioteca — documentos de consulta y dónde viven

> **Estado:** Diseño · **Jul-2026**  
> Complementa [`memory-layers-access.md`](memory-layers-access.md) y [`memory-transfer-policy.md`](memory-transfer-policy.md).

---

## ¿Qué es la Biblioteca?

La **Biblioteca** no es el diario del agente (M2) ni las skills destiladas (M3). Son **archivos y documentos de referencia** que el agente consulta para hacer tareas:

| Ejemplo | Tipo |
|---------|------|
| PDF de normativa x402 | consulta puntual |
| Carpeta de briefs Gespenster | corpus RAG |
| Plantillas de contrato | herramienta + contexto |
| Fotos escaneadas para OCR | entrada de sentidos → archivo guardado |
| Notas del owner en Markdown | puede ser personal o técnico |

**Analogía:** M2/M3 = lo que el agente *recuerda haber vivido/aprendido*; Biblioteca = los *libros que tiene en la estantería* para abrir cuando trabaja.

---

## Tres sitios donde puede vivir un documento

El owner elige **por archivo** (no una sola opción global):

```
┌─────────────────────────────────────────────────────────────┐
│ B-pack — empaquetado con el NFT (IPFS / toju / Arweave)     │
│  Viaja si el vendedor lo incluye en la oferta de venta      │
│  Visible en trial si está en libraryInclude                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ B-local — disco del operador (data/library/, NAS, laptop)   │
│  No sale en transfer; desaparece para comprador/inquilino   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ B-cloud — nube privada del owner (Drive, S3, Notion export) │
│  Credenciales en V0; el archivo nunca viaja salvo re-pin    │
└─────────────────────────────────────────────────────────────┘
```

| Ubicación | Quién paga almacenamiento | ¿Viaja al vender? | ¿Disponible en alquiler/trial? |
|-----------|---------------------------|-------------------|--------------------------------|
| **B-pack** (IPFS pin) | TBA u owner (pin x402) | ✅ si `exportable` + en allowlist | ✅ si incluido en config trial |
| **B-local** | disco owner | ❌ | ❌ |
| **B-cloud** | cuenta SaaS owner | ❌ | ❌ |
| **B-canon** (soul, manifiesto) | repo / IPFS público | ✅ siempre (M1) | ✅ siempre |

**Sí, es opcional** — igual que M2 y la curación M3. El vendedor decide qué estantería empaqueta en la mudanza.

---

## ¿Estructura Karpathy para la Biblioteca?

**Recomendación: no** — al menos no como árbol de Markdown que el agente debe mantener al día.

| Enfoque Karpathy (típico) | Problema en la práctica |
|---------------------------|-------------------------|
| Muchos `.md` (`USER.md`, `MEMORY.md`, logs diarios…) | El LLM **olvida** actualizarlos o los deja incoherentes |
| El agente “lee si necesita” | Lectura **opt-in** → contexto stale sin que nadie lo note |
| Carpetas por tema que crecen solas | Difícil saber qué viaja en venta/trial; drift vs manifiesto |

Experiencia previa del proyecto (sesión 10): *las estructuras Karpathy fallan si dependen de update manual o lectura opt-in del LLM*.

### Qué sí usar en ageNFT

| Pieza | Modelo | Quién lo mantiene |
|-------|--------|-------------------|
| **M1 canon** (`soul.md`, `skills.md`) | Karpathy **lite** — 2 archivos cortos, casi estáticos | Humano / pack NFT |
| **M2/M3 experiencial** | `latest.json` + `deltas/` + clasificación | **Runtime** (`autowrite`, no el LLM libre) |
| **Biblioteca (B)** | **Índice JSON** + blobs (PDF, md, imágenes) por CID | Owner sube; runtime indexa; RAG consulta bajo demanda |

La Biblioteca no es “otra carpeta de notas que el agente edita”. Es un **catálogo de archivos** con metadatos (`id`, `storage`, `exportable`, `mime`) y contenido opaco. El agente **consulta** vía herramienta/RAG; no reorganiza la estantería en cada turno.

### Regla práctica

```
Si el dato debe estar siempre fresco     → runtime autowrite (M2/M3)
Si es identidad estable                  → soul/skills (M1), pocos KB
Si es documento de referencia            → Biblioteca: archivo + índice, sin estructura Karpathy
Si el agente “debería acordarse de escribir un .md” → diseño frágil; evitar
```

Hermes puede seguir leyendo `AGENTS.md` en el **workdir del repo** (desarrollo); eso no forma parte de la Biblioteca transferible del NFT.

---

## Separación en trial (prueba antes de comprar)

El trial no debe mezclar la biblioteca privada del vendedor con lo que el comprador cree que compra.

| Modo trial | Biblioteca efectiva |
|------------|---------------------|
| **trial-sale** | Solo entradas en `libraryInclude` del `saleConfigHash` |
| **rental** | Igual: solo B-pack exportable; B-local y B-cloud **inaccesibles** |
| **owner** | Biblioteca completa (local + cloud + pack) |

El runtime en trial carga un **índice filtrado** — no intenta leer rutas locales ni APIs cloud del vendedor.

### Transparencia obligatoria (UI)

| Pantalla | Muestra |
|----------|---------|
| Vendedor (commit oferta) | “Incluyes **7 docs** (12 MB IPFS). **23 docs** quedan en tu máquina/nube.” |
| Comprador (trial) | Lista por título + hash CID + tamaño; badge **“Sin biblioteca privada del vendedor”** |
| Post-compra | Misma lista que en trial — `libraryHash` ⊆ `saleConfigHash` |

**Lo probado = lo comprado** — si en trial el agente citó un PDF, ese PDF debe estar en `libraryInclude`.

---

## Relación Biblioteca ↔ M3 (capacidades)

Un documento puede generar **capacidad aprendida** (M3) sin que el archivo viaje:

| Situación | Archivo | Skill M3 |
|-----------|---------|----------|
| Owner estudió un manual local | B-local, no exportable | M3 “sé resumir manual X” — puede excluirse en venta |
| Corpus Gespenster en IPFS | B-pack, exportable | M3 + archivo viajan juntos en oferta |
| Contratos confidenciales Drive | B-cloud | M3 derivada **debería** marcarse `risk: sensitive` y excluirse |

Campo de enlace: `derivedFromLibraryId` en delta M3 → Dashboard avisa: *“Esta skill viene de un doc que no exportas — el comprador tendrá la skill sin el PDF.”* (decisión consciente del vendedor).

---

## Schema manifiesto (borrador)

```json
{
  "library": {
    "format": "agenft-library-index/v1",
    "entries": [
      {
        "id": "lib-gespenster-briefs",
        "title": "Briefs curaduría Gespenster",
        "mime": "application/pdf",
        "storage": "ipfs",
        "uri": "ipfs://bafybei…",
        "bytes": 2400000,
        "exportable": true,
        "visibility": "sale-and-trial",
        "tags": ["gespenster", "curator"]
      },
      {
        "id": "lib-owner-contracts-2025",
        "title": "Contratos cliente (privado)",
        "storage": "local",
        "path": "data/library/private/contracts/",
        "exportable": false,
        "visibility": "owner-only",
        "pii": true
      },
      {
        "id": "lib-research-notion",
        "title": "Export Notion investigación",
        "storage": "cloud",
        "provider": "gdrive",
        "exportable": false,
        "visibility": "owner-only",
        "credentialsRef": "v0/gdrive-library"
      }
    ],
    "salePolicy": {
      "mode": "curated",
      "include": ["lib-gespenster-briefs"],
      "exclude": ["lib-owner-contracts-2025", "lib-research-notion"]
    }
  }
}
```

### `libraryHash` en oferta onchain

Junto a `saleConfigHash`:

```solidity
event SaleOfferCommitted(
  uint256 indexed agentId,
  bytes32 saleConfigHash,
  bytes32 libraryHash,   // Merkle o CID del índice exportable
  MemoryPolicy memoryPolicy,
  uint64 trialEndsAt
);
```

`libraryHash` cubre **solo** entradas `exportable: true` en `libraryInclude` — no el índice completo del owner.

---

## Políticas de biblioteca al vender

| Política | Comprador recibe |
|----------|------------------|
| **library-none** | Solo B-canon (soul, manifiesto) — sin corpus extra |
| **library-pack** | Todos los B-pack marcados exportables |
| **library-curated** | Allowlist explícita (`libraryInclude`) |
| **library-full** | B-pack + re-pin voluntario de selección cloud/local → IPFS antes de venta |

`library-full` requiere paso explícito: *“Subir a IPFS los docs que quieres vender”* — no arrastra la nube automáticamente.

---

## Modos de acceso (resumen)

| Modo | B-canon | B-pack (incluidos) | B-local | B-cloud |
|------|---------|-------------------|---------|---------|
| **Owner** | ✅ | ✅ | ✅ | ✅ |
| **Rental** | ✅ | ✅ según config | ❌ | ❌ |
| **Trial** | ✅ | ✅ según `libraryInclude` | ❌ | ❌ |
| **Post-compra** | ✅ | según política venta | ❌ (nuevo owner monta la suya) | ❌ |

---

## Operación runtime (esbozo)

1. **Ingesta** — subir archivo → clasificar PII, `exportable`, `storage` target.
2. **Indexación** — chunk + embed (futuro); pointer en índice local.
3. **Sync B-pack** — `npm run library:sync` → IPFS/toju → actualiza manifiesto URI.
4. **preloadContext** — según modo, filtra `library.entries` por `visibility`.
5. **Hygiene** — audita docs con PII mal clasificados antes de pin público.

---

## Checklist producto

- [ ] Carpeta `data/library/` + índice JSON versionado
- [ ] UI Dashboard: ubicación por doc (local / cloud / IPFS)
- [ ] Curación `libraryInclude` en wizard venta + trial
- [ ] `libraryHash` en evento oferta
- [ ] Aviso M3 ↔ `derivedFromLibraryId`
- [ ] Trial badge “biblioteca incluida / vacía”
- [ ] Export pre-transfer: solo B-pack, nunca paths cloud sin re-pin

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`memory-layers-access.md`](memory-layers-access.md) | M2/M3/V0, trial hash |
| [`memory-transfer-policy.md`](memory-transfer-policy.md) | Políticas venta memoria |
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Local vs hospedado |
| [`organ-service-tiers.md`](organ-service-tiers.md) | Pin IPFS tier D |
| [`senses-organ.md`](senses-organ.md) | OCR → archivo en biblioteca |
