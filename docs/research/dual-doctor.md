# Dos Doctores — Vitality (Qi) e Hygiene (higiene digital)

> **Estado:** Decisión de diseño · **Jul-2026**  
> Pueden ser **dos módulos** o **un Doctor con dos caras** conectadas.

---

## Por qué dos

El Doctor actual (`doctor-probe`) vigila **si los órganos responden**. Falta la mitad **defensiva**: seguridad, fugas de datos, dependencia de Big Tech.

| Doctor | Metáfora | Pregunta que responde |
|--------|----------|------------------------|
| **Vitality** (Qi / cuerpo energético-físico) | ¿Está vivo y alimentado? | ¿Órganos despiertos, conectados, con saldo y failover? |
| **Hygiene** (higiene digital) | ¿Está limpio y defendido? | ¿Código sano, sin fugas, sin cookies/metadata no consentidas? |

```
        ┌──────────────── Doctor ────────────────┐
        │                                        │
   Vitality (Qi)                          Hygiene (Shield)
   órganos · TBA · caps                   CVE · leaks · ToS
   failover · runway                      cookies · metadatos
        │                                        │
        └────────────── alertas Dashboard ───────┘
```

---

## Doctor Vitality (Qi)

**Misión:** mantener el cuerpo **despierto, alimentado y unido**.

| Tarea | Frecuencia | Acción |
|-------|------------|--------|
| Probe cerebro, memoria, sentidos, presencia | 15 min | OK / failover |
| Saldo TBA USDC + ETH | 15 min | Alerta / DORMANT |
| Runway (gasto vs ingreso) | 1 h | Dashboard |
| Conexiones entre órganos (manifiesto coherente) | diario | Informe |
| Scout: ¿hay proveedor más barato? | diario | Sugerencia transplant |
| Gateways vivos (Telegram, web) | 15 min | Restart / alerta |
| `autoTransplant` cerebro/memoria | según policy | Con caps |

**Implementación hoy:** `doctor-probe.mjs`, cron Hermes, `mainnet-checklist.mjs` — **extender**.

**Servicio remoto opcional (voluntario):** nodo que corre probes 24/7 si el owner no tiene máquina siempre encendida — **no obligatorio**, sin lock-in.

---

## Doctor Hygiene (higiene digital)

**Misión:** defender al ageNFT **fuera del alcance de hackers y Big Tech**; cuidar **consentimiento** de datos.

| Tarea | Frecuencia | Acción |
|-------|------------|--------|
| Auditoría dependencias (`npm audit`, OSV) | semanal | Informe + PR sugerido |
| Revisión rutas que salen datos (brain, STT, OCR) | en cada nuevo órgano | Mapa de flujos |
| Detectar cookies / trackers en dApp | en cada deploy | Fallo CI |
| Verificar que tier E no se activa sin opt-in | continuo | Reflejos |
| Metadatos en requests (IP, User-Agent a terceros) | continuo | Log + toggle minimizar |
| Feeds CVE / seguridad (OSV, GitHub Advisories) | diario | Alerta crítica |
| Memoria: ¿sube PII sin cifrado? | por sync | Bloquear / avisar |
| Contratos `allowedContracts` Reflejos | continuo | Tx sospechosa → pause |

**Fuentes especializadas (borrador):**

- [OSV.dev](https://osv.dev) — vulnerabilidades OSS  
- GitHub Security Advisories  
- Socket.dev / Snyk (tier E opt-in para equipos)  
- Manifiesto `privacy.routes` — qué órganos pueden salir a red  

**No sustituye** auditoría humana profesional antes de mainnet con mucho valor en TBA.

---

## Uno o dos en manifiesto

### Opción A — Un `doctor` con roles (recomendado MVP)

```json
{
  "organs": {
    "doctor": {
      "enabled": true,
      "vitality": {
        "probeIntervalSec": 900,
        "autoFailover": true,
        "autoTransplant": ["brain", "memory"]
      },
      "hygiene": {
        "enabled": true,
        "auditIntervalSec": 604800,
        "blockTierEWithoutConsent": true,
        "metadataMinimization": true,
        "feeds": ["osv", "github-advisories"]
      }
    }
  }
}
```

### Opción B — Dos órganos

`doctor.vitality` + `doctor.hygiene` — budgets separados en Reflejos.

---

## Conexión entre ambos

| Evento Vitality | Hygiene reacciona |
|-----------------|-------------------|
| Failover a tier **E** | Hygiene exige confirmación owner (privacidad) |
| Nuevo proveedor Scout | Hygiene revisa ToS y fugas |
| DORMANT por USDC bajo | Hygiene pausa audits pesados (ahorro) |
| Gateway caído | Vitality alerta; Hygiene revisa si fue ataque |

---

## Dashboard

| Pestaña | Contenido |
|---------|-----------|
| **Vitality** | Semáforo órganos, runway, último transplant |
| **Hygiene** | Última auditoría, fugas detectadas, tier E activos |

---

## Fases

| Fase | Entregable |
|------|------------|
| H0 | Este doc |
| H1 | Vitality ampliado (runway + gateways) |
| H2 | Hygiene: `npm audit` en cron + informe |
| H3 | Mapa de flujos de datos por órgano |
| H4 | dApp sin trackers; verificación CI |
| H5 | Feeds CVE automáticos |
| H6 | Servicio remoto Vitality opt-in |

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`organ-service-tiers.md`](organ-service-tiers.md) | G / D / E |
| [`owner-dashboard.md`](owner-dashboard.md) | Panel |
| [`organ-assembly-catalog.md`](organ-assembly-catalog.md) | Doctor actual |
