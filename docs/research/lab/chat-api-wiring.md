# Cableado chat web

> **Estado:** vivo (Caddy) · **2026-08-31**

## Piezas

| Pieza | Ruta |
|-------|------|
| API HTTP | `runtime/src/chat-api.mjs` |
| systemd | `runtime/systemd/agenft-chat-api.service` |
| npm | `cd runtime && npm run chat:api` |
| dApp chat UI | `dapp/index.html` + `dapp/js/chat.js` |
| Dashboard esbozo | `dapp/settings.html` |
| Wiring | `runtime/wiring/unit-mainnet.json` → `chatweb` = `chat-api-caddy` |

## Uso local

```bash
# Terminal 1
cd runtime && npm run chat:api

# Terminal 2 — servir dApp
cd dapp && python3 -m http.server 8080
# Abrir http://127.0.0.1:8080 — API por defecto o http://127.0.0.1:8787
```

## Producción (VPS)

GitHub Pages **no** ejecuta Node. El cerebro corre en el VPS; Caddy publica la API.

URL pública: `https://bo5bvc.duckdns.org/agenft-api`

```caddy
handle_path /agenft-api/* {
    reverse_proxy 127.0.0.1:8787
}
```

```bash
systemctl --user enable --now agenft-chat-api.service
curl -sS https://bo5bvc.duckdns.org/agenft-api/health
```

La dApp lleva `meta name="agenft-api-url"` con esa URL. CORS default `*` (Pages + DuckDNS).

**Gasto:** `POST /v1/turn` paga con TBA (`AGENFT_CHAT_API_PAY=1`), acotado por caps del manifiesto (`perDayUsdHardCap`). Mismo modelo que Telegram abierto.

Tras transfer: el nuevo owner apunta la dApp a **su** API (ver `transfer-local-hosting.md`).

## Env

| Variable | Default |
|----------|---------|
| `AGENFT_CHAT_API_PORT` | 8787 |
| `AGENFT_CHAT_API_HOST` | 127.0.0.1 |
| `AGENFT_CHAT_API_PAY` | 1 (true) |
| `AGENFT_CHAT_API_CORS` | * |
| `AGENFT_CHAT_API_PUBLIC_URL` | (vacío; en systemd: URL Caddy) |

## Prueba

```bash
curl http://127.0.0.1:8787/health
curl -sS https://bo5bvc.duckdns.org/agenft-api/health
curl -X POST https://bo5bvc.duckdns.org/agenft-api/v1/turn -H 'content-type: application/json' \
  -d '{"message":"Hola","pay":false}'
```
