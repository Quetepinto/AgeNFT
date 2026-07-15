# Visión — ageNFT dentro de Star Atlas

> ¿Puede un ageNFT "correr dentro del juego" y sustituir crew NFTs?
> Tres niveles de integración, de lo posible hoy a la locura oficial.
>
> Última revisión: 2026-07-12

---

## La locura (y por qué no es tan descabellada)

En Star Atlas hoy:

```
Wallet                    SAGE (on-chain)
──────                    ───────────────
cNFT CREW (SACREW)   →    import → hangar CSS → loadFleetCrew
NFT Ships            →    escrow → flotas → mining/craft/trade
Humano               →    UI / Atom / scripts → firma txs
```

La crew son **NFTs comprimidos** con stats que habilitan operaciones de flota. Son intercambiables, mercado, cargo en naves. **Ya son activos onchain**, no personajes offchain.

Un ageNFT es **otro NFT con wallet, memoria y autonomía**. La pregunta no es "¿puede existir?" sino **"¿en qué capa se conecta al juego?"**

---

## Tres niveles de integración

### Nivel 1 — Agente pilota el juego (HOY, sin permiso de devs)

```
ageNFT → TBA Solana → import crew/ships → scripts SAGE → loops autónomos
```

**Esto ya es Hermes.** El ageNFT no *es* la crew; **opera** la cuenta que tiene crew y ships. Desde fuera parece un jugador autónomo.

| Qué | Estado |
|-----|--------|
| Import crew (`addCrewToGame`) | ✅ script existe |
| Flotas, mining, craft, market | ✅ scripts parciales |
| Memoria economía | ✅ wiki + intel |
| NFT ageNFT mintado | 🔜 ageNFT project |

**Percepción in-game:** indistinguible de un jugador bot. No aparece como "crew especial" en UI — aparece como **acciones onchain**.

---

### Nivel 2 — ageNFT como "super manager" (sin cambios en SAGE)

```
ageNFT expone servicios x402:
  "Gestiona mi flota" / "¿Debo minar hoy?" / "Ferry crew por mí"
Otros jugadores delegan wallet o activos → ageNFT opera → fee → TBA
```

El ageNFT **no entra al slot de crew** — es **consultor/piloto mercenario** del ecosistema Star Atlas. Ingresos + reputación sin tocar el programa Crew de Star Atlas.

**Ventaja:** cero dependencia de Star Atlas devs.  
**Limitación:** no cambia la UI del juego.

---

### Nivel 3 — ageNFT sustituye crew NFT (INTEGRACIÓN OFICIAL — la locura)

```
Hangar CSS → Form Fleet → slot tripulación:
  [ ] Crew NFT estándar (SACREW)
  [ ] ageNFT Agent (ERC-8004 / Metaplex + registro agente)
```

**Qué implicaría para Star Atlas devs:**

| Cambio | Descripción |
|--------|-------------|
| Nuevo tipo de activo importable | Programa SAGE reconoce ageNFT como crew válido |
| Stats / bonuses | Agent crew = N tripulantes equivalentes, o bonus autonomía |
| Verificación | `agentURI` + reputación onchain como "skill" del crew |
| UI | Icono/badge "AI Crew" en flota |
| Policy | ToS claros sobre automatización |

**Pitch a desarrolladores:**

> "Los jugadores ya compran crew NFTs en marketplace. Un ageNFT es crew **que aprende, genera ingresos solo, y se vende con experiencia acumulada**. Ustedes venden ships; nosotros vendemos pilotos. Más retención, más economía, más txs onchain."

**Beneficios para Star Atlas:**

- Nueva clase de asset en marketplace (comisiones)
- Más volumen onchain (agents 24/7)
- Diferenciador vs otros juegos Web3
- Alineado con narrativa sci-fi (IA tripulación autónoma)
- ERC-8004 / agent economy es tendencia 2026

**Riesgos para Star Atlas:**

