# Modelo de servicio por órgano — 3 niveles (G · D · E)

> **Estado:** Decisión de diseño · **Jul-2026**  
> Aplica a servicios que **no exigen registro humano** (email, OAuth, API key de persona).

---

## Principio

En un producto final, **los costes se acumulan** — cerebro + memoria + sentidos + presencia + doctor + gas + hosting. El Dashboard debe mostrar **cada línea**.

Aunque busquemos **gratis por defecto**, la descentralización y la privacidad suelen implicar **pago por uso + fees**. Por eso cada órgano declara **tres niveles** en el manifiesto:

| Nivel | ID | Qué es | Cuándo |
|-------|-----|--------|--------|
| **Gratis** | `G` | OSS local, probes, lectura directorios, límites generosos | **Default** |
| **Descentralizado / pago por uso** | `D` | x402, IPFS, Akash, io.net, toju — TBA paga microusos | Owner elige privacidad/soberanía |
| **Fácil** | `E` | SaaS con cuenta humana, centralizado, “funciona ya” | Opt-in; usuario acepta menos privacidad |

```
                    ┌─ G (gratis) ─────────── default
Órgano ─────────────┼─ D (descentralizado) ── TBA / x402 / Akash
                    └─ E (fácil) ──────────── opt-in explícito
```

**Regla:** subir de G → D → E siempre con **toggle en Dashboard** y aviso de coste/privacidad.

---

## Akash y redes similares (nivel D)

| Uso | Órgano | Notas |
|-----|--------|-------|
| **Runtime Hermes** en contenedor | `runtime_host` | TBA paga AKT; post-transfer despliega igual |
| **Cerebro local** (Ollama, etc.) | `brain` | GPU Akash / io.net cuando x402 no basta |
| **TTS / lip-sync** self-host | `presence` | Kokoro, MuseTalk en GPU alquilada |
| **STT / Whisper** | `senses` | Sin enviar audio a SaaS |
| **Doctor Hygiene** scans | `doctor.hygiene` | Contenedor aislado para auditoría |

No sustituye todo — complementa x402 cuando el owner prioriza **privacidad** sobre **comodidad**.

---

## Matriz por órgano (borrador)

### Cerebro

| G | D | E |
|---|---|---|
| Probe 402 sin pagar; modo DORMANT lectura | tx402.ai, kas402 — TBA/x402 | OpenAI/Anthropic vía **manguera** owner (no TBA) |

### Memoria

| G | D | E |
|---|---|---|
| Solo `data/` local | toju, w3stor, IPFS pin — x402 | Google Drive / Notion (❌ no manifiesto público) |

### Sentidos (STT, OCR, visión)

| G | D | E |
|---|---|---|
| OCR Tesseract local; sin mic | dTelecom x402; Whisper en Akash | Google Vision / Whisper API cuenta |

### Presencia (TTS, animación)

| G | D | E |
|---|---|---|
| PNG estático; idle CSS | dTelecom x402 TTS; Kokoro self-host Akash | ElevenLabs directo |

### Runtime / hosting

| G | D | E |
|---|---|---|
| Cron local en máquina owner | **Akash**, io.net — TBA | VPS gestionado con cuenta |

### Scout

| G | D | E |
|---|---|---|
| Leer x402.org /models gratis | Custom scraper self-host | ConvoHunter suscripción |

### Doctor (ver [`dual-doctor.md`](dual-doctor.md))

| G | D | E |
|---|---|---|
| `doctor-probe` OSS local | Probes + informes IPFS | Servicio remoto opcional (vitality/hygiene) |

### Gateways chat

| G | D | E |
|---|---|---|
| — | Nostr, Matrix (soberano) | Telegram (bot token; runtime-only) |

---

## Manifiesto — patrón `tierPreference`

```json
{
  "organs": {
    "brain": {
      "tierPreference": ["G", "D", "E"],
      "primary": { "tier": "D", "provider": "tx402.ai" },
      "fallbacks": [
        { "tier": "G", "mode": "probe-only" },
        { "tier": "E", "mode": "hose", "note": "clave owner, no TBA" }
      ]
    }
  }
}
```

Doctor hace **failover** G → D → E solo si owner lo permite por órgano.

---

## Dashboard — desglose de gastos (obligatorio)

Cada fila: **órgano · proveedor · tier · hoy · mes · % del total**

| Ejemplo | |
|---------|--|
| cerebro · tx402.ai · D | $0.003 / $0.42 / 68 % |
| memoria · local · G | $0 / $0 / 0 % |
| doctor · probe · G | $0 / $0 / 0 % |
| gas · Base | $0.001 / $0.02 / 3 % |

+ **proyección runway** + alerta si un órgano E consume sin opt-in.

Ver [`owner-dashboard.md`](owner-dashboard.md).

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`dual-doctor.md`](dual-doctor.md) | Doctor Vitality + Doctor Hygiene |
| [`voice-external-income.md`](voice-external-income.md) | Quién paga x402 al agente |
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Catálogo servicios |
