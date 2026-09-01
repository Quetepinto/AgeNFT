# Decisión — Dónde vive el runtime (Hermes) y orden del wizard

> **Estado:** Aprobado · **Fecha:** 2026-09-01  
> **Prioridad producto:** **Hosting + instalación Hermes ANTES que Telegram** (y antes que cualquier gateway).

---

## Regla de oro

```
Adquieres el cuerpo onchain (NFT + TBA + manifiesto)
        ↓
Eliges DÓNDE opera (hosting)          ← PASO 1 obligatorio
        ↓
Instalas Hermes (Nous) + runtime      ← PASO 2
        ↓
Verificas cerebro + owner gate          ← PASO 3
        ↓
Recién entonces: gateways (Telegram…)  ← PASO 5+ (P001)
```

**Sin host operativo no hay agente vivo** — solo activos onchain dormidos.

Telegram, Matrix, chat web son **cables** al motor ya instalado. Cablear Telegram antes de tener **dónde** corre Hermes genera cables sueltos (precedente P001 lo asume host resuelto).

---

## Qué viaja onchain vs qué instala el owner

| Pieza | ¿Viaja con NFT? | Notas |
|-------|-----------------|-------|
| NFT, TBA, USDC/ETH | ✅ | Misma TBA tras transfer |
| Manifiesto, soul, URUIRU | ✅ | pointer onchain |
| **Hermes (Nous) + procesos** | ❌ | Por host / operador |
| **Vault 0** (tokens, keys) | ❌ | Nuevo owner = nuevo Vault 0 |
| Memoria en disco local | ❌ | Export IPFS/toju antes de vender |

Ver [`transfer-local-hosting.md`](../research/transfer-local-hosting.md).

---

## Inventario — qué ya teníamos documentado

| Doc | Contenido hosting |
|-----|-------------------|
| [`transfer-local-hosting.md`](../research/transfer-local-hosting.md) | Tabla local / Akash-VPS / SaaS; wizard post-transfer (paso 2 = hosting) |
| [`runtime-adapters.md`](../research/runtime-adapters.md) | `runtime.engine`, `runtime.hosting` en manifiesto |
| [`organ-service-tiers.md`](../research/organ-service-tiers.md) | Tier **G** local · **D** Akash/x402 · **E** VPS gestionado SaaS |
| [`mint-configuration-wizard.md`](../backups/mint-configuration-wizard.md) | Paso 2 motor+hosting al mint (borrador UX) |
| [`owner-dashboard.md`](../research/owner-dashboard.md) | Dashboard canonical; wizard mudanza |
| [`nomenclatura-hermes-nous.md`](nomenclatura-hermes-nous.md) | Hermes (Nous) = arnés MVP |
| Manifiesto `unit-mainnet.json` | `"hosting": { "primary": "local", "fallbacks": ["akash", "vps"] }` |
| Schema `ageNFT-v1-provisional.schema.json` | `primary`: local · vps · akash · modal · docker |
| [`NOTES.md`](../NOTES.md) | Prioridad infra **cripto-native** (Akash, x402) sobre VPS tradicional |

**Gap hasta hoy:** no había un doc único con **orden de prioridad** ni especificación del wizard «contratar Akash en 1 clic». Este doc lo cierra.

---

## Opciones de hosting (dónde vive Hermes + ageNFT)

### Tabla por tier y facilidad wizard

| ID | Nombre | Tier | Descentralizado | Wizard MVP | TBA paga | Notas |
|----|--------|------|-----------------|------------|----------|-------|
| **local** | Tu máquina | G | — | Manual | gas only | Dev, prueba owner técnico |
| **vps** | VPS clásico (OVH, Hetzner…) | D/E | ❌ | Script SSH + plantilla | USDC + factura VPS | **Hoy Unit-Mainnet #1** |
| **akash** | Akash Network | **D** | ✅ | **Objetivo 1-clic** | AKT + USDC | CPU runtime; GPU limitado |
| **docker** | Contenedor propio | D | ⚠️ | Compose template | — | Quien ya tiene host |
| **modal** | Modal / serverless | E/D | ⚠️ | Futuro | — | En schema, sin spike |
| **managed** | Hosting ageNFT SaaS | E | ❌ | Signup | Suscripción | Producto futuro opcional |

**Decisión infra:** para wizard «descentralizado fácil», candidato **principal = Akash** (tier D, alineado con TBA y [`organ-service-tiers.md`](../research/organ-service-tiers.md)). VPS clásico queda como **opción explícita** (muchas personas ya tienen OVH) — no sustituye Akash en narrativa soberana.

### ¿Akash en el wizard?

**Sí — objetivo de producto**, fase posterior al MVP manual:

```
Wizard paso «Dónde vive tu agente»
  ○ Mi VPS (pego IP / SSH)     → script cloud-init + hermes:install
  ● Akash (recomendado D)      → SDL template + wallet AKT/TBA
  ○ Solo local (avanzado)      → checklist manual
  ○ Hosting gestionado (lista) → futuro tier E
```

