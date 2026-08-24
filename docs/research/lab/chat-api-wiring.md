# Cableado chat web — esbozo (2026-07-16)

## Piezas

| Pieza | Ruta |
|-------|------|
| API HTTP | `runtime/src/chat-api.mjs` |
| npm | `cd runtime && npm run chat:api` |
| dApp chat UI | `dapp/index.html` + `dapp/js/chat.js` |
| Dashboard esbozo | `dapp/settings.html` |

## Uso local

```bash
# Terminal 1
cd runtime && npm run chat:api

# Terminal 2 — servir dApp
cd dapp && python3 -m http.server 8080
# Abrir http://127.0.0.1:8080 — en chat poner API http://127.0.0.1:8787
```

## Producción

GitHub Pages **no** ejecuta Node. Opciones:

1. API en VPS del operador + CORS `AGENFT_CHAT_API_CORS=https://quetepinto.github.io`
2. Meta `agenft-api-url` en `index.html` cuando haya URL pública
3. Tras transfer: nuevo owner apunta dApp a **su** API (ver `transfer-local-hosting.md`)

## Env

| Variable | Default |
|----------|---------|
| `AGENFT_CHAT_API_PORT` | 8787 |
| `AGENFT_CHAT_API_HOST` | 127.0.0.1 |
| `AGENFT_CHAT_API_PAY` | 1 (true) |
| `AGENFT_CHAT_API_CORS` | * |

## Prueba

```bash
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/v1/turn -H 'content-type: application/json' \
  -d '{"message":"Hola"}'
```
