# Livepeer — vídeo descentralizado para Presencia

> **Estado:** Investigación · **Origen:** 2026-07-13  
> **Enlaces:** [Livepeer Studio](https://livepeer.studio/) · [Livepeer Network](https://livepeer.org/) · [AI y agentes (docs)](https://docs.livepeer.org/v2/developers/learn/ai-and-agents)  
> Última revisión: 2026-07-13

---

## Qué es (en cristiano)

**Livepeer** es una **red abierta de GPUs** (ordenadores con tarjeta gráfica repartidos por el mundo) para:

1. **Streaming en vivo** (vídeo en tiempo real, baja latencia)
2. **Vídeo bajo demanda** (VOD — guardar y reproducir después)
3. **Transcodificación** (convertir vídeo a formatos/calidades distintas)
4. **IA de vídeo en tiempo real** (avatares, VTuber, frames continuos)

Hay **dos capas**:

| Capa | Qué es | Cuenta humana |
|------|--------|---------------|
| **[Livepeer Studio](https://livepeer.studio/)** | Producto alojado (API, reproductor, panel) | ✅ Sign up, API key |
| **Red Livepeer** (`go-livepeer`) | Protocolo descentralizado; pago con crypto en Arbitrum | ⚠️ Wallet ETH/LPT, no email obligatorio |

Open source. Usado por proyectos como [Minds](https://www.minds.com/), [Coinbase](https://www.coinbase.com/) (casos en su web), streaming social.

---

## Por qué puede servir a ageNFT

| Necesidad ageNFT | Cómo ayuda Livepeer |
|------------------|---------------------|
| **Enviar** cara animada al móvil/web | WebRTC + HLS — stream baja latencia |
| **Teaser** marketplace (`previewAsset`) | Transcode API → múltiples calidades |
| **Bucle idle** IPFS | VOD + CDN de red |
| **Avatar IA tiempo real** (alternativa MuseTalk) | Pipeline VTuber / ComfyStream / Daydream |
| **Narrativa descentralizada** | DePIN de vídeo; encaja con ageNFT Web3 |

No reemplaza IPFS (almacén) ni MuseTalk (lip-sync local) — **complementa la entrega y el transcode**.

---

## Hallazgo relevante: IA + agentes

La documentación oficial describe ([AI and agents](https://docs.livepeer.org/v2/developers/learn/ai-and-agents)):

- Pipeline **avatar agente en tiempo real** (VTuber) con ComfyStream / StreamDiffusion
- Plugin **Eliza ↔ Livepeer** para inferencia LLM en red descentralizada
- Modo **stream continuo** (frame a frame), no solo “un vídeo y listo”
- Facturación **por segundo de GPU** en streams en vivo

**Implicación ageNFT:** Livepeer es candidato para **tier P3–P4 presencia** cuando queráis stream global sin montar CDN propio — especialmente si evaluáis avatar generativo en GPU red, no solo MuseTalk local.

---

## Encaje con criterios ageNFT

| Criterio | Livepeer Studio | Red Livepeer (self-host gateway) |
|----------|-----------------|----------------------------------|
| Descentralizado | ⚠️ SaaS centralizado | ✅ red permissionless |
| Sin email (agente) | ❌ cuenta Studio | ✅ wallet Arbitrum financia gateway |
| Pago desde TBA | ❌ tarjeta/API key | ⚠️ ETH en Arbitrum (no Base nativo) |
| Post-transfer NFT | ⚠️ cuenta del dev | ✅ si wallet es del agente/operación |
| Calidad streaming | ✅ | ✅ |
| Precio | ✅ (~80% ahorro vs vendors según ellos) | ✅ micropagos por segmento |

**Veredicto:**

- **Studio** → herramienta **owner/dev** para prototipos (Fase 4.5 lab), no órgano soberano del agente
- **Red + gateway propio** → hábitat **Fase 5** si queréis entrega vídeo descentralizada con wallet

---

## Casos de uso concretos en ageNFT

### 1. Presence Server → usuario (entrega)

```
MuseTalk / Live2D (genera frames)
    → Gateway Livepeer (ingest RTMP/WebRTC)
    → HLS / WebRTC al cliente (app, widget)
```

Contexto manifiesto: `app-full`, `app-mobile`

### 2. Transcode de assets

```
idleAsset / previewAsset (IPFS, raw)
    → Livepeer Transcode API
    → variantes 360p / 720p para móvil y Zora
```

### 3. Avatar IA en red (experimental)

```
Audio TTS + imagen NFT
    → Pipeline Daydream / ComfyStream en Orchestrator Livepeer
    → stream avatar (alternativa a MuseTalk self-host)
```

Relacionado con spike Eliza (plugin Livepeer) — evaluar solo si seguís pista Eliza; **no obligatorio** con Hermes.

### 4. Streaming público (eventos)

ageNFT “en directo” en app o embed — 24/7 idle loop o sesiones con owner.

---

## Arquitectura propuesta (borrador)

```
┌─────────────────────────────────────────┐
│  presence-server (ageNFT)               │
│  MuseTalk / Live2D / TTS                │
└──────────────┬──────────────────────────┘
               │ ingest
               ▼
┌─────────────────────────────────────────┐
│  Livepeer Gateway (opcional)            │
│  Studio API (lab) O self-host (prod)    │
└──────────────┬──────────────────────────┘
               │ HLS / WebRTC
               ▼
         App / móvil / widget
```

**Manifiesto (borrador):**

```json
{
  "organs": {
    "presence": {
      "delivery": {
        "provider": "livepeer",
        "mode": "studio",
        "streamPlayback": "hls",
        "transcodePreview": true
      }
    }
  }
}
```

---

## Limitaciones y riesgos

| Tema | Nota |
|------|------|
| **Chain** | Pagos red en **Arbitrum**, no Base — otra wallet/bridge |
| **Studio ≠ soberano** | API key humana; no poner en manifiesto público |
| **Avatar IA Livepeer** | Experimental; GPU availability variable |
| **Eliza plugin** | Existe; Hermes necesitaría skill propia |
| **Privacidad** | Stream pasa por red/orquestadores — evaluar para datos sensibles |

---

## Fase roadmap

| Fase | Entregable |
|------|------------|
| 4.5 lab | Probar **Studio** free tier: transcode `previewAsset` |
| 4.5 | HLS playback de bucle idle en dApp |
| 5.x | Evaluar gateway self-host + pago Arbitrum desde wallet operación |
| 5.x | POC avatar stream Livepeer vs MuseTalk local (coste/latencia) |

---

## Comparativa rápida

| Entrega vídeo | Descentralizado | Agente paga solo | Mejor para |
|---------------|-----------------|------------------|------------|
| IPFS + `<video>` | ✅ | ✅ pinning x402 | MVP barato |
| **Livepeer Studio** | ❌ | ❌ | Lab, transcode |
| **Livepeer Network** | ✅ | ⚠️ ETH Arbitrum | Escala streaming |
| Cloudflare Stream | ❌ | ❌ | Evitar como default |
| dTelecom WebRTC | ✅ DePIN | ✅ x402 Base | **Audio/voz** (complemento) |

**Combo sugerido:** IPFS assets + **dTelecom** (voz, Base) + **Livepeer** (vídeo entrega/transcode).

---

## Preguntas abiertas

- [ ] ¿Studio free tier basta para Unit-1 lab?
- [ ] ¿Transcode API sin cuenta vía red permissionless?
- [ ] ¿Bridge USDC Base → ETH Arbitrum desde TBA para gateway?
- [ ] ¿Daydream avatar vs MuseTalk — benchmark calidad/latencia?

---

## Referencias

- [Livepeer Studio](https://livepeer.studio/)
- [Livepeer.org — red](https://livepeer.org/)
- [AI and agents](https://docs.livepeer.org/v2/developers/learn/ai-and-agents)
- [Payment guide gateways](https://docs.livepeer.org/v2/gateways/guides/payments-and-pricing/payment-guide)
- [`presence-voice-stack.md`](presence-voice-stack.md)
- [`presence-organ.md`](presence-organ.md)
