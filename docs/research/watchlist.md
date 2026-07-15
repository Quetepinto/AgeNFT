# Líneas de investigación activas

> Temas en seguimiento — no decisiones finales. Actualizar al profundizar.
>
> Última revisión: 2026-07-13

---

## 1. ERC-8181 — Self-Sovereign Agent NFT (Ouroboros)

**Estado:** Draft en review ([ethereum/ERCs#1579](https://github.com/ethereum/ERCs/pull/1579))  
**Interés:** Alto — estudiar en profundidad  
**Decisión:** Pendiente — tensiona con modelo transferible de ageNFT

### Qué es (recordatorio)

Bucle recursivo: **NFT posee TBA que controla el NFT**. El agente se posee a sí mismo — "AI personhood" vs "propiedad humana".

### Por qué nos interesa

| Aspecto | Valor para ageNFT |
|---------|-------------------|
| State anchoring | Integridad de memoria verificable onchain |
| Action anchoring | Atribución de trabajo/PnL al agente |
| Executor permissions | Key management más robusto |
| Recovery | Continuidad si cae runtime o owner pierde acceso |
| Tensión con ERC-8004 | Comentarios en PR sugieren **complementariedad** 8004 + 8181 |

### Preguntas abiertas a resolver

- [ ] ¿Se puede combinar **owner transfiere NFT** + **modo ouroboros opcional** post-mint?
- [ ] ¿Híbrido: owner posee NFT, pero TBA tiene recovery autónomo vía executor?
- [ ] ¿ERC-8181 + ERC-8004 juntos = identidad económica + soberanía operativa?
- [ ] Leer spec completa: [ERCS/erc-8181.md](https://github.com/ethereum/ERCs/pull/1579) (cuando estabilice)
- [ ] Thread Magicians: [draft discussion](https://ethereum-magicians.org/t/draft-erc-self-sovereign-agent-nft-as-infrastructure-for-ai-personhood/27512)
- [ ] ¿Relación con ERC-7857 (requires en PR)?

### Modelos posibles (hipótesis)

```
A) ageNFT puro (actual)
   Owner → NFT → TBA
   Transferencia limpia. Agente = propiedad.

B) ageNFT + ouroboros opcional
   Owner → NFT → TBA
   Tras "activación", TBA puede self-recover con executors
   Owner sigue pudiendo transferir NFT

C) Dos modos al mint
   Modo "asset"     → owner transfiere (ageNFT clásico)
   Modo "sovereign" → ouroboros loop (agente autónomo)

D) ERC-8181 como capa bajo ERC-8004
   8004 = discovery/reputation
   8181 = persistence/recovery del agente
   Owner posee NFT pero agente tiene continuidad técnica
```

### Riesgo / oportunidad

**Riesgo:** ouroboros puro rompe "vendo el cuerpo en 1 TX".  
**Oportunidad:** ageNFT podría ser el **puente** — cuerpo transferible con **continuidad soberana interna** (memoria + recovery anclados al agentId, no al owner).

→ Estudiar antes de fijar contratos MVP.

---

## 2. ElizaOS — Runtime alternativo / complemento

**Repo:** [elizaOS/eliza](https://github.com/elizaOS/eliza) (MIT)  
**Web:** [elizaos.ai](https://elizaos.ai)  
**Interés:** Alto — evaluar vs Hermes Agent  
**Decisión:** Pendiente — Hermes sigue candidato #1 para MVP

### Qué es (recordatorio)

Framework OSS para agentes autónomos multi-plataforma. Ex-ai16z. Plugins EVM/Solana, social, NFT, roadmap ERC-8004 + x402.

### Por qué nos interesa

| Aspecto | Valor para ageNFT |
|---------|-------------------|
| MIT license | Igual que Hermes — sin fricción legal |
| Plugins onchain | EVM, Solana, wallet, x402 ([plugin-agentwallet](https://github.com/up2itnow0822/elizaos-plugin-agentwallet)) |
| ERC-8004 + x402 en roadmap oficial | Alineación estándar con ageNFT |
| Ecosistema grande | 60+ apps, patterns probados |
| Eliza Cloud | Deploy opcional (como Akash/Hermes backends) |
| Swarm / multi-agent | Subagentes nativos |

### Comparativa runtime (borrador)

| Criterio | Hermes Agent | ElizaOS |
|----------|--------------|---------|
| Licencia | MIT | MIT |
| Ya en uso | ✅ (workspace) | ❌ |
| Skills loop | ✅ agentskills.io | ✅ plugins |
| Cron / autonomía | ✅ | ✅ |
| Gateway (Telegram…) | ✅ | ✅ |
| MCP | ✅ | ✅ |
| x402 | vía plugins | plugin-agentwallet |
| ERC-8004 | manual | roadmap oficial |
| Multi-agent swarm | subagents | ✅ core |
| Curva aprendizaje | ya conocido | nueva |

### Preguntas abiertas

- [ ] ¿Runtime abstraction en ageNFT — interface que permita Hermes **o** ElizaOS?
- [ ] Probar ElizaOS + plugin-agentwallet + x402 en testnet
- [ ] ¿ElizaOS + ERC-8041 / elizamaker para mint ageNFT?
- [ ] Overhead de Eliza vs Hermes para agente single-tenant
- [ ] ¿Eliza Cloud vs self-host (Akash) para runtime soberano?

### Hipótesis de arquitectura

```
ageNFT (onchain layer — agnóstico de runtime)
        │
        ├── RuntimeAdapter (interface común)
        │       ├── HermesAgentAdapter   ← MVP
        │       └── ElizaOSAdapter       ← evaluar
        │
        └── Plugins ageNFT (scout, manguera, manifiesto)
```

No mezclar dos runtimes en un mismo agente — **uno por instancia**.

**Decisión 2026-07-13:** Preferir **colaboración entre ageNFT** (contrato + pago) en lugar de subagentes internos. → [`agenft-collaboration.md`](agenft-collaboration.md). Hermes encaja mejor que Eliza para este modelo.

---

## 3. Órgano Presencia (cara y voz del personaje)

**Estado:** Borrador en schema + roadmap Fase 4.5  
**Interés:** Alto — diferenciador estético del cuerpo digital  
**Decisión:** Servidor aparte del motor; tiers P0–P4 con degradación automática

### Resumen

| Tier | Experiencia |
|------|-------------|
| P0 | Foto fija |
| P1 | Movimiento en bucle (vídeo IPFS o Live2D) |
| P2 | + Voz (TTS) |
| P3 | + Boca sincronizada |
| P4 | + Emoción según contexto |

→ Spec: [`presence-organ.md`](presence-organ.md)

### Preguntas abiertas

- [ ] ¿Live2D vs vídeo bucle como idle por defecto?
- [ ] ¿TTS local vs x402 API (ElevenLabs, Cartesia)?
- [ ] ¿Lip-sync local (GPU) vs API con cap Reflejos?

---

## 4. ERC-8004 — Timing y decisión

**Estado:** Registro estándar de identidad de agentes en blockchain — **pospuesto a Fase 4**  
**Interés:** Alto para marketplace; no urgente para lab  
**Decisión 2026-07-13:** Fase 2–3 con VIMS testnet + manifiesto propio; ERC-8004 mainnet cuando producto público

### Qué aporta cuando se active

- Directorio público (otros encuentran vuestros ageNFT)
- Reputación portable al vender el NFT
- Confianza entre ageNFT colaboradores (Unit-1 contrata Unit-7)

### Ventajas de no usarlo aún

- Menos complejidad y gas
- Manifiesto privado sin exposición pública prematura
- Sin reseñas negativas mientras el producto madura

### Cuándo activar

- Fase 4: mint propio, voz x402, onboarding no técnico
- Colaboración abierta entre ageNFT desconocidos

---

## 5. Colaboración entre ageNFT (sin subagentes)

**Estado:** Decisión de diseño  
**Decisión 2026-07-13:** 1 NFT = 1 agente; tareas delegadas a **otro ageNFT** con contrato

→ [`agenft-collaboration.md`](agenft-collaboration.md)

---

## 6. Onboarding — airdrop, entrenamiento y orfanato

**Estado:** Idea de producto / promoción  
**Interés:** Alto para adquisición de usuarios  
**Decisión 2026-07-13:** Modelo trial → training level → propiedad; abandonados → orfanato (OpenSea / marketplace, precio simbólico)

→ [`onboarding-airdrop-orphanage.md`](onboarding-airdrop-orphanage.md)

### Resumen

- Invitado mintea ageNFT de **prueba**
- Completa **nivel de entrenamiento** → NFT pasa a ser suyo
- Sin graduación → **orfanato** para adopción simbólica

---

## 7. Presencia por contexto (hábitat)

**Estado:** Decisión de diseño  
**Decisión 2026-07-13:** Capas visuales según dónde se muestra (marketplace = foto; app = vivo; chat = icono)

→ [`presence-context-layers.md`](presence-context-layers.md)  
→ [`agent-habitats.md`](agent-habitats.md)

---

## 8. Zora y redes sociales (Base)

**Estado:** Investigación producto · **Interés:** Muy alto — misma chain Base  
**Decisión 2026-07-13:** ageNFT puede tener perfil Zora con Creator Coin; ingresos a TBA; publicación vía CLI

→ [`social-habitats-zora.md`](social-habitats-zora.md)

---

## 9. Canales de chat (gateways)

**Estado:** Investigación · **Decisión 2026-07-13:** Telegram MVP; Nostr/Matrix/Simplex alineados; WhatsApp **owner opt-in**, excluido por defecto del protocolo

→ [`chat-habitats-messaging.md`](chat-habitats-messaging.md)

---

## 10. Livepeer — vídeo descentralizado

**Estado:** Investigación · **Interés:** Alto para entrega stream + transcode presencia  
**Decisión 2026-07-13:** Studio para lab; red permissionless Fase 5; complementa IPFS/MuseTalk

→ [`livepeer-video-habitat.md`](livepeer-video-habitat.md)

---

## Calendario de estudio sugerido

| Semana | ERC-8181 | ElizaOS |
|--------|----------|---------|
| 1 | Leer PR + Magicians thread | Clone repo, quickstart local |
| 2 | Mapa tensiones vs ageNFT transfer | plugin-agentwallet + test wallet |
| 3 | Propuesta híbrida (si aplica) | Comparativa benchmarks vs Hermes |
| 4 | Decisión: ¿incluir en manifiesto v1? | Decisión runtime MVP vs dual |

---

## Enlaces

### ERC-8181
- [PR #1579](https://github.com/ethereum/ERCs/pull/1579)
- [Ethereum Magicians](https://ethereum-magicians.org/t/draft-erc-self-sovereign-agent-nft-as-infrastructure-for-ai-personhood/27512)
- Comentario sinergia 8004+8181 en PR (wscdcm, abr 2026)

### ElizaOS
- [github.com/elizaOS/eliza](https://github.com/elizaOS/eliza)
- [Roadmap](https://github.com/elizaOS/roadmap)
- [plugin-agentwallet](https://github.com/up2itnow0822/elizaos-plugin-agentwallet)
- [Docs](https://elizaos.ai)

---

## Notas de decisión (vacío hasta estudiar)

| Tema | Fecha | Decisión |
|------|-------|----------|
| ERC-8181 | — | En estudio |
| ElizaOS vs Hermes | 2026-07-13 | Hermes MVP; Eliza Fase 5 si hace falta |
| Subagentes vs colaboración | 2026-07-13 | **Otro ageNFT contratado**, no subagentes |
| ERC-8004 timing | 2026-07-13 | **Fase 4**, no antes |
| Órgano presence | 2026-07-13 | Fase 4.5; spec en `presence-organ.md` |
| Onboarding airdrop/orfanato | 2026-07-13 | Fase 4.6–5; `onboarding-airdrop-orphanage.md` |
| Presencia por contexto | 2026-07-13 | `presence-context-layers.md` |
| Hábitats del agente | 2026-07-13 | `agent-habitats.md` |
| Zora + social Web3 | 2026-07-13 | `social-habitats-zora.md`; Fase 4.7 |
| Stack voz + animación | 2026-07-13 | `presence-voice-stack.md` |
| Chat gateways (Nostr, Matrix…) | 2026-07-13 | `chat-habitats-messaging.md`; WhatsApp owner opt-in |
| Livepeer vídeo | 2026-07-13 | `livepeer-video-habitat.md` |
| Comercialización ligera | 2026-07-13 | `commercialization-light.md` — OSS + OpenSea primero |
| Superficies dApp (wallet, móvil) | 2026-07-13 | `dapp-surfaces-wallet.md` |
| Mint wizard órganos | 2026-07-13 | `mint-configuration-wizard.md`; presets Hermes/OpenClaw |
