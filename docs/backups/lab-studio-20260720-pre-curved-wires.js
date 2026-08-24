/**
 * Lab Studio — esquema editable + asistente + borrador para chat (Cursor).
 * Categorías por color: vivo · parcial · prueba · idea · previsto · apagado
 */
import { assetUrl, fetchJson, tokenFromPath } from './shared.js';

const STORAGE_KEY = 'agenft-lab-draft-v1';
const SEND_TARGET_KEY = 'agenft-lab-send-target-v1';
/** Reposiciona nodos al cambiar el esquema corporal (sin borrar opciones/categorías). */
const LAYOUT_VERSION = 2;
/** Separación visual cuando hay par bidireccional A↔B (dos cables). */
const WIRE_BIDIR_OFFSET = 12;
/** Límite conservador URL deeplink Cursor (~8k en muchos navegadores) */
const CURSOR_PROMPT_MAX = 7500;

/** Destino al pulsar Enviar — Cursor no expone ID de chat IDE; ver hints */
export const SEND_TARGETS = {
  current: {
    id: 'current',
    label: 'Chat actual (pegar aquí)',
    hint: 'Copia al portapapeles. Vuelve a ESTE chat y Ctrl+V — no abre chat nuevo.',
    default: true,
  },
  inbox: {
    id: 'inbox',
    label: 'Inbox proyecto (@archivo)',
    hint: 'Escribe en .cursor/lab-inbox/latest.md — luego @ en el chat donde estés.',
  },
  new: {
    id: 'new',
    label: 'Chat nuevo (deeplink)',
    hint: 'Abre Cursor con prompt prefilled — suele ser conversación nueva.',
  },
  both: {
    id: 'both',
    label: 'Nuevo + copia',
    hint: 'Deeplink y portapapeles a la vez.',
  },
};

/** Etiquetas rápidas (emoji + tooltip) — catálogo amplio; editable después */
export const TAG_GROUPS = [
  {
    title: 'Precio · G · D · E',
    ids: ['free', 'decentralized', 'paid', 'bigtech', 'subscription', 'gasOnly'],
  },
  {
    title: 'Privacidad · legal',
    ids: ['privacyHigh', 'privacyLow', 'gdpr', 'nymPrivacy'],
  },
  {
    title: 'Gateway S1 · S2 · S3',
    ids: ['sovereign', 'partialSovereignty', 'bootstrap', 'ownerOptIn'],
  },
  {
    title: 'Topología · código',
    ids: [
      'selfhost',
      'federated',
      'centralized',
      'onchain',
      'mainnetOnly',
      'oss',
      'openProtocol',
      'proprietary',
      'hybridService',
    ],
  },
  {
    title: 'Storage · compute · hosting',
    ids: ['ipfsPin', 'arweave', 'w3stor', 'x402proto', 'akash', 'cronLocal', 'githubPages'],
  },
  {
    title: 'Registro',
    ids: ['walletOnly', 'emailReg', 'phoneReg', 'requiresHuman'],
  },
  {
    title: 'Post-transfer',
    ids: ['transferOk', 'reconfigTransfer', 'brokenTransfer', 'transferable'],
  },
  {
    title: 'Criticidad · runtime',
    ids: [
      'essentialE1',
      'essentialE2',
      'optionalOrgan',
      'dormant',
      'failover',
      'tbaPayer',
      'hoseOwner',
      'optInExplicit',
      'hygieneGate',
      'experimental',
      'labLegacy',
    ],
  },
  {
    title: 'Capacidades extra',
    ids: ['scout', 'defiRisk', 'staticPresence', 'lipSyncML', 'erc8004'],
  },
];

