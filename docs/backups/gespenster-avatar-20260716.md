# Backup — avatar Gespenster Unit-Mainnet (2026-07-16)

## Origen
- Imagen enviada por el usuario (captura Gespenster)
- Proyecto artístico: https://gespenster.eth.link/ — Ety Fefer (uso autorizado)

## Archivos
- `dapp/assets/unit-mainnet.png` (719×719 PNG)
- `docs/manifest/examples/unit-mainnet.json` — `image`, bloque `visual`
- `dapp/assets/agents/1.json` — exportado
- `dapp/index.html` — sección identidad visual
- `dapp/js/app.js` — rutas relativas de imagen
- `runtime/pack/unit-mainnet/soul.md` — tono / identidad

## Nota on-chain
El `agentURI` del mint #1 es data-URI fijo; la cara visible en dApp/manifiesto local no actualiza el metadata del NFT sin nueva función en contrato.

## Publicar
```bash
git add dapp/assets/unit-mainnet.png docs/manifest/examples/unit-mainnet.json dapp/assets/agents/1.json dapp/index.html dapp/js/app.js scripts/dapp/export-public-data.mjs runtime/pack/unit-mainnet/soul.md
git commit -m "..."
git push origin main
```
