# Stack voz y animación — opciones para Presencia (Fase 4.5)

> **Criterio ageNFT:** wallet paga, sin email/cuenta humana, compatible con TBA, post-transfer.  
> Última revisión: 2026-07-13

---

## Criterios de evaluación

| Criterio | Qué significa |
|----------|----------------|
| **Agente-soberano** | Paga con wallet; sin registro ni API key humana |
| **Descentralizado** | DePIN, self-host, o x402 (sin cuenta central) |
| **Calidad** | Voz natural; boca creíble en lip-sync |
| **Precio** | Micro-USDC por uso, no suscripción $99/mes |
| **Privacidad** | Mínimo dato personal; idealmente self-host o zero-retention |

**Leyenda:** ✅ encaja · ⚠️ parcial · ❌ requiere cuenta humana

---

## 1. Voz (texto → audio)

### Tier A — x402, sin cuenta (recomendado para ageNFT)

| Servicio | Qué es | Calidad | Precio orientativo | Red | Veredicto |
|----------|--------|---------|-------------------|-----|-----------|
| **[dTelecom x402 Gateway](https://x402.dtelecom.org/)** | TTS + STT + WebRTC; red DePIN | Kokoro-82M; 9 idiomas incl. ES | ~$0.004/min TTS | USDC Base/Solana | ✅ **#1** |
| **[kas402](https://kas402.com/)** | Proxy x402 multi-proveedor | Deepgram Aura-2, OpenAI mini-TTS, ElevenLabs | desde $0.005/llamada | USDC (ver red) | ✅ alternativa |
| **tx402.ai** (si añaden TTS) | Mismo stack que cerebro | — | — | Base | ⚠️ hoy solo LLM |

**dTelecom** encaja mejor con ageNFT:
- Misma filosofía que `run-once` (wallet = acceso)
- Español soportado
- Puede bundle WebRTC + voz para agente conversacional
- DePIN (red descentralizada de comunicación) — narrativa alineada

**Integración:** `@x402/fetch` desde TBA + cap `budget.organs.presence`

### Tier B — Self-hosted (máxima privacidad)

| Proyecto | Qué es | Calidad | Coste | GPU |
|----------|--------|---------|-------|-----|
| **[Kokoro-82M](https://github.com/hexgrad/kokoro)** | TTS open source (mismo modelo que dTelecom) | Muy buena para tamaño | Solo compute | CPU/GPU ligera |
| **Piper** | TTS local ligero | Aceptable | Gratis local | CPU |
| **Coqui XTTS** | Clonación voz | Alta | Compute | GPU media |

**Deploy:** Ollama-style en VPS, **Akash**, o **io.net** — TBA paga AKT/IO por hora de GPU.

**Privacidad:** ✅ texto no sale a terceros si el servidor es vuestro.

### Tier C — Calidad alta pero cuenta humana ❌

| Servicio | Por qué no MVP ageNFT |
|----------|----------------------|
| ElevenLabs directo | Email + API key |
| Cartesia directo | API key |
| OpenAI TTS directo | Cuenta OpenAI |
| Google / Azure TTS | Cuenta cloud |

**Puente:** usar vía **kas402** o **dTelecom x402** — el agente no crea cuenta; el proxy factura por llamada.

---

## 2. Movimiento de imagen — lip-sync (cara habla)

> **Aclaración:** “Tiempo real” aquí = la boca sigue el audio al vuelo (~25–30 fps). **No** es regenerar toda la imagen con IA estilo película cada frame.

### Tier A — Self-hosted open source (recomendado lab)

| Proyecto | Qué hace | Tiempo real | Privacidad | Notas |
|----------|----------|-------------|------------|-------|
| **[MuseTalk](https://github.com/TMElyralab/MuseTalk)** | Audio → mueve boca en retrato | ✅ 30+ fps en GPU | ✅ local | Preparar avatar 1× desde `image` NFT |
| **[LivePortrait](https://github.com/KwaiVGI/LivePortrait)** | Retrato animado por audio/pose | ✅ rápido | ✅ local | Muy buena identidad facial |
| **SadTalker** | Imagen estática → cabeza habla | ⚠️ más lento | ✅ local | Más viejo; más artefactos |
| **Wav2Lip** | Lip-sync clásico | ⚠️ | ✅ local | Más barato GPU; calidad menor |

**Flujo ageNFT:**
```
1. Mint → preparar avatar MuseTalk desde image (una vez, offline)
2. Cerebro responde → dTelecom TTS → audio
3. MuseTalk local → frames vídeo
4. Stream al cliente (WebRTC / WebSocket)
```

**Compute descentralizado:** contenedor Docker MuseTalk en **Akash** (AKT) o GPU **io.net** — alineado con roadmap hosting.

### Tier B — API cloud (cuenta o proxy)

| Servicio | Cuenta | x402 | Notas |
|----------|--------|------|-------|
| **fal.ai MuseTalk** | API key ❌ | ❌ | Buena calidad; envolver en proxy x402 propio si queréis |
| **Hedra / D-ID** | Cuenta ❌ | ❌ | Fácil pero centralizado |
| **HeyGen** | Cuenta ❌ | ❌ | No agente-soberano |

### Tier C — Movimiento en reposo (idle, sin hablar)

| Opción | Tiempo real | Descentralizado | Precio |
|--------|-------------|-----------------|--------|
| **Live2D / Rive** | ✅ procedural | ✅ assets en IPFS | Gratis en cliente |
| **Vídeo bucle IPFS** | ✅ reproducción | ✅ | Generar 1× offline |
| **AnimateDiff / SVD** self-host | ⚠️ lento | ✅ Akash | GPU $$ |

**Recomendación:** idle = **Live2D o bucle IPFS** (barato); hablar = **MuseTalk + TTS x402**.

---

## 3. Emoción y contexto (cejas, tono)

| Pieza | Opción agente-soberano |
|-------|------------------------|
| Tag emoción | Cerebro LLM (`emotion`, `energy`) — ya en diseño presence |
| Tono voz | Kokoro / dTelecom params; o XTTS self-host |
| Cara | Live2D expresiones + emoción; o LivePortrait |

---

## 4. Stack recomendado por fase

### Lab / MVP (máximo alineado ageNFT)

```
TTS:     dTelecom x402 (Base USDC desde TBA)
Lip-sync: MuseTalk self-host (GPU local o Akash)
Idle:    vídeo bucle IPFS o Live2D
Emoción: tags LLM + Live2D (Fase P4)
```

**Coste orientativo conversación 1 min:** ~$0.004 TTS + compute GPU (self-host ≈ marginal)

### Sin GPU propia

```
TTS:     dTelecom x402
Visual:  idle bucle IPFS + solo audio (tier P2, sin lip-sync)
```

Degradación automática — ya en `presence.contexts`.

### Máxima privacidad

```
TTS:     Kokoro self-host en Akash
Lip-sync: MuseTalk mismo servidor
Storage: Arweave / IPFS para assets
```

Cero email. Solo wallets y compute onchain.

---

## 5. Matriz decisión rápida

| Necesidad | Primera opción | Alternativa |
|-----------|----------------|-------------|
| Voz ES, sin cuenta | **dTelecom x402** | kas402 |
| Voz privada total | **Kokoro self-host** | Piper |
| Boca tiempo real | **MuseTalk self-host** | fal.ai (con cuenta) |
| Respirar en reposo | **Live2D / bucle IPFS** | Rive |
| Todo x402 | dTelecom + proxy propio MuseTalk | Fase 5 |
| Calidad máxima sin importar cuenta | ElevenLabs vía kas402 | — |

---

## 6. Integración manifiesto (borrador)

```json
{
  "organs": {
    "presence": {
      "tts": {
        "provider": "dtelecom-x402",
        "x402Endpoint": "https://x402.dtelecom.org/v1/tts",
        "network": "eip155:8453"
      },
      "lipsync": {
        "provider": "musetalk",
        "localGpuRequired": true,
        "hosting": "akash"
      }
    }
  }
}
```

---

## 7. Preguntas abiertas

- [ ] Probe dTelecom x402 TTS desde TBA Unit-1 (como `once:pay`)
- [ ] Benchmark MuseTalk latency en GPU lab vs Akash
- [ ] ¿kas402 acepta USDC Base o solo Solana?
- [ ] ¿Wrapper x402 propio para fal MuseTalk en Fase 5?

---

## Referencias

- [`decentralized-services.md`](decentralized-services.md)
- [`presence-organ.md`](presence-organ.md)
- [x402 directory](https://x402agentic.ai)
- [dTelecom x402](https://x402.dtelecom.org/)