export const TAGS = {
  free: { emoji: '🆓', label: 'Gratis', hint: 'Nivel G — OSS local, sin micropago recurrente' },
  decentralized: {
    emoji: '🔗',
    label: 'Descentralizado',
    hint: 'Topología D — x402, IPFS, toju, Akash; sin vendor único',
  },
  paid: { emoji: '💳', label: 'Pago uso', hint: 'Micropago USDC / x402 por request o upload' },
  bigtech: {
    emoji: '🏢',
    label: 'Big Tech',
    hint: 'Nivel E — SaaS centralizado (OpenAI, Google, Meta, AWS…)',
  },
  subscription: {
    emoji: '📅',
    label: 'Suscripción',
    hint: 'Cuota fija ~$/mes además de o en lugar de pay-per-use',
  },
  gasOnly: {
    emoji: '⛽',
    label: 'Solo gas',
    hint: 'Solo paga gas onchain (mint, setAgentURI) — sin SaaS',
  },
  privacyHigh: {
    emoji: '🔒',
    label: 'Privacidad alta',
    hint: 'Datos en tu máquina/VPS; mínima salida; sin telemetría SaaS',
  },
  privacyLow: {
    emoji: '👁️',
    label: 'Privacidad baja',
    hint: 'Datos en servidores ajenos; telemetría posible; menos control al vender',
  },
  gdpr: {
    emoji: '🇪🇺',
    label: 'GDPR',
    hint: 'Considerar DPA, residencia UE, minimización de datos personales',
  },
  nymPrivacy: {
    emoji: '🕶️',
    label: 'Red privada',
    hint: 'Nym, VPN, mixnet — ocultar metadatos de red (ógano privacidad)',
  },
  sovereign: {
    emoji: '🛡️',
    label: 'Soberano (S1)',
    hint: 'Agente opera con claves propias — sin teléfono/email humano permanente',
  },
  partialSovereignty: {
    emoji: '⚡',
    label: 'Soberanía parcial',
    hint: 'Agente paga solo pero depende de infra/account de tercero',
  },
  bootstrap: {
    emoji: '🔑',
    label: 'Bootstrap (S2)',
    hint: 'Humano configura una vez (BotFather); luego token técnico',
  },
  ownerOptIn: {
    emoji: '⚠️',
    label: 'Owner opt-in (S3)',
    hint: 'WhatsApp/Signal — SIM permanente; excluido por defecto',
  },
  selfhost: { emoji: '🏠', label: 'Self-host', hint: 'Tu VPS, Synapse, cron, Caddy, Ollama' },
  federated: { emoji: '🌐', label: 'Federado', hint: 'Matrix, Nostr, toju — identidad portable' },
  centralized: {
    emoji: '🏛️',
    label: 'Centralizado',
    hint: 'Un proveedor controla el servicio (aunque no sea marca Big Tech)',
  },
  onchain: { emoji: '⛓️', label: 'Onchain', hint: 'Base — NFT, TBA, registry, hashes' },
  mainnetOnly: {
    emoji: '🔴',
    label: 'Solo mainnet',
    hint: 'x402, toju — Sepolia/lab no sirve para servicios reales',
  },
  oss: { emoji: '📖', label: 'Open source', hint: 'Código auditable; sin vendor lock-in' },
  openProtocol: {
    emoji: '📜',
    label: 'Protocolo abierto',
    hint: 'IPFS, Matrix, ERC-8004 — especificación pública',
  },
  proprietary: {
    emoji: '🔐',
    label: 'Propietario',
    hint: 'Código o API cerrada — dependencia del vendor',
  },
  hybridService: {
    emoji: '🔀',
    label: 'Híbrido',
    hint: 'OSS cliente + backend SaaS (ej. toju, tx402.ai)',
  },
  ipfsPin: {
    emoji: '📌',
    label: 'IPFS',
    hint: 'Protocolo content-addressed (CID). El pin lo hace toju, W3Stor o kubo',
  },
  arweave: {
    emoji: '🗄️',
    label: 'Arweave',
    hint: 'Archivo permanente one-shot — biblioteca / manifiesto',
  },
  w3stor: {
    emoji: '☁️',
    label: 'W3Stor',
    hint: 'Fallback storage descentralizado en manifiesto',
  },
  x402proto: {
    emoji: '🪙',
    label: 'x402',
    hint: 'Pago HTTP 402 — TBA/wallet firma on-the-fly',
  },
  akash: {
    emoji: '⚡',
    label: 'Akash/GPU',
    hint: 'Compute nivel D — contenedor/GPU alquilada (AKT/io.net)',
  },
  cronLocal: {
    emoji: '⏱️',
    label: 'Cron local',
    hint: 'systemd/timer en máquina owner — Doctor, probes',
  },
  githubPages: {
    emoji: '📄',
    label: 'Static host',
    hint: 'GitHub Pages, Caddy file_server — dApp estática',
  },
  walletOnly: {
    emoji: '👛',
    label: 'Solo wallet',
    hint: 'Registro = firmar con wallet; sin email/teléfono',
  },
  emailReg: { emoji: '📧', label: 'Email', hint: 'Alta con email humano obligatorio' },
  phoneReg: { emoji: '📱', label: 'Teléfono', hint: 'SIM o verificación móvil humana' },
  requiresHuman: {
    emoji: '👤',
    label: 'Cuenta humana',
    hint: 'OAuth/API key de una persona — no solo TBA del agente',
  },
  transferOk: {
    emoji: '✅',
    label: 'Transfer OK',
    hint: 'Tras transfer() sigue igual sin re-registro',
  },
  reconfigTransfer: {
    emoji: '🔄',
    label: 'Reconfig transfer',
    hint: 'Hay que reconfigurar mínimo (nuevo bot, URI hosting)',
  },
  brokenTransfer: {
    emoji: '❌',
    label: 'Re-registro',
    hint: 'Nuevo owner no puede heredar — cuenta atada al vendedor',
  },
  transferable: {
    emoji: '🧳',
    label: 'Memoria viaja',
    hint: 'Cápsula/hash en manifiesto — comprador hidrata memoria',
  },
  dormant: {
    emoji: '😴',
    label: 'DORMANT',
    hint: 'Modo lectura — presupuesto bajo, sin gastar cerebro',
  },
  failover: {
    emoji: '🔁',
    label: 'Failover',
    hint: '2ª opción en manifiesto si el primario cae (Doctor)',
  },
  essentialE1: {
    emoji: '❗',
    label: 'Esencial E1',
    hint: 'Sin esto no hay agente vivo (NFT, TBA, cerebro, memoria…)',
  },
  essentialE2: {
    emoji: '🚪',
    label: 'Esencial E2',
    hint: 'Al menos un gateway — sin puerta nadie habla con él',
  },
  optionalOrgan: {
    emoji: '➕',
    label: 'Opcional',
    hint: 'O-R u O-N — mejora pero no bloquea MVP',
  },
  tbaPayer: {
    emoji: '💰',
    label: 'TBA paga',
    hint: 'Gasto desde cartera del agente — soberanía económica',
  },
  hoseOwner: {
    emoji: '🪣',
    label: 'Manguera',
    hint: 'Owner aporta LLM key — no sale de TBA (tier E hose)',
  },
  optInExplicit: {
    emoji: '☑️',
    label: 'Opt-in',
    hint: 'Owner debe activar en Dashboard; Hygiene avisa',
  },
  hygieneGate: {
    emoji: '🚧',
    label: 'Hygiene',
    hint: 'Doctor Hygiene audita antes de activar',
  },
  experimental: { emoji: '🧪', label: 'Experimental', hint: 'Spike / lab — no producción' },
  labLegacy: {
    emoji: '🧫',
    label: 'Lab legacy',
    hint: 'Sepolia / Unit-1 #115 — archivo, no mainnet producto',
  },
  scout: {
    emoji: '🔭',
    label: 'Scout',
    hint: 'Ingresos / leads — ConvoHunter, x402.org scrape',
  },
  defiRisk: {
    emoji: '📈',
    label: 'DeFi riesgo',
    hint: 'Trading, yield, manos — opt-in explícito alto riesgo',
  },
  staticPresence: {
    emoji: '🖼️',
    label: 'Estático',
    hint: 'PNG/SVG idle — sin TTS ni lip-sync',
  },
  lipSyncML: {
    emoji: '👄',
    label: 'Lip-sync ML',
    hint: 'Animación boca ML — Bloque 4 opt-in',
  },
  erc8004: {
    emoji: '🪪',
    label: 'ERC-8004',
    hint: 'Registro identidad agente onchain',
  },
};

