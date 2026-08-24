# Memoria y transfer — capas, secretos y reseteo opcional

> **Estado:** Decisión de diseño · **Jul-2026**  
> Pregunta: ¿resetear memoria experiencial al transferir? ¿Qué nunca viaja?

---

## Respuesta corta

| Afirmación | ¿Correcto? |
|------------|------------|
| Passwords, API keys, tokens gateway **nunca** viajan con el NFT | ✅ **Sí — obligatorio** |
| Datos personales del owner **no** deberían viajar por defecto | ✅ **Sí** |
| ¿Ofrecer **reseteo** de memoria experiencial al transferir? | ✅ **Bueno como opción**, no como única vía ni como default ciego |

---

## Tres bóvedas (modelo objetivo)

```
┌─────────────────────────────────────────────────────────┐
│ VAULT 0 — Owner (NUNCA viaja)                          │
│  API keys, manguera, Telegram token, .env, passwords    │
│  PII explícito del owner, notas privadas Dashboard      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CAPA 1 — Personaje / canon (SÍ viaja con el NFT)         │
│  soul.md, skills, URUIRU/visual, manifiesto público      │
│  Reflejos, presupuesto, órganos (sin secrets)           │
│  = "quién es el agente", no "qué vivió contigo"          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CAPA 2 — Memoria experiencial (POLÍTICA al transferir)  │
│  deltas/, L0/L1, cápsula IPFS/toju, experientialHash    │
│  = conversaciones, hechos aprendidos, tono acumulado      │
└─────────────────────────────────────────────────────────┘
```

**Regla de manifiesto:** `agentURI` y JSON público **nunca** contienen Vault 0. Ya acordado; reforzar en Hygiene Doctor.

---

## Políticas de transfer (elegir al vender)

| Política | Comprador recibe |
|----------|------------------|
| **`full`** | M2 + M3 + M1 |
| **`reset-total`** | Solo M1 (URUIRU virgen en vivencias) |
| **`capability-only`** | M1 + **M3** (lista curada; excluir skills sensibles) |

Ver capas y curación M3: [`memory-layers-access.md`](memory-layers-access.md).

**Default recomendado para el producto:** wizard pregunta explícitamente — **sin default silencioso**.

En marketplace / transfer UI mostrar badge:

- 🧠 **Con memoria** — premium / coleccionismo  
- ✨ **Cuerpo limpio** — privacy / nuevo comienzo  

---

## ¿Reseteo es bueno o malo para el proyecto?

### A favor (objetivo)

1. **Privacidad real** — sin reset, vender el NFT es vender tu diario; muchos owners no transferirán nunca.
2. **GDPR / sentido común** — datos personales en deltas son responsabilidad del vendedor.
3. **Dos productos en uno** — mismo URUIRU, con o sin “historia” → más compradores.
4. **Coherente con Vault 0** — si secretos ya no viajan, experiencial también puede ser opt-out.
5. **Narrativa Gespenster** — el **espíritu** (URUIRU) viaja; las **vivencias** pueden quedarse contigo.

### En contra (objetivo)

1. **Diferenciador ageNFT** — “la memoria viaja en 1 tx” es pitch fuerte; reset opcional lo debilita si no se comunica bien.
2. **Valor percibido** — comprador puede sentir estafa si esperaba personalidad acumulada y recibe reset sin aviso.
3. **Complejidad** — pointer IPFS, toju, hash onchain: hay que **invalidar** o **re-mintar pointer** limpio.
4. **Sanitized** es seductor pero **frágil** — LLM puede haber guardado PII en L0 sin que el owner lo vea.

### Veredicto

| Enfoque | Valoración |
|---------|------------|
| Solo memoria full siempre | ❌ Malo — bloquea ventas y viola privacidad |
| Solo reset siempre | ❌ Malo — mata el diferenciador “cuerpo con historia” |
| **Elección explícita full / reset** | ✅ **Bueno** — lo correcto para el proyecto |
| Reset + archivo local para vendedor | ✅ Muy bueno — UX y ética |
| Sanitized automático | ⚠️ Postergar — hasta Hygiene + clasificación fiable |

---

## Implementación (esbozo)

### Pre-transfer (vendedor)

1. Dashboard → **Preparar transferencia**  
2. Elegir: `full` | `reset` | `archive+reset`  
3. Si reset: `npm run memory:export-archive` (local cifrado)  
4. Si reset: rotar / borrar `remote-pointer.json`; subir cápsula vacía o unlink URI  
5. Ejecutar `transfer()` onchain  
6. Checklist confirma `experientialHash` esperado para comprador  

### Manifiesto

```json
{
  "memory": {
    "format": "agenft-memory-capsule/v1",
    "transferPolicy": "owner-choice-at-transfer",
    "defaultForNewOwner": "inherit-or-empty-per-sale",
    "vault0NeverOnChain": true
  }
}
```

### On-chain (futuro opcional)

Campo o evento `MemoryPolicyAtTransfer(full|reset)` en contrato AgeNFT — **prueba** para comprador (confianza).

---

## Qué decir en `transfer.html`

- ✅ Viaja: identidad, TBA, manifiesto, **capa 1** siempre  
- ⚠️ Capa 2 (M2/M3): según política acordada en la venta  
- ⚠️ Biblioteca: solo docs empaquetados (IPFS); local/nube del vendedor no viajan  
- ❌ Nunca: Vault 0  

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`transfer-local-hosting.md`](transfer-local-hosting.md) | Runtime local |
| [`library-storage-policy.md`](library-storage-policy.md) | Biblioteca: IPFS vs local/nube |
| [`dual-doctor.md`](dual-doctor.md) | Hygiene — fugas |
| [`owner-dashboard.md`](owner-dashboard.md) | Wizard transfer |
