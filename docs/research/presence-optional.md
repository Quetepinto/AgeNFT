# Presencia — avatar, movimiento y voz (opcional)

> **Estado:** Decisión de diseño · **Jul-2026**  
> **Bloque 4** del roadmap = **solo Presencia** (no Sentidos, no integración base).  
> Complementa [`presence-voice-stack.md`](../backups/presence-voice-stack.md) y [`presence-context-layers.md`](../backups/presence-context-layers.md).

---

## Principio

La **Presencia** (URUIRU que respira, habla, mueve la boca) es un **órgano opcional** del ageNFT.

| Sin Presencia activa | Con Presencia activa |
|---------------------|----------------------|
| Agente funciona igual: cerebro, memoria, TBA, chat texto | + TTS, idle, lip-sync, estética viva |
| PNG estático (P0) | P1–P4 según tier y hábitat |
| Menor gasto USDC | Caps `budget.organs.presence` |

**Un NFT “mudo y quieto” sigue siendo un ageNFT válido.** Presencia es capa expresiva, no requisito E1.

---

## Control: voluntario + automático

### Activación voluntaria (owner)

El **owner** decide en el **Dashboard** (ver [`owner-dashboard.md`](owner-dashboard.md)):

| Control | Efecto |
|---------|--------|
| `presence.enabled` | ON/OFF global del órgano |
| `presence.tierMax` | Techo P0–P4 (idle, voz, lip-sync…) |
| Por hábitat | Ej.: voz ON en web, OFF en Telegram |
| `presence.tts.enabled` | Solo audio sin animación |
| `presence.visual.enabled` | Idle / boca sin TTS |

Cambios sensibles pueden requerir firma wallet (owner del NFT).

### Desactivación automática (Reflejos + contexto)

Presencia se **apaga sola** cuando no hay condiciones — sin intervención del owner:

| Condición | Comportamiento |
|-----------|----------------|
| `presence.enabled: false` en manifiesto | Siempre P0 estático |
| TBA USDC &lt; piso operativo | DORMANT → sin TTS ni GPU |
| Cap diario `budget.organs.presence` agotado | Degradar: lip-sync → idle → estático |
| Cap global agente en DORMANT | Solo cerebro mínimo / doctor |
| Hábitat no soporta (OpenSea, wallet) | P0 forzado — no es “error” |
| Gateway sin audio (Telegram texto) | Icono; no intentar TTS en canal |
| Sin GPU / WebRTC en cliente | Degradar a audio-only o texto |
| Doctor detecta servicio TTS caído | Failover o silencio + notificación Dashboard |

**Simetría con cerebro:** igual que Reflejos ponen el cerebro en DORMANT, Presencia tiene su propio circuito de degradación.

---

## Qué incluye el Bloque 4 (Presencia)

Todo lo **visual y sonoro de salida** del avatar — separado del resto:

| # | Pieza | Notas |
|---|-------|-------|
| P1 | Estética web Gespenster + idle URUIRU | CSS, textura, respiración |
| P2 | TTS x402 (habla) | dTelecom, TBA paga |
| P3 | Boca / movimiento artístico | Frames Gespenster, no ML obligatorio |
| P4 | Lip-sync ML | Solo si el arte lo pide — **opcional dentro de opcional** |
| P5 | Preview loop IPFS | OpenSea / marketplace P1 |

**No incluye:** STT, OCR, visión (→ Bloque 5 Sentidos) ni cableado base (→ Bloque 3).

---

## Manifiesto (borrador)

```json
{
  "organs": {
    "presence": {
      "enabled": false,
      "ownerToggle": true,
      "tierMax": "P2",
      "autoDegrade": true,
      "tts": { "enabled": true, "provider": "dtelecom-x402" },
      "visual": { "enabled": true, "idleMode": "css-breathe", "lipSync": false },
      "contexts": {
        "app-full": { "maxTier": "P4", "allowTts": true },
        "chat-gateway": { "maxTier": "icon", "allowTts": false },
        "marketplace-external": { "maxTier": "P0", "allowTts": false }
      }
    }
  }
}
```

`enabled: false` por defecto en mints futuros hasta que el owner active — **opt-in explícito**.

---

## Tiers (recordatorio)

| Tier | Qué ve el usuario |
|------|-------------------|
| P0 | Imagen estática |
| P1 | + bucle corto / idle |
| P2 | + voz TTS |
| P3 | + boca sincronizada (artística o ML) |
| P4 | Conversación fluida + máximo movimiento |

El **contexto** (hábitat) puede limitar el tier aunque el owner pida más.

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`senses-organ.md`](senses-organ.md) | Entrada: escucha, visión (Bloque 5) |
| [`owner-dashboard.md`](owner-dashboard.md) | Panel de configuración |
| [`lab/next-steps.md`](lab/next-steps.md) | Orden global 1→7 |