/** Metadatos por opción de cableado (clave = id opción en desplegable) */
const OPTION_META = {
  'base-mainnet': [
    'essentialE1',
    'onchain',
    'decentralized',
    'mainnetOnly',
    'gasOnly',
    'walletOnly',
    'privacyHigh',
    'transferOk',
    'transferable',
    'sovereign',
    'openProtocol',
    'erc8004',
    'tbaPayer',
  ],
  'sepolia-lab': ['labLegacy', 'free', 'experimental', 'privacyHigh', 'onchain'],
  hermes: [
    'essentialE1',
    'free',
    'selfhost',
    'cronLocal',
    'oss',
    'privacyHigh',
    'dormant',
    'failover',
    'transferOk',
  ],
  'openclaw-adapter': ['free', 'experimental', 'oss', 'privacyHigh', 'selfhost'],
  tx402: [
    'essentialE1',
    'paid',
    'x402proto',
    'decentralized',
    'hybridService',
    'mainnetOnly',
    'walletOnly',
    'privacyHigh',
    'sovereign',
    'tbaPayer',
    'failover',
    'dormant',
    'transferOk',
  ],
  'openrouter-fallback': [
    'paid',
    'bigtech',
    'centralized',
    'proprietary',
    'privacyLow',
    'requiresHuman',
    'hoseOwner',
    'optInExplicit',
    'hygieneGate',
    'reconfigTransfer',
  ],
  'lab-local': ['essentialE1', 'free', 'selfhost', 'privacyHigh', 'optionalOrgan', 'labLegacy'],
  'toju-ipfs': [
    'essentialE1',
    'paid',
    'x402proto',
    'decentralized',
    'ipfsPin',
    'hybridService',
    'federated',
    'mainnetOnly',
    'walletOnly',
    'privacyHigh',
    'transferable',
    'transferOk',
    'tbaPayer',
  ],
  'w3stor-ipfs': [
    'paid',
    'decentralized',
    'w3stor',
    'x402proto',
    'ipfsPin',
    'failover',
    'hybridService',
    'mainnetOnly',
    'walletOnly',
    'tbaPayer',
  ],
  'kubo-ipfs': [
    'essentialE1',
    'free',
    'selfhost',
    'ipfsPin',
    'decentralized',
    'privacyHigh',
    'transferable',
    'transferOk',
    'oss',
  ],
  'export-only': ['free', 'privacyHigh', 'selfhost'],
  /** @deprecated alias — migrado a lab-local */
  'toju-local': ['essentialE1', 'free', 'selfhost', 'privacyHigh', 'optionalOrgan', 'labLegacy'],
  /** @deprecated alias — migrado a toju-ipfs */
  'ipfs-primary': [
    'essentialE1',
    'paid',
    'x402proto',
    'decentralized',
    'ipfsPin',
    'hybridService',
    'federated',
    'mainnetOnly',
    'walletOnly',
    'privacyHigh',
    'transferable',
    'transferOk',
    'tbaPayer',
  ],
  /** @deprecated alias — migrado a w3stor-ipfs */
  'w3stor-fallback': [
    'paid',
    'decentralized',
    'w3stor',
    'x402proto',
    'ipfsPin',
    'failover',
    'hybridService',
    'mainnetOnly',
    'walletOnly',
    'tbaPayer',
  ],
  probe: ['essentialE1', 'free', 'selfhost', 'cronLocal', 'oss', 'optionalOrgan'],
  'auto-transplant': ['free', 'selfhost', 'oss', 'failover', 'optionalOrgan'],
  'probe-900s': ['free', 'selfhost', 'cronLocal', 'oss', 'optionalOrgan'],
  telegram: [
    'essentialE2',
    'free',
    'bigtech',
    'centralized',
    'bootstrap',
    'privacyLow',
    'reconfigTransfer',
    'partialSovereignty',
  ],
  matrix: [
    'essentialE2',
    'free',
    'federated',
    'selfhost',
    'openProtocol',
    'sovereign',
    'privacyHigh',
    'transferOk',
    'walletOnly',
  ],
  nostr: [
    'essentialE2',
    'free',
    'federated',
    'decentralized',
    'openProtocol',
    'sovereign',
    'privacyHigh',
    'transferOk',
    'walletOnly',
  ],
  simplex: [
    'essentialE2',
    'free',
    'decentralized',
    'sovereign',
    'privacyHigh',
    'transferOk',
    'oss',
  ],
  discord: [
    'essentialE2',
    'free',
    'bigtech',
    'centralized',
    'bootstrap',
    'privacyLow',
    'reconfigTransfer',
    'proprietary',
  ],
  whatsapp: [
    'ownerOptIn',
    'phoneReg',
    'requiresHuman',
    'bigtech',
    'centralized',
    'proprietary',
    'privacyLow',
    'brokenTransfer',
    'hygieneGate',
    'optInExplicit',
  ],
  signal: [
    'ownerOptIn',
    'phoneReg',
    'requiresHuman',
    'privacyLow',
    'brokenTransfer',
    'hygieneGate',
    'optInExplicit',
    'proprietary',
  ],
  web: ['essentialE2', 'free', 'selfhost', 'githubPages', 'privacyHigh'],
  'chat-api-local': [
    'essentialE2',
    'free',
    'selfhost',
    'experimental',
    'privacyHigh',
    'oss',
  ],
  'chat-api-caddy': ['essentialE2', 'free', 'selfhost', 'githubPages', 'privacyHigh'],
  'dapp-only': ['essentialE2', 'free', 'githubPages', 'privacyHigh', 'staticPresence'],
  'matrix-bot': [
    'essentialE2',
    'free',
    'selfhost',
    'federated',
    'experimental',
    'sovereign',
    'privacyHigh',
    'openProtocol',
    'reconfigTransfer',
  ],
  'hermes-bridge': [
    'free',
    'federated',
    'experimental',
    'sovereign',
    'privacyHigh',
    'hybridService',
    'oss',
  ],
  off: ['free'],
  'uruiru-svg': ['optionalOrgan', 'free', 'staticPresence', 'privacyHigh', 'oss'],
  'uruiru-png': ['optionalOrgan', 'free', 'staticPresence', 'privacyHigh'],
  'tts-x402': [
    'optionalOrgan',
    'paid',
    'x402proto',
    'decentralized',
    'mainnetOnly',
    'privacyHigh',
    'tbaPayer',
    'optInExplicit',
  ],
  'lab-mvp': ['optionalOrgan', 'free', 'experimental', 'oss', 'privacyHigh', 'githubPages'],
  'organ-studio-s1': ['optionalOrgan', 'free', 'experimental', 'oss', 'privacyHigh'],
  'stt-ocr': [
    'essentialE2',
    'free',
    'selfhost',
    'oss',
    'privacyHigh',
    'optionalOrgan',
  ],
  vision: [
    'paid',
    'bigtech',
    'centralized',
    'proprietary',
    'privacyLow',
    'requiresHuman',
    'optInExplicit',
    'hygieneGate',
    'subscription',
  ],
  traductor: [
    'paid',
    'bigtech',
    'centralized',
    'privacyLow',
    'optInExplicit',
    'partialSovereignty',
  ],
  syn2mas: ['selfhost', 'experimental', 'privacyHigh', 'oss', 'reconfigTransfer', 'cronLocal'],
  'classic-only': ['free', 'selfhost', 'privacyHigh', 'openProtocol'],
  arweave: ['paid', 'decentralized', 'arweave', 'openProtocol', 'transferOk', 'walletOnly'],
  'akash-runtime': ['paid', 'decentralized', 'akash', 'selfhost', 'tbaPayer', 'optInExplicit'],
  'ollama-local': ['free', 'selfhost', 'oss', 'privacyHigh', 'dormant', 'hoseOwner'],
  'elevenlabs-tts': [
    'subscription',
    'bigtech',
    'proprietary',
    'privacyLow',
    'requiresHuman',
    'optInExplicit',
    'hygieneGate',
  ],
  'github-pages-manifest': [
    'free',
    'githubPages',
    'centralized',
    'emailReg',
    'reconfigTransfer',
    'partialSovereignty',
  ],
  'nym-vpn': ['optionalOrgan', 'paid', 'nymPrivacy', 'gdpr', 'optInExplicit', 'experimental'],
  'aave-yield': ['defiRisk', 'onchain', 'mainnetOnly', 'tbaPayer', 'optInExplicit', 'hygieneGate'],
  'scout-convo': ['scout', 'optionalOrgan', 'free', 'experimental', 'privacyHigh'],
  'lip-sync-ml': [
    'optionalOrgan',
    'lipSyncML',
    'paid',
    'experimental',
    'optInExplicit',
    'hygieneGate',
    'privacyLow',
  ],
};

