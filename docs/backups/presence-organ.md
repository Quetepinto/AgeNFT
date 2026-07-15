# Órgano Presencia (presence) — requisito de infraestructura

> **Estado:** Borrador · **Fase objetivo:** 4.5  
> **Decisión:** La cara visible del ageNFT es un órgano aparte del motor (Hermes/Eliza).  
> Última revisión: 2026-07-13

---

## Qué es

**Presencia** = cómo se **ve y se oye** el personaje del NFT: imagen, movimiento en reposo, voz, sincronización labial y emoción según el contexto.

No es el cerebro (eso es `brain`). El cerebro produce texto; Presencia lo **muestra** al humano.

```
Cerebro (texto + emoción)  →  Servidor de Presencia  →  Pantalla / altavoz del usuario
```

---

## Principios de diseño

1. **La imagen del NFT es sagrada** — se parte de `image` / `portrait` del manifiesto; no se inventa otro personaje.
2. **Tres modos en cascada** — si el modo alto falla, baja al siguiente (nunca pantalla negra).
3. **Movimiento continuo por defecto** — vídeo en bucle o animación ligera cuando no habla.
4. **Tiempo real solo si se puede** — según presupuesto (Reflejos), GPU y red.
5. **Motor agnóstico** — Hermes y Eliza envían el mismo payload a Presencia.

---

## Modos de presencia (tiers)

| Tier | Nombre | Qué ve el usuario | Requisitos |
|------|--------|-------------------|------------|
| **P0** | `static` | Foto fija | Cualquier dispositivo |
| **P1** | `idle-loop` | Personaje se mueve en bucle (respira, parpadea) | Vídeo WebM/IPFS o Live2D/Rive |
| **P2** | `tts` | Foto o bucle + **voz** (texto a voz) | API TTS + presupuesto `organs.presence` |
| **P3** | `lipsync` | Boca sigue el audio | GPU local o API (MuseTalk, Wav2Lip, LivePortrait) |
| **P4** | `emotion` | Cejas/postura según emoción del cerebro | Live2D/Rive + tags LLM (`emotion`, `energy`) |

### Selector automático (`liveMode: auto`)

```
SI budget.presence OK Y GPU OK Y usuario quiere calidad
   → P3 o P4
SI NO
   → P1 idle-loop + audio (P2)
SI NO NO
   → P0 static + subtítulos
```

---

## Pipeline técnico (borrador)

```
1. Cerebro responde → { text, emotion, energy }
2. TTS (texto a voz) → audio + timestamps
3. Capability check (budget, GPU, red)
4. Renderer:
   - live2d  → capas animadas (idle procedural aleatorio)
   - loop    → vídeo IPFS pregenerado (1× con IA imagen-a-vídeo)
   - lipsync → modelo sobre portrait base
5. Stream al cliente: WebRTC / HLS / WebSocket frames
```

### Servidor de Presencia (pieza nueva)

- Carpeta futura: `presence/` o `runtime/presence-server/`
- Entrada: eventos del runtime (`brain.response`, `emotion`)
- Salida: stream visual + audio
- **No** vive dentro de Hermes — es microservicio acoplado por manifiesto

---

## Generación del asset idle (una vez)

1. Partir de `image` del NFT
2. Generar clip 3–5 s (Haiper, Kling, Runway…) **offline**
3. Subir a IPFS → `idleAsset`
4. Reproducir en bucle en cliente

Alternativa **no-vídeo**: Live2D / Rive — capas de la misma imagen, movimiento procedural + aleatorio (parpadeo, mirada).

---

## Voz y emoción

| Pieza | Fuente | Pago |
|-------|--------|------|
| TTS | ElevenLabs, OpenAI, Cartesia… | x402 desde TBA si disponible |
| Emoción | Tag del LLM en respuesta estructurada | Incluido en cerebro |
| Lip-sync | MuseTalk / Wav2Lip local o API | `budget.organs.presence` |

El cerebro debe poder devolver:

```json
{
  "text": "Hmm, eso me preocupa…",
  "emotion": "concerned",
  "energy": 0.4
}
```

---

## Manifiesto — bloque `organs.presence`

Ver schema `presenceOrgan` y ejemplo en `unit-1-lab.json`.

Campos clave:

| Campo | Descripción |
|-------|-------------|
| `portrait` | URI imagen base (normalmente = `image` del manifiesto) |
| `idleMode` | `static` \| `loop-video` \| `live2d` \| `rive` |
| `idleAsset` | IPFS del bucle o paquete Live2D |
| `liveMode` | `auto` \| `off` \| `force-live` |
| `maxTier` | Techo de calidad (`tts`, `lipsync`, `emotion`) |
| `renderer.endpoint` | URL del servidor de presencia |
| `tts.provider` | Proveedor texto-a-voz |

---

## Presupuesto

Añadir `budget.organs.presence` con caps por hora/día (TTS + lip-sync API son costosos).

Reflejos pueden forzar tier P0 si se supera cap.

---

## Fases de implementación

| Paso | Entregable | Esfuerzo orientativo |
|------|------------|----------------------|
| P0 | Mostrar `image` en dApp | 1 día |
| P1 | Vídeo idle IPFS en bucle | 2–3 días |
| P2 | TTS + reproductor audio | 2–3 días |
| P3 | Lip-sync básico | ~1 semana |
| P4 | Live2D idle + emoción | ~2 semanas |
| P5 | Selector `auto` + integración Reflejos | ~1 semana |

→ Roadmap: [`development-roadmap.md`](../architecture/development-roadmap.md) Fase 4.5

---

## Referencias

- [`digital-body.md`](../architecture/digital-body.md) — anatomía del cuerpo
- [`development-roadmap.md`](../architecture/development-roadmap.md) — Fase 4.5
- [`ageNFT-v1-provisional.schema.json`](../manifest/ageNFT-v1-provisional.schema.json) — `presenceOrgan`
