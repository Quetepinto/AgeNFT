# Comercialización ligera — open source, OpenSea, marca después

> **Estado:** Notas estratégicas (no asesoramiento legal) · **Origen:** 2026-07-13  
> **Disclaimer:** Esto es orientación de producto, **no consejo legal ni fiscal**. Consultar profesional antes de facturar en serio.

---

## Visión del fundador (2026-07-13)

1. **Open source** el protocolo / herramientas
2. **Web simple** + venta en **OpenSea** y similares
3. **Promo** orgánica (trial, orfanato, Zora, Nostr…)
4. **Marca e impuestos formales** solo si hay tracción

**Veredicto diseño:** enfoque **válido para fase experimento / promo**. Ir añadiendo capas legales cuando haya ingresos recurrentes o usuarios no técnicos en la UE.

---

## OpenSea — ¿solo wallet?

| Acción | ¿Basta wallet? | Notas |
|--------|----------------|-------|
| **Conectar** a OpenSea | ✅ Sí | MetaMask, Rainbow, etc. |
| **Listar NFT** en venta | ✅ Sí | Firma transacción; sin email obligatorio en flujo crypto-native habitual |
| **Comprar / pujar** | ✅ Sí | Misma wallet |
| **Cobrar** al vender | ✅ Sí | ETH/USDC/etc. llegan a la wallet del vendedor |
| **Mint colección** | ✅ Sí (técnico) | Wallet despliega contrato o mint en colección existente + gas |
| **Cuenta email OpenSea** | ⚠️ Opcional | Algunas funciones (Studio, soporte, verificación creador) pueden pedirla |
| **KYC** | ⚠️ Variable | Políticas y jurisdicción cambian; no asumir “nunca” |

**En cristiano:** para **vender un NFT que ya tienes**, normalmente **no hace falta registrarte como humano** — la **wallet es tu identidad** en el mercado. Eso no elimina obligaciones fiscales ni legales del **detrás** de la wallet (tú o tu sociedad).

---

## Plano legal (mínimo por fase)

### Fase 0 — Lab / promo (ahora)

| Tema | Riesgo | Acción mínima |
|------|--------|---------------|
| Experimento personal | Bajo | Documentar que es **beta / lab** |
| Sin ingresos o micro-ingresos | Bajo | Guardar txs onchain (export wallet) |
| Código OSS | Medio | Licencia clara (**MIT** runtime; respetar **AGPL** si fork Agent-NFT) |
| “El agente gana dinero” | Medio | Dejar claro: **el owner del NFT** es responsable del agente |

### Fase 1 — OpenSea + web + trial

| Tema | Acción |
|------|--------|
| **Términos de uso** web | 1 página simple: beta, sin garantía, no es asesoramiento financiero |
| **Privacidad (RGPD)** si UE | Si guardáis email en trial → política mínima; si solo wallet → más simple |
| **Creator Coins / tokens** (Zora) | Disclaimers “entretenimiento / social”; no prometer rentabilidad |
| **Menores** | No dirigir a <18 sin consentimiento parental |
| **Marca “ageNFT”** | Buscar conflicto marcas; no usar logos ajenos (Hermes, OpenSea…) |

### Fase 2 — Si “va bien” (ingresos, marca)

| Tema | Acción |
|------|--------|
| **Forma jurídica** | Autónomo / SL (España) o equivalente según país del fundador |
| **IVA / impuestos** | Asesor fiscal: venta NFT, royalties, ingresos x402 |
| **Facturación** | ¿Quién factura servicios del agente? → el **owner** o la entidad que operéis |
| **Seguros / responsabilidad** | Si agentes dan consejos (finanzas, salud) → límites en ToS |
| **EU AI Act** | Transparencia: “interactúas con IA”; logs si sistema de alto riesgo (evaluar) |

---

## Plano comercio (tu sueño simplificado)

```
Open source (GitHub)
    → Colección OpenSea (mint + orfanato + adopción simbólica)
    → Web mínima (agenft.dev): trial, docs, enlace OpenSea
    → Promo: Zora, Nostr, trial airdrop
    → Ingresos: venta NFT + royalties + x402 a TBA del agente (ingreso del comprador)
```

| Canal | Rol | Complejidad |
|-------|-----|-------------|
| **OpenSea** | Venta/adopción NFT | Baja |
| **Web propia** | Mint trial, graduación, docs | Media |
| **Zora** | Social + Creator Coin | Media |
| **Orfanato** narrativa | Marketing emocional | Baja |

**No hace falta** e-commerce clásico (Stripe, facturas) al inicio si todo es **crypto wallet a wallet**.

---

## Plano marca

### Ahora (gratis, coherente)

- Nombre **ageNFT** + logo simple
- Colección OpenSea con arte coherente (Unit-1, Unit-7…)
- “Built on open standards” (ERC-6551, x402, manifest)
- **No** llamarlo producto oficial de Nous/Hermes — “runtime compatible con Hermes Agent”

### Después (si tracción)

- Registrar marca (opcional, país clave)
- Dominio `agenft.dev` / `.com`
- Identidad visual presencia (P0–P4)
- SL + cuenta bancaria si fiat o nóminas

---

## Open source vs comercializar

| Pieza | Open source | Cerrado |
|-------|-------------|---------|
| Manifiesto, schema, docs | ✅ | — |
| Runtime, scripts lab | ✅ MIT | — |
| Contratos propios (futuro) | ✅ recomendado | — |
| **Servicio alojado** (hosting agentes) | Opcional SaaS | Podéis cobrar hosting |
| **Colección arte** genesis | NFT = producto | — |

Modelo tipo **Red Hat / WordPress**: código abierto, ingresos por colecciones, hosting, soporte, agentes premium.

---

## Riesgos a no ignorar (aunque empecéis light)

1. **Fiscales:** vender NFT o cobrar royalties **puede ser evento taxable** aunque sea crypto
2. **Securities:** Creator Coins / “invertir en el agente” → lenguaje cuidadoso
3. **Responsabilidad IA:** agente dice tonterías dañinas → ToS limitan responsabilidad
4. **AGPL Agent-NFT:** si fork contratos VIMS, obligaciones de licencia
5. **OpenSea royalties** enforcement limitado — no contar solo con royalties 10%

---

## Checklist “empezar sin complicar”

- [ ] Licencia repo definida (MIT components)
- [ ] README: “beta lab, not financial advice”
- [ ] Página `/terms` mínima antes de trial público
- [ ] Colección OpenSea: descripción clara qué compras (NFT + manifiesto + TBA)
- [ ] Wallet dedicada proyecto (separada de personal)
- [ ] Export mensual txs para cuando toque declarar
- [ ] Marca: búsqueda rápida TM conflict
- [ ] Asesor fiscal **antes** de >X €/año ingresos (umbral según país)

---

## Respuesta directa al fundador

> “¿Solo OpenSea y wallet y ver qué pasa?”

**Sí como experimento crypto-native** — técnicamente y culturalmente encaja.  
**No** significa cero obligaciones — significa **posponer** sociedad y marca hasta validar demanda.

> “¿OpenSea sin humano?”

**Para listar y vender:** la wallet suele bastar.  
**Detrás de la wallet** sigue habiendo una persona (o entidad) responsable ante ley e impuestos.

---

## Referencias internas

- [`onboarding-airdrop-orphanage.md`](onboarding-airdrop-orphanage.md)
- [`agent-identity.md`](../architecture/agent-identity.md) — marca Hermes
- [`economics.md`](../architecture/economics.md)