/** Etiqueta legible en esquema y desplegable (protocolo + pin). */
export const OPTION_LABELS = {
  'lab-local': 'Lab local (disco)',
  'toju-ipfs': 'toju + IPFS',
  'kubo-ipfs': 'kubo + IPFS',
  'w3stor-ipfs': 'W3Stor + IPFS',
  arweave: 'Arweave (archivo)',
  'export-only': 'Solo export',
  'toju-local': 'Lab local (disco)',
  'ipfs-primary': 'toju + IPFS',
  'w3stor-fallback': 'W3Stor + IPFS',
};

/** IDs antiguos del Lab → nomenclatura protocolo+pin (jul-2026). */
const MEMORY_OPTION_ALIASES = {
  'toju-local': 'lab-local',
  'ipfs-primary': 'toju-ipfs',
  'w3stor-fallback': 'w3stor-ipfs',
};

function normalizeMemoryOption(optionId) {
  return MEMORY_OPTION_ALIASES[optionId] ?? optionId;
}

function migrateDraftNodes(nodes) {
  for (const n of nodes) {
    if (n.id === 'memory' && n.option) n.option = normalizeMemoryOption(n.option);
  }
  return nodes;
}

function optionLabel(optionId) {
  return OPTION_LABELS[optionId] ?? optionId;
}

export const CATEGORIES = {
  alive: {
    id: 'alive',
    label: 'Vivo',
    hint: 'Funciona hoy en producción o runtime.',
    color: '#3ecf8e',
    wire: 'solid',
  },
  partial: {
    id: 'partial',
    label: 'Parcial',
    hint: 'Cableado pero incompleto (falta CORS, PNG, probe, etc.).',
    color: '#f0b429',
    wire: 'solid',
  },
  test: {
    id: 'test',
    label: 'Prueba',
    hint: 'Experimento activo — probar sin comprometer mainnet.',
    color: '#ff9f43',
    wire: 'dashed',
  },
  idea: {
    id: 'idea',
    label: 'Idea',
    hint: 'Medio/largo plazo — discutir viabilidad antes de cablear.',
    color: '#a78bfa',
    wire: 'dashed',
  },
  planned: {
    id: 'planned',
    label: 'Previsto',
    hint: 'En roadmap acordado; aún no empezado.',
    color: '#9aa8bc',
    wire: 'dotted',
  },
  off: {
    id: 'off',
    label: 'Apagado',
    hint: 'Desconectado a propósito o bloqueado.',
    color: '#5c6778',
    wire: 'dotted',
  },
};

const DEFAULT_GATEWAYS = [
  'telegram',
  'matrix',
  'nostr',
  'simplex',
  'web',
  'discord',
  'whatsapp',
  'signal',
];

/**
 * Disposición humanoide implícita (no literal — solo zonas):
 *   cabeza: sentidos · cerebro · memoria · presencia (voz/cara)
 *   torso: identidad · motor (corazón) · doctor
 *   extremidades: gateways y herramientas laterales
 */
const DEFAULT_NODES = [
  { id: 'senses', label: 'Sentidos', group: 'head', x: 188, y: 12, category: 'idea', option: 'stt-ocr' },
  { id: 'brain', label: 'Cerebro', group: 'head', x: 386, y: 4, category: 'alive', option: 'tx402' },
  { id: 'memory', label: 'Memoria', group: 'head', x: 584, y: 20, category: 'partial', option: 'toju-ipfs' },
  { id: 'presence', label: 'Presencia', group: 'head', x: 386, y: 84, category: 'partial', option: 'uruiru-svg' },
  { id: 'nft', label: 'NFT · TBA', group: 'torso', x: 386, y: 152, category: 'alive', option: 'base-mainnet' },
  { id: 'runtime', label: 'Motor', group: 'torso', x: 386, y: 232, category: 'alive', option: 'hermes' },
  { id: 'doctor', label: 'Doctor Qi', group: 'torso', x: 568, y: 214, category: 'alive', option: 'probe' },
  { id: 'gateway', label: 'Gateway chat', group: 'limb', x: 36, y: 232, category: 'partial', option: 'telegram' },
  { id: 'chatweb', label: 'Chat web', group: 'limb', x: 12, y: 328, category: 'test', option: 'chat-api-local' },
  { id: 'matrix', label: 'Matrix', group: 'limb', x: 128, y: 348, category: 'test', option: 'matrix-bot' },
  { id: 'studio', label: 'Lab Studio', group: 'limb', x: 736, y: 232, category: 'test', option: 'lab-mvp' },
  { id: 'mas', label: 'MAS / Element X', group: 'limb', x: 760, y: 328, category: 'idea', option: 'syn2mas' },
];

const DEFAULT_EDGES = [
  { id: 'e1', from: 'nft', to: 'runtime', category: 'alive' },
  { id: 'e2', from: 'runtime', to: 'brain', category: 'alive' },
  { id: 'e3', from: 'brain', to: 'memory', category: 'partial' },
  { id: 'e4', from: 'brain', to: 'senses', category: 'idea' },
  { id: 'e5', from: 'runtime', to: 'doctor', category: 'alive' },
  { id: 'e6', from: 'runtime', to: 'gateway', category: 'partial' },
  { id: 'e7', from: 'runtime', to: 'chatweb', category: 'test' },
  { id: 'e8', from: 'runtime', to: 'matrix', category: 'test' },
  { id: 'e9', from: 'runtime', to: 'presence', category: 'partial' },
  { id: 'e10', from: 'runtime', to: 'studio', category: 'test' },
  { id: 'e11', from: 'matrix', to: 'mas', category: 'idea' },
];

const NODE_OPTIONS = {
  nft: ['base-mainnet', 'sepolia-lab', 'github-pages-manifest'],
  runtime: ['hermes', 'openclaw-adapter', 'akash-runtime'],
  brain: ['tx402', 'openrouter-fallback', 'ollama-local'],
  memory: ['lab-local', 'toju-ipfs', 'kubo-ipfs', 'w3stor-ipfs', 'arweave', 'export-only'],
  doctor: ['probe', 'probe-900s', 'auto-transplant'],
  gateway: DEFAULT_GATEWAYS,
  chatweb: ['chat-api-local', 'chat-api-caddy', 'dapp-only'],
  matrix: ['matrix-bot', 'hermes-bridge', 'off'],
  presence: ['uruiru-svg', 'uruiru-png', 'tts-x402', 'elevenlabs-tts', 'lip-sync-ml'],
  studio: ['lab-mvp', 'organ-studio-s1'],
  senses: ['stt-ocr', 'vision', 'traductor'],
  mas: ['syn2mas', 'classic-only'],
};

