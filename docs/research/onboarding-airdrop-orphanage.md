# Onboarding promocional — airdrop, entrenamiento y orfanato

> **Estado:** Idea de producto / economía · **Fase objetivo:** 4–5  
> **Origen:** 2026-07-13 — modelo de promoción y adopción de ageNFT  
> Última revisión: 2026-07-13

---

## Idea en una frase

Invitados **mintean gratis** (o casi) un ageNFT de prueba, lo **entrenan** hasta un nivel mínimo, y entonces **pasa a ser suyo**. Los que nadie reclama van al **orfanato** (marketplace, precio simbólico de adopción).

---

## Flujo propuesto

```
1. INVITACIÓN
   Usuario recibe link / código / allowlist
        ↓
2. MINT DE PRUEBA (trial)
   NFT existe onchain pero en estado "en entrenamiento"
   Owner temporal = contrato de onboarding O usuario invitado (limitado)
        ↓
3. ENTRENAMIENTO (training)
   Usuario chatea, completa misiones, alimenta memoria, recarga TBA mínima
   Barra de progreso → nivel N requerido
        ↓
4a. ÉXITO → PROPIEDAD
   transfer() al usuario · memoria y progreso viajan · ageNFT "adulto"
        ↓
4b. ABANDONO → ORFANATO
   Tras timeout o sin nivel · listado OpenSea / marketplace ageNFT
   Precio simbólico de adopción · nuevo owner empieza con memoria existente
```

---

## Estados del agente (lifecycle)

| Estado | Quién es owner | Qué puede el humano | Qué pasa después |
|--------|----------------|---------------------|------------------|
| `trial` | Contrato onboarding o invitado | Usar con límites; entrenar | Completar nivel o timeout |
| `graduated` | Usuario final | Control total | ageNFT normal |
| `orphan` | Contrato orfanato / marketplace | Solo ver en listing | Adopción por compra simbólica |
| `adopted` | Nuevo comprador | Control total | Igual que graduated |

---

## Nivel de entrenamiento (training level)

No es "machine learning" del modelo — es **progreso del cuerpo digital**:

| Métrica posible | Ejemplo |
|-----------------|---------|
| Conversaciones completadas | ≥ 20 turnos |
| Memoria escrita | ≥ 1 cápsula sync |
| Misiones tutorial | 3/3 checks (budget, transfer dry-run, voz) |
| Tiempo mínimo activo | 48 h desde mint |
| Recarga simbólica TBA | ≥ 0,50 USDC (compromiso) |

**Nivel mínimo para graduación:** configurable por campaña (ej. `trainingLevel >= 3`).

Registro: offchain (`training.json`) + hash opcional en manifiesto (`trainingProgressHash`).

---

## Airdrop / invitación

| Mecanismo | Descripción |
|-----------|-------------|
| **Allowlist** | Direcciones wallet autorizadas a mint trial |
| **Código de invitación** | Un código = un mint trial |
| **Referido** | Owner de ageNFT existente invita → royalty o badge |
| **Cap por campaña** | Máx. N mints trial por semana (control costes) |

**Coste para el proyecto:** gas mint + TBA bootstrap + cerebro trial con cap estricto (Reflejos).

**Coste para el invitado:** opcional micro-recarga TBA para demostrar compromiso.

---

## Orfanato (orphanage)

Agentes que **no graduaron** o **fueron abandonados**:

| Aspecto | Propuesta |
|---------|-----------|
| **Dónde** | OpenSea, marketplace ageNFT propio, página `/orphanage` |
| **Precio** | Simbólico (ej. 0,001 ETH o 1 USDC) — cubre gas, no lucro principal |
| **Narrativa** | "Adopta un agente que nadie terminó de despertar" |
| **Memoria** | Viaja con el NFT — el adoptante hereda personalidad parcial |
| **Reputación** | Marca `orphan-origin` en metadata (opcional, transparente) |

**Contrato orfanato:** custodia temporal del NFT hasta `buy()` o subasta fija.

Relación con **Unit-0 #114** (huérfano lab): caso real de NFT sin owner que recuperó credenciales — inspiración técnica para recovery, no para producto.

---

## Implicaciones onchain

| Pieza | Necesidad |
|-------|-----------|
| Contrato `TrialMint` | Mint con estado `trial`; reglas de graduación |
| `graduate(tokenId, newOwner)` | Cumple checks → transfer |
| `sendToOrphanage(tokenId)` | Timeout o fallo → custodia orfanato |
| `adopt(tokenId)` payable | Compra simbólica desde orfanato |
| Manifiesto | Campo `lifecycle.state`, `training.level` |

Alternativa MVP sin contrato custom: **proceso manual** + metadata JSON en IPFS (Fase 4); contratos en Fase 5.

---

## Economía y anti-abuso

| Riesgo | Mitigación |
|--------|------------|
| Farming de airdrops | 1 trial por wallet; captcha; stake simbólico |
| Drain TBA en trial | Reflejos muy bajos en estado trial |
| Bots en orfanato | Precio simbólico + verificación opcional |
| Memoria basura | Doctor limpia antes de listar en orfanato |

**Ingresos:** adopciones orfanato (marginal); conversión trial→graduated (usuario recarga TBA); visibilidad (marketing).

---

## Relación con otras piezas

| Pieza | Enlace |
|-------|--------|
| ERC-8004 | Reputación del agente post-graduación; orfanato visible en directorio |
| Colaboración ageNFT | Agentes graduados contratan a otros |
| Presencia | Trial muestra tier P1–P2; graduated desbloquea P3–P4 |
| Fase 4 producto | Mint wizard incluye modo "invitación trial" |

---

## Preguntas abiertas

- [ ] ¿Training onchain (contrato) o offchain (servidor) para MVP?
- [ ] ¿Memoria de trial se resetea al graduar o viaja íntegra?
- [ ] ¿Orfanato en OpenSea Collection separada o filtro en marketplace propio?
- [ ] ¿Royalty al creador en adopción orfanato?
- [ ] ¿Invitación = soulbound badge SBT aparte del NFT?

---

## Fase roadmap

| Fase | Entregable |
|------|------------|
| 4.2 | Landing "prueba un ageNFT" — trial offchain sin mint |
| 4.6 | Mint trial + training UI + graduación manual |
| 5.x | Contrato TrialMint + orfanato onchain + OpenSea collection |
