# dApp estática ageNFT (Fase 2.5)

Página mínima para ver **Unit-1**: TBA, presupuesto (snapshot), enlace chat.

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

Genera `assets/agents/115.json` y `assets/budget-115.json` desde manifiesto + ledger local.

## GitHub Pages

Workflow: `.github/workflows/pages.yml`  
Guía completa: [`docs/GITHUB_SETUP.md`](../docs/GITHUB_SETUP.md)

## Rutas

| URL | Contenido |
|-----|-----------|
| `/` | Unit-1 (default id=115) |
| `/?id=115` | Mismo |
| `/agent/115/` | Redirect a home |
