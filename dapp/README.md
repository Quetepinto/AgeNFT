# dApp estática ageNFT — MVP mainnet

Página para **Unit-Mainnet #1**: TBA, presupuesto (snapshot), Telegram, transfer.

## Desarrollo local

```bash
cd dapp
python3 -m http.server 8080
```

Abre http://localhost:8080

## Actualizar datos públicos

```bash
cd runtime
npm run dapp:export
```

Genera `assets/agents/1.json`, `assets/budget-1.json`, `assets/index.json`.

Legacy Sepolia:

```bash
node ../scripts/dapp/export-public-data.mjs unit-1-lab.json
```

## Rutas

| URL | Contenido |
|-----|-----------|
| `/` | Unit-Mainnet #1 (default) |
| `/?id=1` | Unit-Mainnet |
| `/?id=115` | Unit-1 lab (si exportado) |
| `/agent/1/` | Redirect |
| `/transfer.html` | Qué viaja al transferir |

## GitHub Pages

Workflow: `.github/workflows/pages.yml`  
Guía: [`docs/GITHUB_SETUP.md`](../docs/GITHUB_SETUP.md)