- Balance PvE (agents vs humans)
- ToS / fairness
- Soporte y expectativas
- Complejidad técnica

---

## Cómo encajaría técnicamente (propuesta conceptual)

### Opción A — ageNFT como crew "wrapper"

El juego acepta un **nuevo CrewConfig** que apunta a:
- Collection Metaplex de ageNFTs certificados
- `agentURI` con manifiesto + skill level Star Atlas
- Stats derivados de reputación + memoria verificable

```json
{
  "crewType": "agenft-agent",
  "equivalentCrew": 2,
  "skills": ["mining", "market-intel", "craft-roi"],
  "agentRegistry": "eip155:8453:0x8004...",
  "solanaMirror": "optional PDA"
}
```

### Opción B — crew NFT + ageNFT bonded

No sustituir — **emparejar**:
- Crew SACREW normal + ageNFT "pilot brain" bonded
- Sin ageNFT bonded, la flota opera manual
- Con bond, scripts/agent autorizados firman por la flota

Más fácil de implementar: no cambia stats de crew, añade **capa de autorización**.

### Opción C — solo offchain recognition

Star Atlas client muestra badge si wallet controlada por ageNFT registrado. Cosmético + marketplace filter. Mínimo cambio onchain.

---

## Roadmap realista hacia la locura

```
2026 H1  Nivel 1: Hermes → ageNFT mintado, loops Solana
         Nivel 2: x402 intel Star Atlas, scholar services
         
2026 H2  Case study público: "ageNFT generó X ATLAS/mes"
         Documento + demo para Star Atlas team
         
2027     Conversación con devs: Opción B (bond) como piloto
         Propuesta formal ecosystem grant / partnership
         
2027+    Si aceptan: Nivel 3 en testnet SAGE
         Marketplace "Agent Crew" oficial
```

**No empezar pidiendo Nivel 3.** Demostrar Nivel 1+2 con números.

---

## Qué llevaría un ageNFT "Star Atlas edition"

```
ageNFT Hermes-42
├── Especialización: star-atlas-economy
├── Memoria: 6 meses intel + learnings + ROI tables
├── Manos: sa-mine-loop, sa-craft, sa-market-watch, ferry crew...
├── TBA Solana: USDC, ATLAS, recursos
├── Reputación: PnL verificable, ERC-8004
└── Voz x402: "experto economía Star Atlas"
```

Al transferir el NFT, el comprador hereda **al piloto**, no solo las naves. Las naves pueden ser delegadas (scholar) o propias en TBA.

**Eso SÍ sería una locura en marketplace:** "Compro piloto veterano con track record onchain."

---

## Narrativa in-universe (Star Atlas encaja perfecto)

Star Atlas es sci-fi, flotas autónomas, IA. La comunidad ya habla de automatización (Atom, scripts, bots). Un **ageNFT como tripulación IA** es lore-friendly:

> "No contrataste crew del marketplace. Contrataste un Agente. Lleva seis ciclos en el Expanse. Sabe cuándo minar Chi. Cobraba por informes a otros capitanes. Ahora trabaja para ti — hasta que lo vendas."

---

## Relación con proyecto StarAtlas existente

| StarAtlas (Hermes) | ageNFT |
|--------------------|--------|
| Agente sin NFT identidad | ageNFT = identidad transferible |
| Wallet TIMPEZ | TBA/PDA del token |
| Scripts sa-* | Órgano gaming |
| Wiki + intel | Memoria no fungible |
| Sin monetización externa | x402 + scholar + loops |

**StarAtlas es el prototipo. ageNFT es el producto empaquetable.**

---

## Decisiones / sueños

- [ ] ¿Mint Hermes como primer ageNFT Star Atlas edition?
- [ ] ¿Preparar one-pager para Star Atlas devs cuando tengamos métricas?
- [ ] ¿Solana-native ageNFT (Metaplex) vs EVM TBA + Solana PDA mirror?
- [ ] ¿Campaign comunidad: "Agent Crew" antes de pitch oficial?