const NODE_SIZE = { w: 108, h: 58 };

/** @type {{ nodes: typeof DEFAULT_NODES, edges: typeof DEFAULT_EDGES, gatewayCatalog: string[], notes: string, selectedId: string|null }} */
let state = loadDraft();

export async function initLabStudio() {
  try {
    const tokenId = await tokenFromPath();
    const agent = await fetchJson(assetUrl(`assets/agents/${tokenId}.json`));
    mergeAgentIntoState(agent);
  } catch {
    /* borrador local basta */
  }

  renderLegend();
  renderTagLegend();
  renderSchematic();
  renderNodeEditor();
  renderAssistant();
  renderIntentPreview();
  bindGlobalActions();
}

function applyHumanoidLayout(nodes) {
  const byId = Object.fromEntries((nodes ?? []).map((n) => [n.id, n]));
  return DEFAULT_NODES.map((def) => {
    const saved = byId[def.id];
    if (!saved) return { ...def };
    return {
      ...saved,
      x: def.x,
      y: def.y,
      group: def.group,
      label: saved.label ?? def.label,
    };
  });
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let nodes = migrateDraftNodes(parsed.nodes ?? structuredClone(DEFAULT_NODES));
      const layoutVersion = parsed.layoutVersion ?? 1;
      if (layoutVersion < LAYOUT_VERSION) {
        nodes = applyHumanoidLayout(nodes);
      }
      return {
        nodes,
        edges: parsed.edges ?? structuredClone(DEFAULT_EDGES),
        gatewayCatalog: parsed.gatewayCatalog ?? [...DEFAULT_GATEWAYS],
        notes: parsed.notes ?? '',
        selectedId: parsed.selectedId ?? null,
        layoutVersion: LAYOUT_VERSION,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    nodes: structuredClone(DEFAULT_NODES),
    edges: structuredClone(DEFAULT_EDGES),
    gatewayCatalog: [...DEFAULT_GATEWAYS],
    notes: '',
    selectedId: null,
    layoutVersion: LAYOUT_VERSION,
  };
}

