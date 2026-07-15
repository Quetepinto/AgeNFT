# Publicar ageNFT en GitHub

Guía para crear el repo, primer push y activar Pages (dApp estática).

## 1. Requisitos

- Cuenta GitHub
- [GitHub CLI](https://cli.github.com/) opcional: `gh auth login`

## 2. Inicializar (ya hecho en lab si seguiste el asistente)

```bash
cd /home/openclaw/projects/ageNFT
git init
git add .
git status   # revisar: NO debe aparecer .env ni runtime/data/
```

## 3. Crear repo en GitHub

**Opción A — CLI (recomendada)**

```bash
# Cambia YOUR_USER por tu usuario GitHub
gh repo create YOUR_USER/ageNFT --public --source=. --remote=origin --description "ageNFT — agente IA en un NFT"
```

**Opción B — Web**

1. https://github.com/new → nombre `ageNFT`, público
2. Local:

```bash
git remote add origin https://github.com/YOUR_USER/ageNFT.git
```

## 4. Primer commit y push

```bash
git add .
git commit -m "Initial commit: ageNFT lab — runtime, manifiesto, dApp estática"
git branch -M main
git push -u origin main
```

## 5. Activar GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Tras el push, el workflow `Deploy dApp` publica la carpeta `dapp/`

URL resultante: `https://YOUR_USER.github.io/ageNFT/`

## 6. Actualizar enlaces en la dApp

Edita `dapp/assets/agents/115.json` y `dapp/index.html`:

- `links.github` → tu URL real
- `btn-github` href en `index.html`

Regenera snapshot presupuesto antes de cada release visible:

```bash
cd runtime && npm run dapp:export
```

## 7. Dominio custom (opcional)

- Settings → Pages → Custom domain → `app.agenft.dev` o ENS gateway
- O más adelante: `agenft.eth` → IPFS (ver `docs/research/dapp-surfaces-wallet.md`)

## Qué NO subir

| Archivo / carpeta | Por qué |
|-------------------|---------|
| `runtime/data/` | Memoria y ledger local |
| `.env`, claves | Secrets |
| `~/.credentials/` | Wallet lab |

Ver `.gitignore`.

## Estructura publicada

```
dapp/
  index.html          ← ficha Unit-1
  agent/115/          ← deep link
  assets/agents/115.json
  assets/budget-115.json
  terms.html
```

## Probar en local

```bash
cd dapp
python3 -m http.server 8080
# http://localhost:8080
```