**Estado implementación Akash 1-clic:** 📐 diseño — falta `deploy-akash.mjs` + plantilla SDL + Doctor probe despliegue.

Referencias previas: `migrationProfile.runtimeDefault: "akash-stub"`, fallbacks en manifiesto, NOTES «Akash útil CPU runtime».

---

## Instalación Hermes — qué implica en cada host

Tras elegir hosting, **mismo contenido**, distinto empaquetado:

| Paso | Acción | Comando / artefacto |
|------|--------|---------------------|
| H1 | Node 20+ + repo ageNFT | `git clone` + `cd runtime && npm install` |
| H2 | CLI **Hermes (Nous)** | Instalar [`hermes-agent`](https://github.com/NousResearch/hermes-agent) |
| H3 | Adapter ageNFT | `npm run hermes:install` → skill + cron en `~/.hermes` |
| H4 | Wallet operadora | `AGENFT_OPERATOR_ADDRESS` = ownerOf |
| H5 | Verificación | `npm run hermes:verify` + `npm run owner:gate` + `npm run transfer:vigilante` |
| H6 | Servicio persistente | systemd / tmux / Akash service |

**Un runtime activo por ageNFT operado** (MVP). Mismo host puede migrarse; transfer = **nuevo** host del comprador.

Puentes MVP (`telegram-unit-mainnet-bot` directo) **no sustituyen** H2–H6 en visión producto — solo atajo temporal en VPS ya existente.

---

## Wizard — orden por importancia (canónico)

Aplica a **post-transfer**, **post-compra** y **activación tras mint**.

| # | Paso | Bloqueante | Entregable |
|---|------|------------|------------|
| **0** | Conectar wallet · verificar `ownerOf` | ✅ | Owner confirmado |
| **1** | **Elegir hosting** (dónde vive Hermes) | ✅ | `runtime.hosting.primary` + URL/SSH/deploy id |
| **2** | **Instalar Hermes + runtime** en ese host | ✅ | `hermes:verify` OK |
| **3** | Owner gate + Vigilante base | ✅ | `owner:gate` + `transfer:vigilante` sin 🔴 críticos |
| **4** | TBA / USDC · cerebro tx402 | ✅ p/ chat real | `budget` OK, turno probe/pay |
| **5** | Memoria (si transfer / política venta) | según venta | URI IPFS/toju o reset |
| **6** | **Gateways — Telegram** (P001) | para chat móvil | Bot **nuevo**, token Vault 0 |
| **7** | Otros gateways (Matrix, web…) | opcional | wiring |
| **8** | Doctor cron + chat público | opcional | `hermes:doctor` periódico |

**Telegram = paso 6, no paso 1.**

### Mint wizard (reordenar borrador)

El borrador en [`mint-configuration-wizard.md`](../backups/mint-configuration-wizard.md) ya tenía paso 2 = motor+hosting. Ajuste narrativo:

- Paso 5 chat (Telegram) → **después** de pantalla «Despliega tu runtime» post-mint.
- Post-mint landing: **«Activar hosting»** antes de «Conecta Telegram».

---

## Relación con Telegram (P001)

| Tema P001 | ¿Depende de hosting? |
|-----------|----------------------|
| new-bot-only | No cambia — pero bot se configura **en el host del paso 1** |
| owner gate | Corre en `runTurn` del host activo |
| revocar BotFather | Ex-owner apaga **su** host (paso 1 vendedor) |
| Vigilante | Debe conocer host Hermes + config gateway (extensión pendiente) |

Actualizar mental model: **P001 = capa gateway sobre runtime ya desplegado**.

---

## Fases de implementación

| Fase | Entregable | Estado |
|------|------------|--------|
| **H0** | Este doc + orden wizard | ✅ |
| **H1** | Wizard UI paso 1–3 (hosting + verify) en dashboard | ⏳ |
| **H2** | Plantilla VPS cloud-init (OVH/Hetzner) | ⏳ |
| **H3** | Akash SDL template + `deploy-akash.mjs` | ⏳ |
| **H4** | TBA → pago deploy Akash (Reflejos) | ⏳ Fase posterior |
| **H5** | Gateways wizard (Telegram P001) | ⏳ después H1–H3 |
| **H6** | Hosting gestionado tier E (opt-in) | 💡 idea |

---

## Mensajes usuario (copy)

**Tras comprar NFT:**  
«Tu ageNFT ya existe onchain. El siguiente paso es **elegir dónde vivirá** (VPS o Akash) e **instalar Hermes**. Telegram viene después.»

**No enviar al comprador primero:** solo enlace al bot — sin host propio el bot seguiría en máquina ajena.

---

## Docs relacionados

- [`nomenclatura-hermes-nous.md`](nomenclatura-hermes-nous.md)
- [`precedents/P001-telegram-handle-transfer.md`](precedents/P001-telegram-handle-transfer.md)
- [`transfer-local-hosting.md`](../research/transfer-local-hosting.md)
- [`runtime-adapters.md`](../research/runtime-adapters.md)
- [`dashboard-onboarding-chat.md`](dashboard-onboarding-chat.md)
