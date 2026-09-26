# TranXp — favoritos personales (M2) vs City Pack

> **2026-09-20** · Código: [`runtime/src/tranxp-personal.mjs`](../../runtime/src/tranxp-personal.mjs)  
> Política: [`memory-transfer-policy.md`](memory-transfer-policy.md) · [`memory-layers-access.md`](memory-layers-access.md)

## Separación

| Qué | Dónde | Viaja con el NFT |
|-----|-------|------------------|
| Paradas/líneas de la ciudad, pitfalls, adapters | City Pack `favorites[]` (Biblioteca / B) | Sí (si el pack va en cápsula) |
| «casa», «trabajo», ciudad elegida por chat | `runtime/data/tranxp/personal-store.json` (**M2**) | **Nunca** por defecto (`transfer: never-with-nft`) |

El pack describe la ciudad. El store personal describe al **owner/usuario de chat**.

## Formato store

```json
{
  "type": "agenft-tranxp-personal/v1",
  "layer": "M2-personal",
  "transfer": "never-with-nft",
  "users": {
    "telegram:123456": {
      "packId": "madrid-es",
      "favorites": [
        { "label": "casa", "network": "cercanias", "stop": "18000", "packId": "madrid-es" }
      ],
      "updatedAt": "…"
    }
  }
}
```

Clave de usuario: `telegram:<chatId>` (Matrix: `matrix:<room>` cuando exista).

## Bot lite

- `/ciudad` → escribe `packId` en M2 (no env hardcodeado).
- `/fav add …` → favorito en M2 con `packId` activo.
- Mensaje «casa» → se traduce a consulta concreta al harness; si el favorito es de otro pack, pide `/ciudad`.

## Al vender

Checklist transfer: **excluir** `runtime/data/tranxp/` (y cualquier `personal-store`) salvo política `full` explícita y consentida. City Packs en Biblioteca sí pueden viajar.