function saveDraft() {
  state.layoutVersion = LAYOUT_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeAgentIntoState(agent) {
  const map = Object.fromEntries((agent.organs ?? []).map((o) => [o.id, o]));
  const statusToCat = {
    alive: 'alive',
    partial: 'partial',
    planned: 'planned',
    off: 'off',
  };
  for (const n of state.nodes) {
    const o = map[n.id];
    if (!o) continue;
    n.label = o.label ?? n.label;
    n.category = statusToCat[o.status] ?? n.category;
    if (o.detail) n.option = slugOption(o.detail);
  }
  if (agent.chat?.telegram) {
    const gw = state.nodes.find((n) => n.id === 'gateway');
    if (gw) {
      gw.option = 'telegram';
      gw.category = 'alive';
    }
  }
}

function slugOption(detail) {
  const d = String(detail).toLowerCase();
  if (d.includes('telegram')) return 'telegram';
  if (d.includes('matrix')) return 'matrix';
  if (d.includes('lab-remote') || d.includes('lab-local') || d.includes('lab remote')) return 'lab-local';
  if (d.includes('kubo') || d.includes('go-ipfs')) return 'kubo-ipfs';
  if (d.includes('w3stor')) return 'w3stor-ipfs';
  if (d.includes('toju')) return 'toju-ipfs';
  if (d.includes('ipfs')) return 'kubo-ipfs';
  if (d.includes('arweave')) return 'arweave';
  if (d.includes('export')) return 'export-only';
  if (d.includes('tx402')) return 'tx402';
  if (d.includes('hermes')) return 'hermes';
  if (d.includes('uruiru') || d.includes('rostro')) return 'uruiru-svg';
  if (d.includes('stt') || d.includes('ocr')) return 'stt-ocr';
  return d
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
}

function tagsForOption(optionId) {
  return OPTION_META[optionId] ?? ['experimental'];
}

/** Heurística para opciones custom añadidas en el Lab */
function inferTagsForCustomOption(optionId, nodeId) {
  const s = optionId.toLowerCase();
  const tags = new Set(['experimental']);

  const add = (...ids) => ids.forEach((id) => tags.add(id));

  if (/whatsapp|signal|sms|phone|sim/.test(s)) {
    add('ownerOptIn', 'phoneReg', 'requiresHuman', 'privacyLow', 'hygieneGate', 'optInExplicit');
  } else if (/discord|telegram|slack|meta|facebook/.test(s)) {
    add('free', 'bigtech', 'centralized', 'bootstrap', 'privacyLow', 'reconfigTransfer');
  } else if (/google|openai|anthropic|azure|aws|eleven|notion|drive|github(?!-pages)/.test(s)) {
    add('bigtech', 'centralized', 'proprietary', 'privacyLow', 'requiresHuman', 'optInExplicit');
  } else if (/nostr|matrix|simplex|federat/.test(s)) {
    add('free', 'federated', 'decentralized', 'sovereign', 'privacyHigh', 'openProtocol', 'transferOk');
  } else if (/kubo|go-ipfs|ipfs-node/.test(s)) {
    add('free', 'selfhost', 'ipfsPin', 'decentralized', 'privacyHigh', 'oss', 'transferable');
  } else if (/toju/.test(s)) {
    add('decentralized', 'paid', 'x402proto', 'ipfsPin', 'privacyHigh', 'transferable', 'walletOnly', 'tbaPayer', 'mainnetOnly');
  } else if (/w3stor/.test(s)) {
    add('decentralized', 'paid', 'x402proto', 'w3stor', 'ipfsPin', 'failover', 'walletOnly', 'tbaPayer');
  } else if (/ipfs|pinata|filebase|dweb/.test(s)) {
    add('decentralized', 'ipfsPin', 'privacyHigh', 'transferable');
    if (/pinata|filebase/.test(s)) add('paid', 'requiresHuman', 'centralized');
  } else if (/arweave/.test(s)) {
    add('decentralized', 'paid', 'arweave', 'openProtocol', 'transferOk', 'walletOnly');
  } else if (/x402/.test(s)) {
    add('decentralized', 'paid', 'x402proto', 'privacyHigh', 'walletOnly', 'tbaPayer');
  } else if (/akash|gpu|io-net|ollama|whisper-local/.test(s)) {
    add('akash', 'selfhost', 'decentralized', 'paid', 'privacyHigh', 'optInExplicit');
  } else if (/local|self|vps|hermes|cron|synapse|caddy/.test(s)) {
    add('free', 'selfhost', 'privacyHigh', 'oss');
  } else if (/vision|whisper-api|gpt|claude|saas|api-key/.test(s)) {
    add('paid', 'bigtech', 'centralized', 'privacyLow', 'optInExplicit', 'hygieneGate');
  } else if (/subscription|monthly|saas/.test(s)) add('subscription', 'paid');
  else if (/gdpr|eu|europe/.test(s)) add('gdpr', 'privacyHigh');
  else if (/nym|vpn|mixnet|tor/.test(s)) add('nymPrivacy', 'optionalOrgan', 'optInExplicit');
  else if (/defi|swap|dex|aave|yield|trade/.test(s)) {
    add('defiRisk', 'onchain', 'mainnetOnly', 'optInExplicit', 'hygieneGate', 'tbaPayer');
  } else if (/scout|lead|convo/.test(s)) add('scout', 'optionalOrgan');
  else if (/lip.?sync|tts|voice|kokoro/.test(s)) add('optionalOrgan', 'optInExplicit');
  else if (/pages|static|cdn/.test(s)) add('githubPages', 'free', 'reconfigTransfer');
  else if (/sepolia|lab|vims|115/.test(s)) add('labLegacy');
  else if (/mainnet|base|8453/.test(s)) add('mainnetOnly', 'onchain');

  if (nodeId === 'brain') add('essentialE1');
  if (nodeId === 'memory') add('essentialE1');
  if (nodeId === 'gateway' || nodeId === 'chatweb' || nodeId === 'matrix') add('essentialE2');
  if (nodeId === 'nft' || nodeId === 'runtime') add('essentialE1');
  if (['presence', 'senses', 'studio', 'mas'].includes(nodeId)) add('optionalOrgan');
  if (nodeId === 'gateway' && !tags.has('sovereign') && !tags.has('ownerOptIn')) add('bootstrap');

  return [...tags];
}

function tagEmojis(optionId, max = 6) {
  return tagsForOption(optionId)
    .slice(0, max)
    .map((id) => TAGS[id]?.emoji ?? '')
    .join('');
}

function renderTagLegend() {
  const root = document.getElementById('lab-tag-legend');
  if (!root) return;
  root.innerHTML = TAG_GROUPS.map(
    (g) => `
    <div class="lab-tag-group">
      <div class="lab-tag-group-title">${escapeHtml(g.title)}</div>
      <div class="lab-tag-group-chips">
        ${g.ids
          .filter((id) => TAGS[id])
          .map(
            (id) => {
              const t = TAGS[id];
              return `<span class="lab-tag-chip" title="${escapeAttr(t.hint)}"><span class="lab-tag-emoji">${t.emoji}</span> ${escapeHtml(t.label)}</span>`;
            }
          )
          .join('')}
      </div>
    </div>`
  ).join('');
}

function renderOptionTags(optionId, containerId = 'lab-option-tags') {
  const root = document.getElementById(containerId);
  if (!root) return;
  const ids = tagsForOption(optionId);
  root.innerHTML = ids
    .map((id) => {
      const t = TAGS[id];
      if (!t) return '';
      return `<span class="lab-tag-chip" title="${escapeAttr(t.hint)}"><span class="lab-tag-emoji">${t.emoji}</span> ${escapeHtml(t.label)}</span>`;
    })
    .join('');
}

function renderLegend() {
  const root = document.getElementById('lab-legend');
  if (!root) return;
  root.innerHTML = Object.values(CATEGORIES)
    .map(
      (c) => `
      <span class="lab-legend-item" title="${escapeAttr(c.hint)}">
        <span class="lab-swatch" style="background:${c.color}"></span>
        ${escapeHtml(c.label)}
      </span>`
    )
    .join('');
}

function edgeEndpoints(a, b) {
  const ax = a.x + NODE_SIZE.w / 2;
  const ay = a.y + NODE_SIZE.h / 2;
  const bx = b.x + NODE_SIZE.w / 2;
  const by = b.y + NODE_SIZE.h / 2;
  const dx = bx - ax;
  const dy = by - ay;

  if (Math.abs(dy) < 52 && Math.abs(dx) > 72) {
    if (dx > 0) {
      return { x1: a.x + NODE_SIZE.w, y1: ay, x2: b.x, y2: by };
    }
    return { x1: a.x, y1: ay, x2: b.x + NODE_SIZE.w, y2: by };
  }

  if (dy < -16) {
    return { x1: ax, y1: a.y, x2: bx, y2: b.y + NODE_SIZE.h };
  }

  return { x1: ax, y1: a.y + NODE_SIZE.h, x2: bx, y2: b.y };
}

function renderSchematic() {
  const svg = document.getElementById('lab-schematic');
  if (!svg) return;

  const nodeById = Object.fromEntries(state.nodes.map((n) => [n.id, n]));
  const lines = state.edges
    .map((e) => {
      const a = nodeById[e.from];
      const b = nodeById[e.to];
      if (!a || !b) return '';
      const cat = CATEGORIES[e.category] ?? CATEGORIES.planned;
      const { x1, y1, x2, y2 } = edgeEndpoints(a, b);
      const dash =
        cat.wire === 'dashed' ? '6 4' : cat.wire === 'dotted' ? '2 4' : 'none';
      return `<line class="lab-wire" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="${cat.color}" stroke-width="2" stroke-dasharray="${dash}"
        data-edge-id="${e.id}" />`;
    })
    .join('');

  const boxes = state.nodes
    .map((n) => {
      const cat = CATEGORIES[n.category] ?? CATEGORIES.planned;
      const selected = state.selectedId === n.id ? ' lab-node-selected' : '';
      return `
      <g class="lab-node${selected}" data-node-id="${n.id}" tabindex="0" role="button"
         aria-label="${escapeAttr(n.label)}">
        <rect x="${n.x}" y="${n.y}" width="${NODE_SIZE.w}" height="${NODE_SIZE.h}" rx="8"
          fill="var(--surface-2)" stroke="${cat.color}" stroke-width="2"
          stroke-dasharray="${cat.wire === 'dashed' ? '6 4' : cat.wire === 'dotted' ? '2 4' : 'none'}" />
        <text x="${n.x + NODE_SIZE.w / 2}" y="${n.y + 22}" text-anchor="middle"
          class="lab-node-title">${escapeHtml(n.label)}</text>
        <text x="${n.x + NODE_SIZE.w / 2}" y="${n.y + 36}" text-anchor="middle"
          class="lab-node-opt">${escapeHtml(optionLabel(n.option))}</text>
        <text x="${n.x + NODE_SIZE.w / 2}" y="${n.y + 48}" text-anchor="middle"
          class="lab-node-tags">${tagEmojis(n.option)}</text>
      </g>`;
    })
    .join('');

  svg.innerHTML = `${lines}${boxes}`;

  svg.querySelectorAll('.lab-node').forEach((g) => {
    g.addEventListener('click', () => selectNode(g.dataset.nodeId));
    g.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        selectNode(g.dataset.nodeId);
      }
    });
  });
}

function selectNode(id) {
  state.selectedId = id;
  saveDraft();
  renderSchematic();
  renderNodeEditor();
  renderAssistant();
  renderIntentPreview();
}

