# Prueba owner — token #1 (URUIRU)

> **Para ti primero**, antes de pasárselo a alguien no técnico.  
> El #1 **es un NFT real** en Base; aquí solo ajustamos config off-chain (manifiesto, wiring, dApp).

---

## Qué comprobar (5 min)

| Paso | Acción | OK si… |
|------|--------|--------|
| 1 | Abre **https://t.me/Unit1_agent_bot** → Iniciar → «Hola, ¿quién eres?» | Responde en &lt; 30 s como URUIRU |
| 2 | Abre la **guía** (`settings.html` en tu despliegue o local) | Ves pasos Telegram, caja verde «no hace falta wallet» |
| 3 | Segunda pregunta en Telegram: «¿Qué es una hucha?» | Explica sin pedir MetaMask |
| 4 | (Opcional) Ficha agente `index.html` | Muestra URUIRU, TBA, órganos |
| 5 | (Opcional) `cd runtime && npm run hermes:doctor` en VPS | Sin errores críticos; budget no DORMANT |

---

## Enlaces útiles

- Bot: https://t.me/Unit1_agent_bot
- NFT: https://basescan.org/token/0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839?a=1
- TBA: https://basescan.org/address/0x9BF1E8564875fb5927d8F699756Be50eE4e73CCB

---

## Si no responde Telegram

1. En VPS: `systemctl status agenft-telegram-mainnet` (o el nombre del servicio)
2. `cd runtime && AGENFT_TOKEN_ID=1 npm run hermes:turn:pay -- --plain --quiet "hola"`
3. `npm run budget` — si DORMANT, hucha vacía o tope diario
4. Logs del bot Telegram

---

## Después de tu OK

Usa [`onboarding-usuario-normal.md`](onboarding-usuario-normal.md): solo bot + guía, sin Lab ni MetaMask.
