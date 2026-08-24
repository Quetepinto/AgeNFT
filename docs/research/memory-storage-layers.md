# Memoria offchain — protocolo vs pin (dos capas)

> **Estado:** Acordado · **Jul-2026**  
> Corrige la confusión histórica “IPFS **o** toju” — en ageNFT son **capas distintas**, no alternativas excluyentes.

Complementa: [`memory-transfer-policy.md`](memory-transfer-policy.md) · [`memory-layers-access.md`](memory-layers-access.md) · [`library-storage-policy.md`](library-storage-policy.md)

---

## Regla en una frase

> **IPFS** = dónde vive el blob (CID, `ipfs://…`).  
> **toju / W3Stor / kubo** = quién lo sube y lo mantiene pinneado.

**toju no sustituye a IPFS — pinnea en IPFS** y devuelve un CID. El runtime guarda ambos URIs:

```json
{
  "provider": "toju",
  "cid": "Qm…",
  "uri": "toju://mainnet/Qm…",
  "ipfsUri": "ipfs://Qm…"
}
```

Al **leer**, da igual si el pointer dice `toju` o `ipfs`: se resuelve vía gateways IPFS (`ipfs.io`, `dweb.link`, Pinata…).

---

## Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA 1 — Protocolo (content-addressed)                      │
│  IPFS (operativa)  ·  Arweave (archivo permanente)          │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ pin / upload
┌─────────────────────────────────────────────────────────────┐
│ CAPA 2 — Pin / upload (quién mantiene el blob disponible)   │
│  toju (x402)  ·  W3Stor (x402)  ·  kubo (self-host)       │
│  lab-local (disco dev — NO es IPFS)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Opciones en Lab Studio (jul-2026)

| ID Lab Studio | Etiqueta UI | Protocolo | Pin / upload | Uso |
|---------------|-------------|-----------|--------------|-----|
| `lab-local` | Lab local (disco) | — | `memory-remote/capsule.json` | Dev, cero coste, no viaja bien |
| `toju-ipfs` | **toju + IPFS** | IPFS | toju.network (x402, TBA) | **Primary producto mainnet** |
| `kubo-ipfs` | kubo + IPFS | IPFS | Nodo IPFS propio | Lab/self-host — probado jul-2026 |
| `w3stor-ipfs` | W3Stor + IPFS | IPFS | W3Stor (x402 fallback) | Failover en manifiesto |
| `arweave` | Arweave (archivo) | Arweave | AR one-shot | Capa archivo, no deltas frecuentes |
| `export-only` | Solo export | — | Manual | Sin sync automático |

### Nombres antiguos (deprecated)

| Antes (confuso) | Ahora | Por qué |
|-----------------|-------|---------|
| `toju-local` | `lab-local` | No era toju — era disco local |
| `ipfs-primary` | `toju-ipfs` | Primary producto = toju pinnea en IPFS |
| `w3stor-fallback` | `w3stor-ipfs` | Misma capa que toju, otro servicio de pin |

---

## Manifiesto — cómo expresarlo

```json
{
  "organs": {
    "memory": {
      "format": "agenft-memory-capsule/v1",
      "operational": {
        "provider": "toju",
        "primary": "ipfs://QmZDEgUs458XNHgLBs1hGJfPa8hdVQjQeRL1dGidEhc34w",
        "fallbacks": ["w3stor", "kubo", "lab-remote"]
      },
      "archive": { "provider": "arweave", "primary": null }
    }
  }
}
```

| Campo | Significado |
|-------|-------------|
| `provider` | Servicio de **pin/upload** preferido (`toju`, `w3stor`, `kubo`, `lab-remote`) |
| `primary` | URI canónica del blob — casi siempre `ipfs://{cid}` |
| `fallbacks` | Otros **pin providers**, no “otro protocolo” |

> **Nota:** `"ipfs"` en `fallbacks` del manifiesto legacy significaba “pin genérico / kubo”. Preferir `"kubo"` explícito en docs nuevos.

---

## Runtime — comandos

```bash
cd runtime
npm run memory:sync                    # auto: toju → lab-local si falla
npm run memory:sync -- --provider=lab-local
npm run memory:sync -- --provider=toju
npm run memory:restart-test            # wipe local + hydrate desde pointer
npm run once:pay:sync                  # turno + sync (--sync-toju = alias histórico)
```

Implementación: [`runtime/src/memory-toju.mjs`](../../runtime/src/memory-toju.mjs)

| Provider runtime | Qué hace |
|------------------|----------|
| `auto` | Intenta toju (x402); si falla → `lab-local` |
| `toju` | Upload x402 → CID IPFS |
| `lab-local` | Escribe `memory-remote/capsule.json` (sin IPFS) |
| hydrate | Lee `lab-local` o fetch gateways con CID del pointer |

---

## Estado lab (jul-2026)

| Pieza | Estado |
|-------|--------|
| Cápsula `agenft-memory-capsule/v1` | ✅ |
| `lab-local` + restart test | ✅ |
| `kubo-ipfs` + gateways | ✅ CID `QmZDEgUs458XNHgLBs1hGJfPa8hdVQjQeRL1dGidEhc34w` |
| `toju-ipfs` upload x402 | ❌ API devuelve 402 tras pago — pendiente fix toju |
| Sync post-turno Hermes | ⏳ |
| `primary` en manifiesto mainnet | ⏳ |

---

## Analogía

| ageNFT | Mundo real |
|--------|------------|
| IPFS / CID | ISBN del libro |
| toju / W3Stor | Librería que guarda copias y cobra estantería (x402) |
| kubo | Tu estantería en casa |
| lab-local | Post-it en el frigorífico (solo dev) |
| Arweave | Edición de lujo encuadernada para siempre |

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Catálogo servicios memoria |
| [`lab/next-steps.md`](lab/next-steps.md) | Bloque 3.2 memoria que viaja |
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Mudanza local vs offchain |
| [`dapp/js/lab-studio.js`](../../dapp/js/lab-studio.js) | Opciones UI Lab Studio |