function renderNodeEditor() {
  const root = document.getElementById('lab-node-editor');
  if (!root) return;

  const node = state.nodes.find((n) => n.id === state.selectedId);
  if (!node) {
    root.innerHTML = '<p class="sub">Haz clic en un módulo del esquema para editarlo.</p>';
    return;
  }

  const opts = optionsForNode(node);
  const catOpts = Object.values(CATEGORIES)
    .map(
      (c) =>
        `<option value="${c.id}" ${node.category === c.id ? 'selected' : ''}>${c.label}</option>`
    )
    .join('');

  const optHtml = opts
    .map((o) => {
      const em = tagEmojis(o);
      const label = em ? `${em} ${optionLabel(o)}` : optionLabel(o);
      return `<option value="${escapeAttr(o)}" ${node.option === o ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    })
    .join('');

  root.innerHTML = `
    <h3 class="lab-panel-title">${escapeHtml(node.label)}</h3>
    <label class="lab-field">
      <span>Categoría (color)</span>
      <select id="lab-cat-select">${catOpts}</select>
    </label>
    <label class="lab-field">
      <span>Opción cableada</span>
      <select id="lab-opt-select">${optHtml}</select>
    </label>
    <div id="lab-option-tags" class="lab-option-tags" aria-label="Etiquetas de la opción"></div>
    <label class="lab-field">
      <span>Añadir opción al desplegable</span>
      <div class="lab-inline">
        <input type="text" id="lab-new-opt" placeholder="ej. discord" />
        <button type="button" class="btn btn-secondary btn-compact" id="lab-add-opt">+</button>
      </div>
    </label>
    <div class="lab-actions">
      <button type="button" class="btn btn-secondary btn-compact" id="lab-toggle-edge">Alternar cable al motor</button>
    </div>
  `;

  renderOptionTags(node.option);

  root.querySelector('#lab-cat-select')?.addEventListener('change', (ev) => {
    node.category = ev.target.value;
    syncEdgesForNode(node);
    saveDraft();
    renderSchematic();
    renderAssistant();
    renderIntentPreview();
  });

  root.querySelector('#lab-opt-select')?.addEventListener('change', (ev) => {
    node.option = ev.target.value;
    renderOptionTags(node.option);
    saveDraft();
    renderSchematic();
    renderAssistant();
    renderIntentPreview();
  });

  root.querySelector('#lab-add-opt')?.addEventListener('click', () => {
    const input = root.querySelector('#lab-new-opt');
    const val = (input?.value ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!val) return;
    if (node.id === 'gateway') {
      if (!state.gatewayCatalog.includes(val)) state.gatewayCatalog.push(val);
      NODE_OPTIONS.gateway = [...state.gatewayCatalog];
    } else if (!opts.includes(val)) {
      NODE_OPTIONS[node.id] = [...opts, val];
    }
    if (!OPTION_META[val]) {
      OPTION_META[val] = inferTagsForCustomOption(val, node.id);
    }
    node.option = val;
    if (input) input.value = '';
    saveDraft();
    renderNodeEditor();
    renderSchematic();
    renderAssistant();
    renderIntentPreview();
  });

  root.querySelector('#lab-toggle-edge')?.addEventListener('click', () => {
    toggleEdgeToRuntime(node.id);
  });
}

function optionsForNode(node) {
  if (node.id === 'gateway') return [...state.gatewayCatalog];
  return NODE_OPTIONS[node.id] ?? [node.option];
}

function syncEdgesForNode(node) {
  for (const e of state.edges) {
    if (e.from === node.id || e.to === node.id) e.category = node.category;
  }
}

function toggleEdgeToRuntime(nodeId) {
  if (nodeId === 'runtime') return;
  const existing = state.edges.find((e) => e.from === 'runtime' && e.to === nodeId);
  const node = state.nodes.find((n) => n.id === nodeId);
  if (existing) {
    state.edges = state.edges.filter((e) => e.id !== existing.id);
  } else if (node) {
    state.edges.push({
      id: `e-${Date.now()}`,
      from: 'runtime',
      to: nodeId,
      category: node.category,
    });
  }
  saveDraft();
  renderSchematic();
  renderIntentPreview();
}

function renderAssistant() {
  const root = document.getElementById('lab-assistant');
  if (!root) return;

  const node = state.nodes.find((n) => n.id === state.selectedId);
  const tips = [
    '<strong>Cómo usar el Lab</strong>',
    '1. Elige un módulo en el esquema.',
    '2. Cambia categoría (color) y opción en el desplegable.',
    '3. Añade opciones custom si quieres proponer algo nuevo.',
    '4. Elige destino: <em>Chat actual</em> (este hilo) o <em>Inbox</em> / <em>Nuevo</em>.',
    '5. Mensaje opcional + <em>Enviar a Cursor</em>.',
  ];

  if (node) {
    const cat = CATEGORIES[node.category];
    tips.push(
      `<hr class="lab-hr" />`,
      `<strong>Módulo:</strong> ${escapeHtml(node.label)}`,
      `<strong>Categoría:</strong> ${escapeHtml(cat.label)} — ${escapeHtml(cat.hint)}`,
      contextualTip(node)
    );
  } else {
    tips.push('<hr class="lab-hr" />', 'Selecciona un módulo para ver consejos específicos.');
  }

  root.innerHTML = tips.join('<br />');
}

function contextualTip(node) {
  const q = `¿Qué te parece cablear <code>${escapeHtml(node.label)}</code> con <code>${escapeHtml(optionLabel(node.option))}</code> (${CATEGORIES[node.category].label})?`;
  const map = {
    matrix: 'Requiere bot + token en V0. Element Classic hasta desplegar MAS.',
    chatweb: 'Siguiente paso: Caddy /agenft-api/ → :8787 + CORS.',
    mas: 'Migración syn2mas con downtime — planificar ventana aparte.',
    studio: 'Este Lab es el MVP del Organ Studio — evoluciona con el proyecto.',
    senses: 'Bloque 5 — después de estabilizar chat y memoria.',
    memory:
      'Bloque 3.2 — Memoria offchain = protocolo (IPFS) + pin (toju / kubo / W3Stor). Primary producto: toju + IPFS.',
  };
  const extra = map[node.id] ? `<br /><em>${escapeHtml(map[node.id])}</em>` : '';
  return `<br /><strong>Pregunta sugerida:</strong> ${q}${extra}`;
}

function renderIntentPreview() {
  const root = document.getElementById('lab-intent-preview');
  if (!root) return;
  root.value = buildChatMarkdown();
}

function buildChatMarkdown() {
  const lines = [
    '## Lab Studio — intención de cableado',
    '',
    `_Modo lab · borrador local · ${new Date().toISOString().slice(0, 16)}_`,
    '',
  ];

  if (state.notes.trim()) {
    lines.push('### Notas', state.notes.trim(), '');
  }

  lines.push('### Módulos');
  for (const n of state.nodes) {
    const cat = CATEGORIES[n.category];
    const tags = tagsForOption(n.option)
      .map((id) => TAGS[id]?.label)
      .filter(Boolean)
      .join(', ');
    lines.push(`- **${n.label}** → \`${optionLabel(n.option)}\` ${tagEmojis(n.option)} · _${cat.label}_ · ${tags}`);
  }

  const connected = state.edges.filter((e) => e.from === 'runtime').map((e) => e.to);
  lines.push('', '### Cables desde Motor', connected.length ? connected.map((id) => `- runtime → ${id}`).join('\n') : '_ninguno_');

  const experiments = state.nodes.filter((n) => n.category === 'test' || n.category === 'idea');
  if (experiments.length) {
    lines.push('', '### Pruebas e ideas (revisar contigo)');
    for (const n of experiments) {
      lines.push(`- ${n.label}: \`${optionLabel(n.option)}\` (${CATEGORIES[n.category].label})`);
    }
  }

  lines.push(
    '',
    '### Pregunta',
    state.selectedId
      ? `Quiero avanzar con **${state.nodes.find((n) => n.id === state.selectedId)?.label}**. ¿Es posible? ¿Orden sugerido?`
      : '¿Qué cableado priorizamos según este borrador?'
  );

  return lines.join('\n');
}

