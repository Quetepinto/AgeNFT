# Transferencia — órganos locales vs hospedados y mudanza fluida

> **Estado:** Diseño · **Jul-2026**  
> Complementa [`dapp/transfer.html`](../../dapp/transfer.html) y [`design-index-20260716.md`](design-index-20260716.md).

---

## Qué viaja onchain (siempre)

| Pieza | Transfer |
|-------|----------|
| NFT + `agentId` | ✅ 1 tx |
| TBA + saldo USDC/ETH | ✅ misma dirección TBA |
| `agentURI` (manifiesto pointer) | ✅ metadata NFT |
| Reputación / registry | ✅ |

---

## Órganos: local vs hospedado

| Órgano | Puede ir en **local** (máquina owner) | Hospedado **D** (Akash/VPS) | Hospedado **E** (SaaS) |
|--------|--------------------------------------|-----------------------------|------------------------|
| **Runtime / Hermes** | ✅ típico hoy | ✅ objetivo TBA→Akash | VPS gestionado |
| **Memoria operativa** | ✅ `data/unit-mainnet/` | toju / IPFS | ❌ |
| **Cerebro** | probe G; pago vía x402 | x402 (TBA) | manguera E owner |
| **Doctor Vitality** | ✅ cron local | servicio remoto opt-in | — |
| **Doctor Hygiene** | ✅ audit local | contenedor aislado | Snyk SaaS E |
| **Sentidos** | Whisper/Tesseract G | dTelecom D | Google E |
| **Presencia** | idle CSS G | TTS GPU Akash | ElevenLabs E |
| **Gateways Telegram** | token en `~/.credentials` | bot en VPS | Telegram cloud |
| **dApp estática** | — | GitHub Pages | — |
| **Scout** | scraper local | cron remoto | ConvoHunter E |

**Regla:** lo **onchain** viaja solo; lo **local** depende del **operador** que corre el runtime.

---

## Problemas al transferir a otro owner/wallet

| Problema | Por qué |
|----------|---------|
| **Runtime en PC del vendedor** | El comprador no tiene el proceso Hermes |
| **Memoria solo en disco local** | `data/` no sale en la tx NFT |
| **Credenciales gateway** | Token Telegram del vendedor — inválido para comprador |
| **Clave owner para firmar TBA** | Nueva wallet debe firmar x402; session key futura |
| **Tier E atado a cuenta humana** | Email/API key del vendedor — **hay que reconfigurar** |
| **Akash deployment** | Mismo manifiesto pero nuevo despliegue / wallet AKT |
| **IPs / DNS del API chat** | URL del relay apunta al servidor del vendedor |

**No es bug** — es la diferencia entre **activo onchain** y **operación offchain**.

---

## Mudanza fluida — wizard post-transfer

Flujo objetivo en Dashboard (**Transfer onboarding**):

```
Nuevo owner conecta wallet
  → detecta transfer reciente (evento Transfer + checklist)
  → Wizard "Activar tu ageNFT"
```

### Pasos del wizard

| Paso | Acción | Default si no hace nada |
|------|--------|-------------------------|
| 1 | Verificar NFT + TBA + saldo | — |
| 2 | **Elegir hosting runtime** | `default-cloud` (plantilla D) |
| 3 | **Memoria** — importar cápsula IPFS/toju o empezar vacío | último URI del manifiesto |
| 4 | **Gateways** — **bot Telegram nuevo** (obligatorio; no reutilizar @handle del vendedor) | web only |
| 5 | **Órganos locales → default** | ver tabla abajo |
| 6 | Prueba turno `--pay` desde TBA | checklist 8/8 |

### Promoción local → default (automática)

Cuando el runtime detecta `hosting.mode: local` y `owner !== previousOperator`:

```json
{
  "runtime": {
    "hosting": {
      "primary": "local",
      "fallbacks": ["akash-template", "github-actions-stub"],
      "onTransfer": "prompt-migrate-to-default"
    }
  }
}
```

| Órgano local previo | Default post-transfer | Acción |
|---------------------|----------------------|--------|
| cerebro x402 TBA | igual (no cambia) | ninguna |
| memoria `data/` local | toju/IPFS pointer en manifiesto | export + sync URI |
| Hermes en laptop | Akash / VPS template 1-click | deploy script |
| Telegram token viejo | desactivado → owner pone nuevo | gateway off hasta config |
| tier E manguera | **off** — Hygiene bloquea hasta opt-in | tier G/D only |
| Doctor cron local | Doctor remoto opt-in o cron nuevo | reinstalar `hermes:install` |

**Manifiesto `migrationProfile`:**

```json
{
  "transfer": {
    "memoryExport": "ipfs",
    "runtimeDefault": "akash-stub",
    "gatewaysReset": ["telegram"],
    "downgradeTierE": true,
    "preserveOrganConfig": ["brain", "budget", "visual"]
  }
}
```

---

## Qué debe exportar el vendedor (buena práctica)

Antes de `transfer()`:

1. `npm run memory:sync` → URI público  
2. `npm run dapp:export`  
3. Snapshot `docs/research/lab/handoff-{tokenId}.json` (TBA, checklist, memory URI)  
4. Apagar gateways personales (Telegram)  

El comprador importa URI memoria + corre wizard.

---

## Checklist ampliado post-transfer

Ver `scripts/onchain/transfer-checklist.mjs` — añadir ítems futuros:

- [ ] `hosting` ≠ `local` del vendedor o wizard completado  
- [ ] Memoria URI resuelve (HTTP 200)  
- [ ] Gateways sin credenciales del owner anterior  
- [ ] tier E desactivado salvo confirmación Hygiene  
- [ ] Chat API URL apunta al runtime del **nuevo** operador  

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`organ-service-tiers.md`](organ-service-tiers.md) | G/D/E |
| [`owner-dashboard.md`](owner-dashboard.md) | Wizard |
| [`dual-doctor.md`](dual-doctor.md) | Hygiene en transfer |
