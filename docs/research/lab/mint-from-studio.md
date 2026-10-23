# Mint URUIRU desde Lab Studio

> **Estado:** flujo prototipo · **2026-08-31**  
> Conecta el **Organ Studio** (Lab Studio interlineal) con el contrato `AgeNFT` en Base mainnet.

---

## Qué es qué

| Pieza | Rol | ¿Dónde? |
|-------|-----|---------|
| **Contrato `AgeNFT`** | ERC-721 + TBA ERC-6551 en mint | `0x76FC4f6cfE42dAb418cD5Ca2a5E50cBAf44eB839` (Base) |
| **Manifiesto `ageNFT/v1`** | ADN del agente → va en `agentURI` onchain | Lab Studio → export / CLI |
| **Wiring `agenft-wiring/v1`** | Cableado operativo diario (post-mint) | Lab Studio → «Aplicar al runtime» |
| **Lab Studio** | Vista interlineal cuerpo + cables | `dapp/lab.html` |

**Unit-Mainnet #1** ya está minteado (tokenId `1`, TBA `0x9BF1…73CCB`). Este flujo sirve para:

- Revisar / regenerar el manifiesto del prototipo URUIRU
- Preparar un **nuevo token** (#2+) en la misma colección
- Documentar qué va onchain vs qué queda off-chain

---

## Flujo recomendado (Studio → mint)

### 1. Configurar en Lab Studio

1. Abre [`dapp/lab.html`](../dapp/lab.html) (local o GitHub Pages).
2. Ajusta órganos: **Motor Hermes**, **Cerebro tx402**, **Presencia uruiru-svg**, **Gateway Telegram**, etc.
3. Pulsa **Exportar manifiesto** → descarga `uruiru-prototype-manifest.json`.

Alternativa CLI (mismo resultado desde wiring guardado):

```bash
node scripts/mint/wiring-to-manifest.mjs \
  --wiring runtime/wiring/unit-mainnet.json \
  --preset docs/manifest/presets/uruiru-prototype.json \
  --out docs/manifest/examples/uruiru-prototype-draft.json
```

### 2. Revisar borrador

Archivos clave:

- Preset identidad URUIRU: [`docs/manifest/presets/uruiru-prototype.json`](../manifest/presets/uruiru-prototype.json)
- Borrador generado: [`docs/manifest/examples/uruiru-prototype-draft.json`](../manifest/examples/uruiru-prototype-draft.json)
- Mapa opciones Studio → manifiesto: [`docs/manifest/wiring-option-map.json`](../manifest/wiring-option-map.json)

Campos **PENDING** (normal antes del mint): `identity.agentId`, `identity.nft.tokenId`, `treasury.address`.

### 3. Simular mint (sin tx)

```bash
cd scripts/onchain
node mint-mainnet.mjs \
  --manifest ../../docs/manifest/examples/uruiru-prototype-draft.json \
  --name URUIRU \
  --dry-run
```

### 4. Mint real (wallet con ETH en Base)

```bash
node mint-mainnet.mjs \
  --manifest ../../docs/manifest/examples/uruiru-prototype-draft.json \
  --name URUIRU \
  --salt URUIRU-prototype-v1
```

Post-mint:

```bash
node fund-tba-mainnet.mjs
node mainnet-checklist.mjs <tokenId>
```

El script guarda `docs/research/lab/mint-token-<id>.json` y un manifiesto con TBA rellenada.

### 5. Cablear runtime (Studio otra vez)

Tras mint, **Exportar manifiesto** no sustituye al wiring:

1. Lab Studio → **Aplicar al runtime** (wiring en `runtime/wiring/unit-mainnet.json` o `unit-<id>.json`).
2. `cd runtime && npm run hermes:install && npm run hermes:verify`
3. Probar Telegram / Doctor.

---

## Qué va onchain vs off-chain

```
Mint tx
  ├── name (string)
  ├── agentURI → manifiesto ageNFT/v1 (data: o ipfs://)
  └── TBA address (ERC-6551, inmutable)

Off-chain / post-mint
  ├── runtime/wiring/*.json   ← Lab Studio «Aplicar»
  ├── runtime/data/<pack>/    ← memoria conversacional
  └── credenciales gateway    ← nunca en manifiesto público
```

Ver [`onchain-immutable-vs-editable.md`](../architecture/onchain-immutable-vs-editable.md).

---

## Contrato inteligente

El **bytecode no está en este repo** (deploy externo). ABI y direcciones:

- [`scripts/onchain/abis.js`](../../scripts/onchain/abis.js)
- [`docs/research/lab/addresses.base-mainnet.json`](addresses.base-mainnet.json)
- Spec: [`docs/architecture/agenft-registry-spec.md`](../architecture/agenft-registry-spec.md)

Función de mint:

```solidity
mint(address to, string name_, string agentURI_, bytes32 salt)
  → (uint256 tokenId, address tba)
```

---

## Limitaciones v0

- Lab Studio exporta **manifiesto borrador**, no ejecuta mint desde el navegador (requiere wallet + script).
- `agentURI` hoy usa `data:application/json;base64,...` — IPFS recomendado antes de colección pública.
- Contrato v1 **sin `setAgentURI`** — lo minteado en `agentURI` es write-once hasta v2.
- Token #1 ya existe; un segundo mint generará tokenId `2` (ver `nextTokenId` onchain).

---

## Docs relacionados

- [`mint-configuration-wizard.md`](../backups/mint-configuration-wizard.md) — UX wizard completo (futuro)
- [`runtime-wiring.md`](runtime-wiring.md) — wiring vs manifiesto
- [`onboarding-usuario-normal.md`](onboarding-usuario-normal.md) — prueba con usuario no técnico
