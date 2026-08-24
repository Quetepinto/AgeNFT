# Dashboard / panel del owner — configuración ageNFT

> **Estado:** Decisión de diseño · **Jul-2026**  
> Hay **muchas** cosas que configurar; el acceso debe ser **simple, coherente y siempre a mano** en cualquier hábitat.

---

## Principio

```
Un ageNFT = muchos órganos × muchos gateways × presupuestos × opcionales
                    ↓
         Un solo lugar mental: el Dashboard
                    ↓
    Panel visual (esquema cuerpo) + formularios + tesoro / gastos
                    ↓
    Accesible desde web, Telegram, wallet, embed…
```

**Panel visual:** el esquema humanoide de Lab Studio evoluciona al **Organ Studio** del Dashboard — mismo concepto de módulos y cables, filtrado a opciones de producto. Ver [`lab/runtime-wiring.md`](lab/runtime-wiring.md) § Decisión de producto.

**Owner** (quien tiene el NFT) configura. **Visitantes** ven ficha pública sin controles sensibles.

---

## Qué se configura (v1)

| Sección | Ejemplos |
|---------|----------|
| **Tesoro** | Saldo TBA, fondear, historial |
| **Presupuesto / Reflejos** | Caps cerebro, gas, sentidos, presencia |
| **Gastos (desglose)** | **Cada órgano · proveedor · tier G/D/E · hoy / mes / %** — ver [`organ-service-tiers.md`](organ-service-tiers.md) |
| **Ingresos externos** | Solo terceros x402 — **no** confundir con gasto del owner — [`voice-external-income.md`](voice-external-income.md) |
| **Cerebro** | Modelo, fallbacks, modo hose |
| **Memoria** | Sync IPFS/toju, export, privacidad |
| **Sentidos** | STT, OCR, visión, idiomas |
| **Presencia** | ON/OFF, tier, TTS, idle, lip-sync — [**opcional**](presence-optional.md) |
| **Gateways** | Telegram, Nostr, Matrix, web |
| **Doctor Vitality (Qi)** | Órganos vivos, TBA, runway, failover — [`dual-doctor.md`](dual-doctor.md) |
| **Doctor Hygiene** | CVE, fugas datos, cookies, tier E — [`dual-doctor.md`](dual-doctor.md) |
| **Órganos G/D/E** | Gratis / descentralizado / fácil por órgano |
| **Identidad** | Manifiesto, URUIRU/visual, transfer |
| **Runtime** | Host, session keys (futuro) |

---

## Dónde vive el Dashboard

### Fuente de verdad: **dApp web**

URL estable por agente, ej.:

```
https://quetepinto.github.io/AgeNFT/agent/1/settings
```

(o `dashboard.html?id=1` — una sola convención en todo el proyecto)

La dApp ya existe como ficha pública; el Dashboard es la **capa owner** (wallet conectada = owner del token #1).

### Acceso desde cada hábitat (siempre visible)

| Hábitat | Acceso al Dashboard | UX |
|---------|---------------------|-----|
| **dApp ficha** | Botón ⚙️ **Ajustes** en header (owner) | Misma pestaña o `/settings` |
| **dApp chat** | ⚙️ fijo en barra superior | No enterrar en menús |
| **Telegram** | Comando `/ajustes` o `/dashboard` → enlace web | Bot no replica todo el panel |
| **Hermes CLI** | `npm run dashboard:open 1` abre URL | Para operadores |
| **Wallet / MetaMask** | Link en “Apps” del NFT → dApp settings | Deep link |
| **Widget embed** | Icono ⚙️ pequeño → nueva pestaña | Solo owner autenticado |
| **OpenSea / explorer** | Solo ficha pública; settings vía link externo en descripción | P0 |

**Regla:** en **cualquier medio donde interactúes con el agente**, a ≤2 clics está **Ajustes → Dashboard web**. Telegram y otros no duplican el panel completo — **enlazan** al canonical.

---

## Modelo de permisos

| Rol | Ve | Puede cambiar |
|-----|-----|---------------|
| **Visitante** | Ficha, chat si abierto, TBA en lectura | Nada onchain |
| **Owner** | Todo + Dashboard | Manifiesto off-chain, toggles runtime, txs TBA |
| **Colaborador** (futuro) | Subset según `collaborators.trusted` | Caps limitados |

Conectar wallet ≠ owner hasta `ownerOf(tokenId) === address`.

---

## Cambios: off-chain vs on-chain

| Tipo | Dónde | Ejemplo |
|------|-------|---------|
| **Preferencias runtime** | Servidor / local + export manifiesto | Presencia ON/OFF, idioma |
| **Manifiesto público** | IPFS / HTTPS + hash | Órganos, budgets |
| **On-chain** | Tx firmada | Fondeo TBA, transfer, futuro `setAgentURI` |

El Dashboard muestra **qué requiere tx** antes de confirmar.

---

## Sección Economía (obligatoria en producto final)

El coste **se acumula** — aunque el default sea tier **G** (gratis), cada órgano en tier **D** suma microusos + gas + fees.

```
GASTOS (owner / TBA)          INGRESOS (solo externos)
─────────────────────         ─────────────────────────
cerebro    tx402.ai  D  $0.42   voice x402      $0.00
memoria    local     G  $0.00   tips            $0.05
doctor     probe     G  $0.00   terceros        $0.00
gas        Base          $0.02
─────────────────────
TOTAL hoy: $0.44              TOTAL mes ingreso: $0.05
RUNWAY: 11 días @ perfil conversacional
```

+ proyección si el owner activa tier **D** (Akash, dTelecom…) o **E** (SaaS).

---

```
┌─────────────────────────────────────────┐
│  URUIRU  Unit-Mainnet #1    [⚙ Ajustes] │  ← siempre
├─────────────────────────────────────────┤
│  Chat / ficha / contenido del hábitat    │
├─────────────────────────────────────────┤
│  TBA · USDC · estado: ACTIVO / DORMANT   │  ← resumen 1 línea
└─────────────────────────────────────────┘

/settings (solo owner):
  [ Tesoro ] [ Presupuesto ] [ Cerebro ] [ Memoria ]
  [ Sentidos ] [ Presencia ⓘ opcional ] [ Gateways ] [ Doctor ]
```

---

## Relación con Presencia opcional

Toggle destacado en Dashboard:

> **Presencia viva** — URUIRU habla y se mueve  
> [ OFF · idle solo · voz · voz+boca ]  
> _Se apaga sola si USDC bajo o cap agotado_

Ver [`presence-optional.md`](presence-optional.md).

---

## Fases de implementación

| Fase | Entregable |
|------|------------|
| D0 | Este doc + botón ⚙️ en dApp → placeholder |
| D1 | `/settings` lectura: TBA, budget export, estado órganos |
| D2 | Toggles off-chain (presence, senses) → runtime |
| D3 | Telegram `/ajustes` → link |
| D4 | Edición manifiesto + re-export con confirmación |
| D5 | Txs desde UI (fondeo, transfer asistido) |

**Orden global:** Dashboard **D1** entra pronto (tras integración Bloque 3), crece en paralelo a Sentidos y Presencia.

---

## Docs relacionados

| Doc | Tema |
|-----|------|
| [`presence-optional.md`](presence-optional.md) | Avatar opcional |
| [`senses-organ.md`](senses-organ.md) | Escucha y visión |
| [`presence-context-layers.md`](../backups/presence-context-layers.md) | Hábitats |
| [`dapp-surfaces-wallet.md`](../backups/dapp-surfaces-wallet-20260715-ens.md) | Superficies web (backup) |
