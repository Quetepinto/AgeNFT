# Backup — nomenclatura memoria protocolo + pin (2026-07-20)

> Cambio acordado tras confusión Lab Studio: **toju** e **IPFS** no son opciones paralelas.

## Qué cambió

### Lab Studio (`dapp/js/lab-studio.js`)

| Antes | Ahora | Significado |
|-------|-------|-------------|
| `toju-local` | `lab-local` | Disco dev — no era toju |
| `ipfs-primary` | `toju-ipfs` | Primary producto: toju pinnea en IPFS |
| `w3stor-fallback` | `w3stor-ipfs` | Fallback pin x402 |
| — | `kubo-ipfs` | Self-host IPFS (probado jul-2026) |

- Backup JS previo: `lab-studio-20260720-pre-memory-layers.js`
- Migración automática en `localStorage` (`agenft-lab-draft-v1`)

### Documentación nueva

- [`memory-storage-layers.md`](../research/memory-storage-layers.md) — doc maestro dos capas

### Docs actualizados

- `design-index-20260716.md`
- `organ-assembly-catalog.md`
- `pieces-taxonomy.md`
- `lab/next-steps.md`
- `lab/mvp-status.md`
- `runtime/README.md`
- `README.md`
- `dapp/assets/agents/1.json` — detail `toju + IPFS`

## Runtime

Sin cambios de código — `memory-toju.mjs` ya modelaba protocolo + pin correctamente.

## Prueba IPFS (misma sesión)

- CID: `QmZDEgUs458XNHgLBs1hGJfPa8hdVQjQeRL1dGidEhc34w`
- Pointer backup: `remote-pointer-20260720-pre-ipfs-test.json`

## Layout humanoide Lab Studio (2026-07-20 tarde)

- `LAYOUT_VERSION = 2` — disposición por zonas (cabeza / torso / extremidades)
- Backup previo: `lab-studio-20260720-pre-humanoid-layout.js`
- Sin silueta literal; cables laterales para cabeza, verticales torso↔cabeza