function buildFullPrompt(userMessage = '') {
  const msg = String(userMessage ?? '').trim();
  const body = buildChatMarkdown();
  if (!msg) return body;
  return `${msg}\n\n---\n\n${body}`;
}

function cursorPromptUrl(text) {
  return `https://cursor.com/link/prompt?text=${encodeURIComponent(text)}`;
}

function cursorAppUrl(text) {
  return `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(text)}`;
}

function getSendTarget() {
  const el = document.getElementById('lab-send-target');
  const v = el?.value ?? localStorage.getItem(SEND_TARGET_KEY);
  if (v && SEND_TARGETS[v]) return v;
  return 'current';
}

function saveSendTarget(id) {
  localStorage.setItem(SEND_TARGET_KEY, id);
}

function bridgeUrls() {
  const urls = [];
  const meta = document.querySelector('meta[name="agenft-lab-bridge-url"]');
  if (meta?.content?.trim()) urls.push(meta.content.trim().replace(/\/$/, ''));
  if (location.origin && location.protocol.startsWith('http')) {
    urls.push(`${location.origin}/agenft-lab-inbox`);
  }
  urls.push('http://127.0.0.1:8799');
  return [...new Set(urls)];
}

async function postLabInbox(full, userMsg) {
  const body = JSON.stringify({ markdown: buildChatMarkdown(), message: userMsg });
  let lastErr;
  for (const base of bridgeUrls()) {
    try {
      const res = await fetch(`${base}/v1/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? res.status);
      return json;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('Lab bridge no disponible');
}

function openCursorDeeplink(deeplinkPayload) {
  window.open(cursorPromptUrl(deeplinkPayload), '_blank', 'noopener,noreferrer');
  try {
    const a = document.createElement('a');
    a.href = cursorAppUrl(deeplinkPayload);
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    /* ignore */
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function sendToCursor() {
  const userMsg = document.getElementById('lab-user-message')?.value ?? '';
  const target = getSendTarget();
  const full = buildFullPrompt(userMsg);
  renderIntentPreview();

  let deeplinkPayload = full;
  if (full.length > CURSOR_PROMPT_MAX) {
    const head = userMsg.trim()
      ? `${userMsg.trim()}\n\n_(Intención Lab recortada — versión completa en portapapeles)_\n\n`
      : '_(Intención Lab recortada — versión completa en portapapeles)_\n\n';
    deeplinkPayload = head + full.slice(0, CURSOR_PROMPT_MAX - head.length);
  }

  if (target === 'current') {
    const ok = await copyText(full);
    flashStatus(
      ok
        ? 'Copiado. Vuelve a ESTE chat de Cursor y pega (Ctrl+V).'
        : 'Copia manualmente desde la vista previa.'
    );
    return;
  }

  if (target === 'inbox') {
    try {
      const result = await postLabInbox(full, userMsg);
      const short = userMsg.trim()
        ? `${userMsg.trim()}\n\nContinúa con @.cursor/lab-inbox/latest.md`
        : 'Continúa con @.cursor/lab-inbox/latest.md';
      await copyText(short);
      flashStatus(
        `Guardado en ${result.path}. Pega en el chat actual o usa @ en Cursor.`
      );
    } catch {
      const ok = await copyText(full);
      flashStatus(
        ok
          ? 'Bridge offline — copiado al portapapeles. Ejecuta: cd runtime && npm run lab:bridge'
          : 'Bridge offline. Arranca lab:bridge o usa Chat actual.'
      );
    }
    return;
  }

  if (target === 'new') {
    openCursorDeeplink(deeplinkPayload);
    flashStatus(
      full.length > CURSOR_PROMPT_MAX
        ? 'Abriendo chat nuevo (texto recortado en enlace).'
        : 'Abriendo chat nuevo — confirma el prompt en Cursor.'
    );
    return;
  }

  if (target === 'both') {
    await copyText(full);
    openCursorDeeplink(deeplinkPayload);
    flashStatus('Copiado + deeplink. Pega en chat actual o confirma el nuevo.');
  }
}

function bindGlobalActions() {
  document.getElementById('lab-send-cursor')?.addEventListener('click', () => {
    sendToCursor();
  });

  document.getElementById('lab-copy-chat')?.addEventListener('click', async () => {
    const userMsg = document.getElementById('lab-user-message')?.value ?? '';
    const text = buildFullPrompt(userMsg);
    renderIntentPreview();
    try {
      await navigator.clipboard.writeText(text);
      flashStatus('Copiado al portapapeles.');
    } catch {
      flashStatus('Selecciona el texto del panel inferior y cópialo manualmente.');
    }
  });

  document.getElementById('lab-reset')?.addEventListener('click', () => {
    if (!confirm('¿Resetear borrador local del Lab?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadDraft();
    state.selectedId = null;
    renderSchematic();
    renderNodeEditor();
    renderAssistant();
    renderIntentPreview();
    flashStatus('Borrador reseteado.');
  });

  document.getElementById('lab-notes')?.addEventListener('input', (ev) => {
    state.notes = ev.target.value;
    saveDraft();
    renderIntentPreview();
  });

  const notesEl = document.getElementById('lab-notes');
  if (notesEl) notesEl.value = state.notes;

  const sendEl = document.getElementById('lab-send-target');
  if (sendEl) {
    sendEl.value = localStorage.getItem(SEND_TARGET_KEY) || 'current';
    sendEl.addEventListener('change', (ev) => saveSendTarget(ev.target.value));
  }
}

function flashStatus(msg) {
  const el = document.getElementById('lab-status');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 4000);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
