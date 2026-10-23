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

## Imagen URUIRU (Presencia)

| Archivo | Uso |
|---------|-----|
| `assets/unit-mainnet.png` | Imagen principal (Gespenster — copia aquí el PNG original si lo tienes) |
| `assets/unit-mainnet.svg` | Fallback incluido en repo |

Visible en: **hero** (mini), sección **Presencia** (grande), **Ajustes**.

## Muñeco — cuerpo digital

Sección en `index.html` con órganos (`organs[]` en `agents/1.json`), exportados desde el manifiesto.

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
| `/settings.html` | **Dashboard owner** — wiring + host (wallet = `ownerOf`) |
| `/transfer.html` | Qué viaja al transferir |

## Dashboard settings + host

La dApp estática (Pages) **no escribe** en el VPS sola. El owner elige destino:

| Destino | Qué hace |
|---------|----------|
| **Este navegador** | `localStorage` + descarga JSON |
| **Host local / VPS** | `POST` al **settings-bridge** (`:8800`) → `runtime/wiring/{packId}.json` |

```bash
# En la máquina donde corre el agente:
cd runtime && npm run settings:bridge
# → http://127.0.0.1:8800

# dApp (otra terminal o Pages):
cd dapp && python3 -m http.server 8080
# Abre /settings.html → Conectar wallet → Destino local → Probar bridge → Guardar
```

- Token opcional: `AGENFT_SETTINGS_TOKEN` → header `X-Settings-Token`.
- Preferencias de host: `runtime/data/{packId}/host-prefs.json` (gitignored; no viajan con el NFT).
- Lab Studio (`lab:bridge` :8799) sigue siendo capa **construcción**; settings es capa **producto**.

## GitHub Pages

Workflow: `.github/workflows/pages.yml`  
Guía: [`docs/GITHUB_SETUP.md`](../docs/GITHUB_SETUP.md)
