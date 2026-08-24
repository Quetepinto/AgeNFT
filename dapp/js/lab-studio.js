/**
 * Lab Studio — esquema editable + asistente + borrador para chat (Cursor).
 * Categorías por color: vivo · parcial · prueba · idea · previsto · apagado
 */
import { assetUrl, fetchJson, tokenFromPath, applyAvatar, resolveImageSrc, imageFallbackSrc } from './shared.js';
import {
  bindOrganScaleControl,
  bindWatermarkControls,
  computeSchematicViewBox,
  getNodeFonts,
  getNodeSize,
  getOrganScale,
  getWatermarkEnabled,
  getWatermarkOpacity,
  nodeTextYs,
  ORGAN_SCALE_KEY,
  WATERMARK_ENABLED_KEY,
  WATERMARK_OPACITY_KEY,
} from './lab-display.js';

const STORAGE_KEY = 'agenft-lab-draft-v1';
const SEND_TARGET_KEY = 'agenft-lab-send-target-v1';
const DISMISSED_ALERTS_KEY = 'agenft-lab-dismissed-alerts-v1';
/** Reposiciona nodos al cambiar el esquema corporal (sin borrar opciones/categorías). */
const LAYOUT_VERSION = 3;
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

/** Qué es cada órgano del esquema — texto para principiantes. */
const NODE_BLURBS = {
  senses:
    'Los «sentidos» del agente: convierte voz, imágenes o texto escaneado en información que el Cerebro puede usar (STT, OCR, visión).',
  brain:
    'El Cerebro piensa y redacta respuestas. Elige el modelo de IA y cómo se paga cada inferencia (x402, OpenRouter, Ollama local, etc.).',
  memory:
    'Dónde viven conversaciones, archivos y recuerdos del agente: disco del VPS, IPFS con pin, Arweave u otras capas offchain.',
  presence:
    'Cara y voz en la web: avatar URUIRU, TTS, lip-sync. Lo que ve el usuario además del texto del chat.',
  nft:
    'Identidad onchain del agente (NFT + Token Bound Account en Base). Define quién es propietario y quién puede operarlo.',
  runtime:
    'El Motor: corazón que orquesta cada turno. Recibe mensajes, llama al Cerebro, Memoria y órganos cableados, y devuelve la respuesta.',
  doctor:
    'Doctor Qi — chequeos automáticos de salud (probe, intervalos, auto-transplant). Avisa si algo del runtime falla.',
  gateway:
    'Gateway chat: por dónde entran mensajes de apps externas (Telegram, Discord, etc.). El usuario escribe fuera de la web; el bot lo reenvía al Motor.',
  chatweb:
    'Chat web: hablar con el agente desde el navegador (la dApp). No es Telegram ni Matrix — es la caja de chat integrada en la página. Tus mensajes van al servicio chat-api y el Motor responde.',
  matrix:
    'Órgano Matrix: bot que vive en servidores Matrix (federado). Distinto del Gateway «matrix» (aún sin adaptador). Sirve salas Matrix / Element Classic.',
  studio:
    'Lab Studio: este panel donde diseñas cables, opciones y envías la intención a Cursor antes de aplicar el wiring real.',
  mas:
    'Puente hacia MAS (Matrix Authentication Service) y Element X. Migración futura desde el bot Matrix clásico.',
};

/** Qué hace cada opción del desplegable — una frase clara. */
const OPTION_BLURBS = {
  'base-mainnet': 'Agente en Base mainnet con TBA real — producción onchain.',
  'sepolia-lab': 'Red de prueba Sepolia — solo laboratorio, sin mainnet.',
  'github-pages-manifest': 'Manifiesto estático en GitHub Pages; identidad ligera sin contrato desplegado.',
  hermes: 'Runtime Hermes en el VPS: cron, turnos y adaptadores cableados.',
  'openclaw-adapter': 'Adaptador OpenClaw experimental — integración alternativa al Motor.',
  'akash-runtime': 'Desplegar el Motor en Akash (DePIN) — pago y hosting descentralizado.',
  tx402: 'Inferencias pagadas con x402 desde la TBA — modelo soberano en mainnet.',
  'openrouter-fallback': 'Respaldo vía OpenRouter (API centralizada) si x402 no está disponible.',
  'ollama-local': 'Modelo local con Ollama en tu máquina — privado, sin nube.',
  'lab-local': 'Memoria solo en disco del VPS (carpeta lab/) — rápido para desarrollo.',
  'toju-ipfs': 'Contenido en IPFS con pin en toju — capa producto recomendada.',
  'kubo-ipfs': 'Nodo IPFS kubo self-hosted — tú mantienes el pin.',
  'w3stor-ipfs': 'Pin en W3Stor (DePIN) — IPFS con respaldo comercial.',
  arweave: 'Archivo permanente en Arweave — pago one-shot, lectura larga duración.',
  'export-only': 'Exportar memoria sin escribir en red — backup manual.',
  probe: 'Probe de salud periódico — revisa servicios y wiring.',
  'probe-900s': 'Probe cada 900 s — menos ruido, mismo chequeo.',
  'auto-transplant': 'Intento automático de «transplant» si el probe detecta caída.',
  telegram: 'Bot de Telegram (@BotFather). Hoy es el único Gateway chat operativo en runtime.',
  matrix: 'Gateway vía Matrix — aún sin adaptador; usa telegram o el órgano Matrix aparte.',
  nostr: 'Gateway Nostr — propuesto, no implementado en runtime.',
  simplex: 'Gateway SimpleX — propuesto, privacidad alta, no implementado.',
  web: 'Gateway web genérico — placeholder para futuro canal HTTP.',
  discord: 'Gateway Discord — propuesto, no implementado.',
  whatsapp: 'Gateway WhatsApp — requiere teléfono humano; no recomendado para transferencia.',
  signal: 'Gateway Signal — requiere teléfono humano; no recomendado para transferencia.',
  'chat-api-local': 'API chat-api en tu VPS (:8787). La dApp envía POST /v1/turn y recibe la respuesta del Motor.',
  'chat-api-caddy': 'Misma API publicada con Caddy (HTTPS, /agenft-api/) para dApp en GitHub Pages.',
  'dapp-only': 'Solo la interfaz web estática — sin API cableada; chat no funcionará hasta conectar chat-api.',
  'matrix-bot': 'Bot Matrix clásico en tu homeserver — salas Element / Synapse.',
  'hermes-bridge': 'Puente Hermes ↔ Matrix — experimental, federación híbrida.',
  off: 'Desactivado — sin bot Matrix en este cable.',
  'uruiru-svg': 'Avatar URUIRU vectorial en la dApp — ligero y animable.',
  'uruiru-png': 'Avatar PNG estático — falta animación/lip-sync.',
  'tts-x402': 'Voz sintética pagada con x402 — TTS soberano.',
  'elevenlabs-tts': 'Voz ElevenLabs (suscripción) — calidad alta, nube propietaria.',
  'lip-sync-ml': 'Sincronización labial ML — experimental, requiere opt-in.',
  'lab-mvp': 'Lab Studio MVP — el panel actual de cableado.',
  'organ-studio-s1': 'Organ Studio fase S1 — evolución futura del Lab.',
  'stt-ocr': 'Speech-to-text y OCR locales — voz e imágenes a texto.',
  vision: 'Visión por API de terceros — requiere opt-in y revisar privacidad.',
  traductor: 'Traducción automática — útil para multilingüe, datos salen a servicio externo.',
  syn2mas: 'Migración syn2mas hacia MAS/Element X — planificar ventana de downtime.',
  'classic-only': 'Quedarse en bot Matrix clásico sin migrar a MAS.',
};

function nodeBlurb(nodeId) {
  return NODE_BLURBS[nodeId] ?? 'Módulo del esquema. Cablea al Motor para que participe en cada turno del agente.';
}

function optionBlurb(optionId, nodeId = null) {
  if (OPTION_BLURBS[optionId]) return OPTION_BLURBS[optionId];
  if (nodeId === 'gateway') {
    return `Canal «${optionLabel(optionId)}» como Gateway chat — comprueba en Cursor si ya hay adaptador runtime.`;
  }
  return `Opción «${optionLabel(optionId)}». Si es custom, descríbela en el mensaje a Cursor.`;
}

function renderOptionBlurb(optionId, nodeId, containerId = 'lab-option-blurb') {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.textContent = optionBlurb(optionId, nodeId);
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

/** Opciones con adaptador runtime operativo hoy (Jul-2026). Vacío = nada cableado aún. */
const RUNTIME_LIVE_OPTIONS = {
  nft: new Set(['base-mainnet']),
  runtime: new Set(['hermes']),
  brain: new Set(['tx402', 'openrouter-fallback']),
  memory: new Set(['lab-local', 'toju-ipfs', 'kubo-ipfs', 'w3stor-ipfs', 'export-only', 'arweave']),
  doctor: new Set(['probe', 'probe-900s']),
  gateway: new Set(['telegram']),
  chatweb: new Set(['chat-api-local']),
  matrix: new Set([]),
  mas: new Set([]),
  senses: new Set([]),
  presence: new Set(['uruiru-svg', 'uruiru-png']),
  studio: new Set(['lab-mvp']),
};

function labEdgeExists(from, to) {
  return state.edges.some((e) => e.from === from && e.to === to);
}

function labIsRuntimeLinked(nodeId) {
  if (nodeId === 'runtime' || nodeId === 'nft' || nodeId === 'brain') return true;
  return labEdgeExists('runtime', nodeId);
}

/**
 * @returns {{ id: string, level: 'warn'|'info', title: string, body: string }[]}
 */
function collectFeasibilityAlerts(focusNodeId = null) {
  const alerts = [];
  const push = (alert) => {
    if (!alerts.some((a) => a.id === alert.id)) alerts.push(alert);
  };

  const gw = state.nodes.find((n) => n.id === 'gateway');
  const matrixNode = state.nodes.find((n) => n.id === 'matrix');

  if (gw && labIsRuntimeLinked('gateway') && !RUNTIME_LIVE_OPTIONS.gateway.has(gw.option)) {
    push({
      id: 'gateway-not-live',
      level: 'warn',
      title: 'Gateway sin adaptador en el runtime',
      body: `«${optionLabel(gw.option)}» en Gateway chat no tiene bot/adaptador en el VPS todavía. Solo Telegram está implementado. El wiring se guardará pero ese canal no arrancará.`,
    });
  }

  if (gw?.option === 'matrix' && matrixNode) {
    push({
      id: 'gateway-matrix-vs-organ',
      level: 'warn',
      title: 'Gateway Matrix ≠ órgano Matrix',
      body:
        'Gateway chat = canal por donde entran mensajes. Órgano Matrix = pieza aparte (cable Motor → Matrix). Elegir matrix en Gateway no conecta ni activa el órgano Matrix.',
    });
  }

  if (labEdgeExists('matrix', 'mas') && !labEdgeExists('runtime', 'matrix')) {
    push({
      id: 'mas-no-motor',
      level: 'warn',
      title: 'MAS sin alimentación del Motor',
      body:
        'Hay cable Matrix → MAS pero Matrix no está conectado al Motor. Esa rama no recibirá turnos del agente hasta cablear Motor → Matrix.',
    });
  }

  const returnEdges = state.edges.filter(
    (e) => e.to === 'runtime' && e.from !== 'runtime' && labEdgeExists('runtime', e.from)
  );
  if (returnEdges.length) {
    push({
      id: 'return-visual',
      level: 'info',
      title: 'Cable de vuelta solo visual',
      body: `El runtime no interpreta aún ${returnEdges.length} cable(s) de vuelta (ej. Gateway → Motor). Sirven como documentación en el dibujo.`,
    });
  }

  for (const node of state.nodes) {
    const live = RUNTIME_LIVE_OPTIONS[node.id];
    if (!live) continue;

    const linked = labIsRuntimeLinked(node.id) || labEdgeExists('brain', node.id);
    if (!linked && node.id !== focusNodeId) continue;

    if (live.size === 0 && node.category !== 'off') {
      push({
        id: `organ-not-live-${node.id}`,
        level: 'warn',
        title: `${node.label}: sin runtime todavía`,
        body: `El órgano «${optionLabel(node.option)}» está en el esquema pero no hay adaptador operativo en el VPS. Requiere desarrollo o cableado adicional antes de funcionar.`,
      });
    } else if (!live.has(node.option) && node.category !== 'off') {
      push({
        id: `option-not-live-${node.id}-${node.option}`,
        level: 'warn',
        title: `${node.label}: opción no operativa`,
        body: `«${optionLabel(node.option)}» aún no tiene adaptador en runtime. El borrador se puede guardar; no tendrá efecto hasta implementarlo.`,
      });
    }
  }

  if (focusNodeId && focusNodeId !== 'runtime' && focusNodeId !== 'nft' && focusNodeId !== 'brain') {
    push({
      id: 'ui-motor-only',
      level: 'info',
      title: 'Solo cables al Motor desde este editor',
      body:
        'Aquí solo puedes conectar/desconectar Motor → órgano (y cable de vuelta visual). Para otras rutas (ej. Matrix → MAS) usa la plantilla inicial o pide a Cursor.',
    });
  }

  if (!organStatusUi.bridgeOnline) {
    push({
      id: 'bridge-offline-green',
      level: 'info',
      title: 'Sin cable verde — bridge no alcanzable',
      body:
        'El Lab en tu navegador no contacta lab:bridge (127.0.0.1:8799). Abre Lab en el mismo VPS, reinicia npm run lab:bridge y recarga (Ctrl+Shift+R). Desde duckdns/portátil no verás cables verdes.',
    });
  } else if (organStatusUi.bridgeStale) {
    push({
      id: 'bridge-stale-green',
      level: 'warn',
      title: 'Bridge desactualizado',
      body: 'Reinicia en el VPS: cd ageNFT/runtime && npm run lab:bridge — luego recarga Lab.',
    });
  }

  for (const lock of computeLiveEdgeLocks()) {
    const draftHas = labEdgeExists(lock.from, lock.to);
    push({
      id: `live-lock-${lock.organId}`,
      level: 'live',
      title: `${lock.label} — conexión real activa`,
      body: draftHas
        ? `${lock.hint} El cable verde en el gráfico refleja el servicio en marcha, no solo el dibujo.`
        : `${lock.hint} En el gráfico verás el cable en verde aunque lo hayas quitado en el borrador.`,
    });
  }

  return alerts;
}

function renderAlertHtml(alert) {
  const level = alert.level === 'live' ? 'live' : alert.level;
  return `<div class="lab-alert lab-alert-${level}" role="alert" data-alert-id="${escapeAttr(alert.id)}">
    <button type="button" class="lab-alert-dismiss" data-dismiss-alert="${escapeAttr(alert.id)}" aria-label="Cerrar aviso">×</button>
    <strong>${escapeHtml(alert.title)}</strong>
    <span class="lab-alert-body">${escapeHtml(alert.body)}</span>
  </div>`;
}

function loadDismissedAlerts() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(DISMISSED_ALERTS_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveDismissedAlerts(ids) {
  sessionStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...ids]));
}

function dismissAlert(alertId) {
  const dismissed = loadDismissedAlerts();
  dismissed.add(alertId);
  saveDismissedAlerts(dismissed);
  renderFeasibilityAlerts(state.selectedId);
  renderAssistant();
}

function dismissAllVisibleAlerts() {
  const dismissed = loadDismissedAlerts();
  for (const a of collectFeasibilityAlerts()) dismissed.add(a.id);
  saveDismissedAlerts(dismissed);
  renderFeasibilityAlerts(state.selectedId);
  renderAssistant();
}

function visibleFeasibilityAlerts(focusNodeId = null) {
  const dismissed = loadDismissedAlerts();
  const all = focusNodeId ? collectFeasibilityAlerts(focusNodeId) : collectFeasibilityAlerts();
  return all.filter((a) => !dismissed.has(a.id));
}

function renderFeasibilityAlerts(focusNodeId = null) {
  const globalRoot = document.getElementById('lab-feasibility-alerts');
  const popoverRoot = document.getElementById('lab-popover-alerts');
  const toolbar = document.getElementById('lab-feasibility-toolbar');
  const selectedId = state.selectedId;
  const popoverOpen = Boolean(selectedId && popoverRoot);
  const visibleAll = visibleFeasibilityAlerts();
  const visibleFocus = selectedId ? visibleFeasibilityAlerts(selectedId) : [];
  const visibleHeader = popoverOpen
    ? visibleAll.filter((a) => !visibleFocus.some((f) => f.id === a.id))
    : visibleAll;

  if (globalRoot) {
    globalRoot.innerHTML = visibleHeader.map(renderAlertHtml).join('');
  }
  if (popoverRoot) {
    popoverRoot.innerHTML = visibleFocus.map(renderAlertHtml).join('');
  }
  if (toolbar) {
    toolbar.hidden = visibleHeader.length === 0;
  }

  requestAnimationFrame(syncLabHeaderOffset);
  return visibleAll;
}

function bindAlertDismissHandlers() {
  document.getElementById('lab-dismiss-all-alerts')?.addEventListener('click', () => {
    dismissAllVisibleAlerts();
  });
  if (bindAlertDismissHandlers._bound) return;
  bindAlertDismissHandlers._bound = true;
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-dismiss-alert]');
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    dismissAlert(btn.dataset.dismissAlert);
  });
}

function flashFeasibilityForOption(node) {
  const alerts = collectFeasibilityAlerts(node.id).filter((a) => a.level === 'warn');
  if (alerts.length) {
    flashStatus(`${alerts[0].title} — ${alerts[0].body}`, 'warn', 9000);
  }
}

function confirmIfFeasibilityWarnings(actionLabel) {
  const warns = visibleFeasibilityAlerts().filter((a) => a.level === 'warn');
  if (!warns.length) return true;
  const summary = warns.map((w) => `• ${w.title}`).join('\n');
  return confirm(
    `${warns.length} advertencia(s) en el borrador:\n\n${summary}\n\n¿${actionLabel} igual?`
  );
}

const ORGAN_STATE_LABELS = {
  ready: { cls: 'ok', text: 'Configurado' },
  partial: { cls: 'warn', text: 'Parcial — faltan pasos' },
  not_wired: { cls: 'info', text: 'No cableado' },
  unsupported: { cls: 'warn', text: 'No implementado aún' },
};

/** Guía estática cuando bridge offline (sin probes en vivo). */
const ORGAN_STATUS_STATIC = {
  gateway: {
    telegram: {
      state: 'partial',
      label: 'Revisar en VPS',
      checks: [
        { ok: null, label: 'Cableado al Motor', detail: 'Comprueba en el esquema' },
        { ok: null, label: 'Token bot', detail: '~/.credentials/agenft-telegram.env' },
        { ok: null, label: 'Proceso bot', detail: 'npm run telegram:mainnet:pay' },
      ],
      steps: [
        'Cablear Gateway → Motor y aplicar wiring (Cursor o bridge).',
        'Bot @BotFather → token en ~/.credentials/agenft-telegram.env',
        'cd ageNFT/runtime && npm run lab:bridge (para estado en vivo aquí)',
        'cd ageNFT/runtime && npm run telegram:mainnet:pay',
      ],
    },
    matrix: {
      state: 'unsupported',
      label: 'Gateway Matrix no operativo',
      checks: [{ ok: false, label: 'Adaptador runtime', detail: 'Solo Telegram implementado' }],
      steps: [
        'Gateway Matrix ≠ órgano Matrix.',
        'Usa telegram en Gateway para chat hoy, o pide adaptador en Cursor.',
      ],
    },
  },
  chatweb: {
    'chat-api-local': {
      state: 'partial',
      label: 'Revisar en VPS',
      checks: [
        { ok: null, label: 'Cableado al Motor', detail: 'Comprueba en el esquema' },
        { ok: null, label: 'chat-api :8787', detail: 'npm run chat:api' },
      ],
      steps: [
        'Cablear Chat web al Motor.',
        'cd runtime && npm run chat:api',
        'curl http://127.0.0.1:8787/health',
      ],
    },
  },
};

/** @type {{ organStatusReport: object|null, organStatusLoading: boolean, bridgeOnline: boolean }} */
const organStatusUi = {
  organStatusReport: null,
  organStatusLoading: false,
  bridgeOnline: false,
  bridgeStale: false,
};

function getOrganLiveRecord(nodeId, option = null) {
  const organs = organStatusUi.organStatusReport?.organs ?? [];
  return organs.find((o) => o.nodeId === nodeId && (option == null || o.option === option));
}

/** Cables que el VPS mantiene “vivos” aunque el borrador intente quitarlos. */
function computeLiveEdgeLocks() {
  if (!organStatusUi.bridgeOnline || !organStatusUi.organStatusReport) return [];

  const locks = [];
  const gw = getOrganLiveRecord('gateway', 'telegram');
  if (gw?.live?.edgeLocked) {
    locks.push({
      id: 'live-runtime-gateway',
      from: 'runtime',
      to: 'gateway',
      organId: 'gateway',
      label: 'Telegram en línea',
      hint:
        'El bot de Telegram sigue activo en el VPS. No puedes quitar este cable solo en Lab. Para desconectar: 1) para el bot (Ctrl+C en el VPS), 2) quita el cable aquí, 3) Enviar → Inbox y «continúa» en Cursor.',
    });
  }

  const cw = getOrganLiveRecord('chatweb', 'chat-api-local');
  if (cw?.live?.edgeLocked) {
    locks.push({
      id: 'live-runtime-chatweb',
      from: 'runtime',
      to: 'chatweb',
      organId: 'chatweb',
      label: 'Chat web activo',
      hint:
        'El servicio chat-api (:8787) sigue en marcha. Para quitar el cable: detén npm run chat:api, luego desconecta y aplica wiring.',
    });
  }

  return locks;
}

function getLiveEdgeLock(from, to) {
  return computeLiveEdgeLocks().find((l) => l.from === from && l.to === to) ?? null;
}

function getEffectiveEdges() {
  const edges = (state.edges ?? []).map((e) => ({ ...e, live: false }));
  for (const lock of computeLiveEdgeLocks()) {
    const idx = edges.findIndex((e) => e.from === lock.from && e.to === lock.to);
    if (idx >= 0) edges[idx] = { ...edges[idx], live: true, liveLock: lock };
    else {
      const node = state.nodes.find((n) => n.id === lock.to);
      edges.push({
        id: lock.id,
        from: lock.from,
        to: lock.to,
        category: node?.category ?? 'alive',
        live: true,
        liveLock: lock,
      });
    }
  }
  return edges;
}

function refreshLiveOrganUi() {
  renderSchematic();
  renderFeasibilityAlerts(state.selectedId);
  const node = state.nodes.find((n) => n.id === state.selectedId);
  if (node) {
    renderOrganStatusPanel(node);
    updatePopoverLiveChrome(node);
  }
}

/** Actualiza banner/avisos del popover sin reconstruir todo el panel. */
function updatePopoverLiveChrome(node) {
  const pop = document.getElementById('lab-node-editor');
  const notices = pop?.querySelector('.lab-popover-notices');
  if (!pop || !notices || !node || pop.classList.contains('lab-node-popover-hidden')) return;

  const liveRec = getOrganLiveRecord(node.id, node.option);
  const sessionActive = Boolean(liveRec?.live?.sessionActive);
  const edgeLock = node.id !== 'runtime' ? getLiveEdgeLock('runtime', node.id) : null;

  notices.querySelector('.lab-live-banner')?.remove();
  if (sessionActive) {
    notices.insertAdjacentHTML(
      'afterbegin',
      '<p class="lab-live-banner" role="status"><span class="lab-live-dot" aria-hidden="true"></span> Conectado y en línea en el VPS</p>'
    );
  } else if (edgeLock) {
    notices.insertAdjacentHTML(
      'afterbegin',
      '<p class="lab-live-banner lab-live-banner-partial" role="status"><span class="lab-live-dot" aria-hidden="true"></span> Servicio activo — cable fijado</p>'
    );
  }

  renderFeasibilityAlerts(node.id);

  const edgeBtn = pop.querySelector('#lab-toggle-edge');
  if (edgeBtn) {
    edgeBtn.disabled = Boolean(edgeLock);
    edgeBtn.classList.toggle('btn-live-locked', Boolean(edgeLock));
    edgeBtn.textContent = edgeLock ? '● Cable fijado (en línea)' : 'Alternar cable al motor';
    if (edgeLock) {
      edgeBtn.title = 'Para el servicio en el VPS antes de quitar el cable';
    } else {
      edgeBtn.removeAttribute('title');
    }
  }
}

async function fetchOrganStatus(nodeId = null) {
  organStatusUi.organStatusLoading = true;
  let lastErr;
  for (const base of bridgeUrls()) {
    try {
      const q = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
      const res = await fetch(`${base}/v1/organs/status${q}`, {
        signal: AbortSignal.timeout(4500),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? res.status);
      if (nodeId && organStatusUi.organStatusReport?.organs) {
        const merged = organStatusUi.organStatusReport.organs.filter((o) => o.nodeId !== nodeId);
        organStatusUi.organStatusReport = {
          ...json,
          organs: [...merged, ...json.organs],
        };
      } else {
        organStatusUi.organStatusReport = json;
      }
      organStatusUi.organStatusLoading = false;
      renderOrganStatusPanel(state.nodes.find((n) => n.id === state.selectedId));
      refreshLiveOrganUi();
      return json;
    } catch (e) {
      lastErr = e;
    }
  }
  organStatusUi.organStatusLoading = false;
  if (!organStatusUi.bridgeOnline) organStatusUi.organStatusReport = null;
  renderOrganStatusPanel(state.nodes.find((n) => n.id === state.selectedId));
  refreshLiveOrganUi();
  return lastErr;
}

function resolveOrganStatus(node) {
  if (!node) return null;
  const live = organStatusUi.organStatusReport?.organs?.find(
    (o) => o.nodeId === node.id && o.option === node.option
  );
  if (live) return { ...live, source: 'live' };
  const staticMap = ORGAN_STATUS_STATIC[node.id];
  const staticEntry = staticMap?.[node.option] ?? staticMap?.[Object.keys(staticMap ?? {})[0]];
  if (staticEntry) {
    return {
      nodeId: node.id,
      option: node.option,
      source: 'static',
      ...staticEntry,
    };
  }
  return {
    nodeId: node.id,
    option: node.option,
    source: 'static',
    state: labIsRuntimeLinked(node.id) ? 'partial' : 'not_wired',
    label: labIsRuntimeLinked(node.id) ? 'En esquema' : 'No cableado',
    checks: [
      {
        ok: labIsRuntimeLinked(node.id),
        label: 'En wiring / cableado',
        detail: organStatusUi.bridgeOnline ? 'Sin probe específico' : 'Bridge offline — estado limitado',
      },
    ],
    steps: ['Arranca lab:bridge en el VPS para estado en vivo.', 'Consulta docs/research/lab/'],
  };
}

function renderOrganStatusPanel(node) {
  const root = document.getElementById('lab-organ-status');
  if (!root) return;
  if (!node) {
    root.innerHTML = '';
    return;
  }

  const status = resolveOrganStatus(node);
  if (!status) {
    root.innerHTML = '';
    return;
  }

  const stepsOpen = root.querySelector('.lab-organ-steps')?.open ?? false;

  const stateMeta = ORGAN_STATE_LABELS[status.state] ?? ORGAN_STATE_LABELS.partial;
  const sourceHint =
    status.source === 'live'
      ? 'Estado en vivo (VPS)'
      : organStatusUi.bridgeOnline
        ? 'Sin datos — reintentando…'
        : 'Guía estática — arranca lab:bridge para probes';

  const checksHtml = (status.checks ?? [])
    .map((c) => {
      const icon = c.ok === true ? '✓' : c.ok === false ? '✗' : '○';
      const cls = c.ok === true ? 'lab-check-ok' : c.ok === false ? 'lab-check-fail' : 'lab-check-unknown';
      const detail = c.detail ? `<span class="lab-check-detail">${escapeHtml(c.detail)}</span>` : '';
      return `<li class="${cls}"><span class="lab-check-icon">${icon}</span> ${escapeHtml(c.label)}${detail}</li>`;
    })
    .join('');

  const stepsHtml = (status.steps ?? [])
    .map((s, i) => `<li>${escapeHtml(s)}</li>`)
    .join('');

  root.innerHTML = `
    <div class="lab-organ-status-head">
      <h4 class="lab-organ-status-title">Estado · ${escapeHtml(optionLabel(status.option))}</h4>
      <span class="lab-organ-state lab-organ-state-${stateMeta.cls}">${escapeHtml(status.label ?? stateMeta.text)}</span>
    </div>
    <p class="sub lab-organ-status-source">${escapeHtml(sourceHint)}${organStatusUi.organStatusLoading ? ' …' : ''}</p>
    ${checksHtml ? `<ul class="lab-check-list">${checksHtml}</ul>` : ''}
    ${
      stepsHtml
        ? `<details class="lab-organ-steps"${stepsOpen ? ' open' : ''}><summary>Completar configuración</summary><ol>${stepsHtml}</ol></details>`
        : ''
    }
  `;
}

/**
 * Disposición humanoide implícita (no literal — solo zonas):
 *   cabeza: sentidos · cerebro · memoria · presencia (voz/cara)
 *   torso: identidad · motor (corazón) · doctor
 *   extremidades: gateways y herramientas laterales
 */
const DEFAULT_NODES = [
  { id: 'senses', label: 'Sentidos', group: 'head', x: 200, y: 8, category: 'idea', option: 'stt-ocr' },
  { id: 'brain', label: 'Cerebro', group: 'head', x: 416, y: 0, category: 'alive', option: 'tx402' },
  { id: 'memory', label: 'Memoria', group: 'head', x: 632, y: 12, category: 'partial', option: 'toju-ipfs' },
  { id: 'presence', label: 'Presencia', group: 'head', x: 416, y: 96, category: 'partial', option: 'uruiru-svg' },
  { id: 'nft', label: 'NFT · TBA', group: 'torso', x: 416, y: 178, category: 'alive', option: 'base-mainnet' },
  { id: 'runtime', label: 'Motor', group: 'torso', x: 416, y: 268, category: 'alive', option: 'hermes' },
  { id: 'doctor', label: 'Doctor Qi', group: 'torso', x: 608, y: 248, category: 'alive', option: 'probe' },
  { id: 'gateway', label: 'Gateway chat', group: 'limb', x: 48, y: 268, category: 'partial', option: 'telegram' },
  { id: 'chatweb', label: 'Chat web', group: 'limb', x: 24, y: 368, category: 'test', option: 'chat-api-local' },
  { id: 'matrix', label: 'Matrix', group: 'limb', x: 152, y: 388, category: 'test', option: 'matrix-bot' },
  { id: 'studio', label: 'Lab Studio', group: 'limb', x: 784, y: 268, category: 'test', option: 'lab-mvp' },
  { id: 'mas', label: 'MAS / Element X', group: 'limb', x: 808, y: 368, category: 'idea', option: 'syn2mas' },
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

/** @type {{ nodes: typeof DEFAULT_NODES, edges: typeof DEFAULT_EDGES, gatewayCatalog: string[], notes: string, selectedId: string|null }} */
let state = loadDraft();

export async function initLabStudio() {
  let agent = null;
  try {
    const tokenId = await tokenFromPath();
    agent = await fetchJson(assetUrl(`assets/agents/${tokenId}.json`));
    mergeAgentIntoState(agent);
  } catch {
    /* borrador local basta */
  }

  renderLabIdentity(agent);

  renderBridgeHelp(false);

  await mergeWiringFromBridge();
  await refreshBridgeStatus();

  renderLegend();
  renderTagLegend();
  renderSchematic();
  renderNodeEditor();
  renderAssistant();
  renderIntentPreview();
  renderFeasibilityAlerts(state.selectedId);
  bindGlobalActions();
  bindAlertDismissHandlers();
  bindLabPanels();
  bindPanelChrome();
  bindGuidedTest();
  bindSchematicDismiss();
  bindOrganScaleControl(
    document.getElementById('lab-organ-scale'),
    document.getElementById('lab-organ-scale-val'),
    () => {
      renderSchematic();
      const node = state.nodes.find((n) => n.id === state.selectedId);
      if (node) positionNodePopover(node);
    }
  );
  bindWatermarkControls({
    enabledInput: document.getElementById('lab-watermark-enabled'),
    opacityInput: document.getElementById('lab-watermark-opacity'),
    valueEl: document.getElementById('lab-watermark-opacity-val'),
    wrap: document.querySelector('.lab-schematic-wrap'),
    onChange: () => applyLabWatermark(),
  });
  applyLabWatermark();
  window.addEventListener('storage', (ev) => {
    if (ev.key === ORGAN_SCALE_KEY) {
      bindOrganScaleControl(
        document.getElementById('lab-organ-scale'),
        document.getElementById('lab-organ-scale-val'),
        null
      );
      renderSchematic();
      const node = state.nodes.find((n) => n.id === state.selectedId);
      if (node) positionNodePopover(node);
      return;
    }
    if (ev.key === WATERMARK_ENABLED_KEY || ev.key === WATERMARK_OPACITY_KEY) {
      bindWatermarkControls({
        enabledInput: document.getElementById('lab-watermark-enabled'),
        opacityInput: document.getElementById('lab-watermark-opacity'),
        valueEl: document.getElementById('lab-watermark-opacity-val'),
        wrap: document.querySelector('.lab-schematic-wrap'),
        onChange: () => applyLabWatermark(),
      });
      applyLabWatermark();
    }
  });
  window.addEventListener('resize', () => {
    syncLabHeaderOffset();
    const node = state.nodes.find((n) => n.id === state.selectedId);
    if (node) positionNodePopover(node);
  });
  syncLabHeaderOffset();
  requestAnimationFrame(syncLabHeaderOffset);
  const header = document.querySelector('.lab-float-top');
  if (header && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => syncLabHeaderOffset()).observe(header);
  }
  setInterval(() => {
    if (organStatusUi.bridgeOnline) fetchOrganStatus();
  }, 20000);
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

function mergeWiringFromBridge() {
  return (async () => {
    for (const base of bridgeUrls()) {
      try {
        const packId = await resolvePackIdForWiring();
        const res = await fetch(`${base}/v1/wiring?packId=${encodeURIComponent(packId)}`);
        const json = await res.json();
        if (!res.ok || !json.ok || !json.wiring?.nodes) continue;
        const byId = Object.fromEntries(json.wiring.nodes.map((n) => [n.id, n]));
        for (const n of state.nodes) {
          const w = byId[n.id];
          if (!w) continue;
          n.category = w.category ?? n.category;
          n.option = w.option ?? n.option;
          n.label = w.label ?? n.label;
          if (typeof w.x === 'number') n.x = w.x;
          if (typeof w.y === 'number') n.y = w.y;
          if (w.group) n.group = w.group;
        }
        if (Array.isArray(json.wiring.edges) && json.wiring.edges.length) {
          state.edges = json.wiring.edges.map((e) => ({ ...e }));
        }
        if (json.wiring.notes) state.notes = json.wiring.notes;
        saveDraft();
        return;
      } catch {
        /* bridge offline — borrador local */
      }
    }
  })();
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

/** @type {object|null} */
let labAgent = null;

function applyLabWatermark(agent = labAgent) {
  const wrap = document.getElementById('lab-watermark');
  const img = document.getElementById('lab-watermark-img');
  const schematicWrap = document.querySelector('.lab-schematic-wrap');
  if (!wrap || !img) return;

  schematicWrap?.style.setProperty('--lab-watermark-opacity', String(getWatermarkOpacity()));

  if (!getWatermarkEnabled() || !agent) {
    wrap.classList.add('lab-watermark-hidden');
    return;
  }

  const src = resolveImageSrc(agent.image) ?? imageFallbackSrc(agent.image, agent.imageFallback);
  if (!src) {
    wrap.classList.add('lab-watermark-hidden');
    return;
  }

  img.src = src;
  img.alt = agent.visual?.name ?? agent.name ?? 'URUIRU';
  wrap.classList.remove('lab-watermark-hidden');
}

function renderLabIdentity(agent) {
  labAgent = agent ?? null;
  const root = document.getElementById('lab-identity');
  const nameEl = document.getElementById('lab-identity-name');
  const metaEl = document.getElementById('lab-identity-meta');
  if (!root || !nameEl || !metaEl) return;

  if (!agent) {
    nameEl.textContent = 'ageNFT';
    metaEl.textContent = 'Lab Studio — borrador local';
    document.title = 'Lab Studio — ageNFT';
    applyLabWatermark(null);
    return;
  }

  applyAvatar(agent, { imgId: 'lab-avatar', fallbackId: 'lab-avatar-fallback' });

  const character = agent.visual?.name?.trim();
  const pack = agent.name?.trim() || 'Agente';
  const tokenId = String(agent.tokenId ?? agent.nft?.tokenId ?? '?');
  const chainLabel = agent.chain?.name ?? 'Base';

  nameEl.textContent = character ? character : pack;
  const metaParts = [];
  if (character && character !== pack) metaParts.push(pack);
  metaParts.push(`#${tokenId}`, chainLabel);
  metaEl.textContent = metaParts.join(' · ');

  root.href = assetUrl(`index.html${tokenId !== '?' ? `?id=${tokenId}` : ''}`);
  root.setAttribute(
    'aria-label',
    `Editando ${character || pack}, ageNFT #${tokenId} en ${chainLabel}`
  );
  document.title = `Lab — ${character || pack} #${tokenId}`;
  requestAnimationFrame(syncLabHeaderOffset);
  applyLabWatermark(agent);
}

function syncLabHeaderOffset() {
  const header = document.querySelector('.lab-float-top');
  const wrap = document.querySelector('.lab-schematic-wrap');
  if (!header || !wrap) return;
  const gap = 10;
  const h = Math.ceil(header.getBoundingClientRect().height) + gap;
  wrap.style.setProperty('--lab-header-offset', `${h}px`);
}

function getLabHeaderOffsetPx() {
  const wrap = document.querySelector('.lab-schematic-wrap');
  if (!wrap) return 72;
  const raw = getComputedStyle(wrap).getPropertyValue('--lab-header-offset').trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 72;
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

function portPoint(node, side) {
  const sz = getNodeSize();
  const cx = node.x + sz.w / 2;
  const cy = node.y + sz.h / 2;
  switch (side) {
    case 'top':
      return { x: cx, y: node.y, side };
    case 'bottom':
      return { x: cx, y: node.y + sz.h, side };
    case 'left':
      return { x: node.x, y: cy, side };
    default:
      return { x: node.x + sz.w, y: cy, side: 'right' };
  }
}

/** Puertos preferidos por zona corporal — in ≠ out (no cualquier dirección). */
function nodePortPrefs(node) {
  const sz = getNodeSize();
  const g = node.group ?? 'torso';
  const cx = node.x + sz.w / 2;
  const isLeftLimb = g === 'limb' && cx < 480;
  const isRightLimb = g === 'limb' && cx >= 480;

  if (g === 'head') {
    return { in: ['bottom', 'left', 'right'], out: ['left', 'right', 'bottom'] };
  }
  if (g === 'torso') {
    return { in: ['top', 'left', 'right'], out: ['top', 'bottom', 'left', 'right'] };
  }
  if (isLeftLimb) {
    return { in: ['right', 'top'], out: ['left', 'bottom'] };
  }
  if (isRightLimb) {
    return { in: ['left', 'top'], out: ['right', 'bottom'] };
  }
  return {
    in: ['top', 'left', 'right', 'bottom'],
    out: ['top', 'bottom', 'left', 'right'],
  };
}

const PORT_NORMAL = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function pickPort(node, role, other) {
  const sz = getNodeSize();
  const sides = ['top', 'bottom', 'left', 'right'];
  const prefs = nodePortPrefs(node);
  const allowed = role === 'out' ? prefs.out : prefs.in;
  const ox = other.x + sz.w / 2;
  const oy = other.y + sz.h / 2;
  const cx = node.x + sz.w / 2;
  const cy = node.y + sz.h / 2;
  const toOther = Math.atan2(oy - cy, ox - cx);

  let best = null;
  let bestScore = -Infinity;
  for (const side of sides) {
    if (!allowed.includes(side)) continue;
    const p = portPoint(node, side);
    const [nx, ny] = PORT_NORMAL[side];
    const portAngle = Math.atan2(ny, nx);
    let score = Math.cos(toOther - portAngle);
    if (role === 'out') score += 0.15;
    score += (allowed.length - allowed.indexOf(side)) * 0.08;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best ?? portPoint(node, role === 'out' ? 'bottom' : 'top');
}

function controlFromPort(port, len, invert = false) {
  const [dx, dy] = PORT_NORMAL[port.side];
  const m = invert ? -1 : 1;
  return { x: port.x + dx * len * m, y: port.y + dy * len * m };
}

function findReverseEdge(edge, edges) {
  return edges.find((e) => e.id !== edge.id && e.from === edge.to && e.to === edge.from);
}

/** Offset perpendicular si existe ida y vuelta — dos cables visibles. */
function bidirectionalOffset(edge, edges) {
  const rev = findReverseEdge(edge, edges);
  if (!rev) return 0;
  return edge.id < rev.id ? -WIRE_BIDIR_OFFSET : WIRE_BIDIR_OFFSET;
}

function wireCurvePath(fromNode, toNode, offset = 0) {
  const start = pickPort(fromNode, 'out', toNode);
  const end = pickPort(toNode, 'in', fromNode);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;
  const bulge = Math.min(96, Math.max(28, dist * 0.38));
  const nx = -dy / dist;
  const ny = dx / dist;
  const ox = nx * offset;
  const oy = ny * offset;

  const c1 = controlFromPort(start, bulge);
  const c2 = controlFromPort(end, bulge, true);
  const sx = start.x + ox;
  const sy = start.y + oy;
  const ex = end.x + ox;
  const ey = end.y + oy;

  return {
    d: `M ${sx} ${sy} C ${c1.x + ox} ${c1.y + oy}, ${c2.x + ox} ${c2.y + oy}, ${ex} ${ey}`,
    start,
    end,
    bidirectional: offset !== 0,
  };
}

function renderPortHints(node, portR = 3.5) {
  if (state.selectedId !== node.id) return '';
  const prefs = nodePortPrefs(node);
  const sides = ['top', 'bottom', 'left', 'right'];
  return sides
    .map((side) => {
      const p = portPoint(node, side);
      const isOut = prefs.out.includes(side);
      const isIn = prefs.in.includes(side);
      if (!isOut && !isIn) return '';
      const cls = isOut && isIn ? 'lab-port-both' : isOut ? 'lab-port-out' : 'lab-port-in';
      const hint =
        isOut && isIn ? 'entrada y salida' : isOut ? 'salida (out)' : 'entrada (in)';
      return `<circle class="lab-port ${cls}" cx="${p.x}" cy="${p.y}" r="${portR}"
        data-side="${side}"><title>${side} · ${hint}</title></circle>`;
    })
    .join('');
}

function renderSchematic() {
  const svg = document.getElementById('lab-schematic');
  if (!svg) return;

  const sz = getNodeSize();
  const fonts = getNodeFonts();
  svg.setAttribute('viewBox', computeSchematicViewBox(state.nodes, sz));

  const nodeById = Object.fromEntries(state.nodes.map((n) => [n.id, n]));
  const edges = getEffectiveEdges();

  const wires = edges
    .map((e) => {
      const a = nodeById[e.from];
      const b = nodeById[e.to];
      if (!a || !b) return '';
      const cat = CATEGORIES[e.category] ?? CATEGORIES.planned;
      const offset = bidirectionalOffset(e, edges);
      const { d, bidirectional } = wireCurvePath(a, b, offset);
      const isLive = Boolean(e.live);
      const stroke = isLive ? '#22c55e' : cat.color;
      const dash = isLive
        ? 'none'
        : cat.wire === 'dashed'
          ? '6 4'
          : cat.wire === 'dotted'
            ? '2 4'
            : 'none';
      const rev = findReverseEdge(e, edges);
      const title = isLive
        ? `${e.from} → ${e.to} · EN LÍNEA (servicio activo en VPS)`
        : rev
          ? `${e.from} → ${e.to} (par bidireccional con ${e.to} → ${e.from})`
          : `${e.from} → ${e.to}`;
      return `<path class="lab-wire${bidirectional ? ' lab-wire-paired' : ''}${isLive ? ' lab-wire-live' : ''}" d="${d}"
        stroke="${stroke}" stroke-width="${isLive ? 3 : 2}" fill="none" stroke-dasharray="${dash}"
        marker-end="url(#${isLive ? 'lab-arrow-live' : 'lab-arrow'})" data-edge-id="${e.id}" data-from="${e.from}" data-to="${e.to}">
        <title>${escapeAttr(title)}</title></path>`;
    })
    .join('');

  const boxes = state.nodes
    .map((n) => {
      const cat = CATEGORIES[n.category] ?? CATEGORIES.planned;
      const selected = state.selectedId === n.id ? ' lab-node-selected' : '';
      const ty = nodeTextYs(n.y, sz.h);
      const portR = Math.max(2.5, 3.5 * getOrganScale());
      const liveRec = getOrganLiveRecord(n.id, n.option);
      const sessionActive = Boolean(liveRec?.live?.sessionActive);
      const strokeColor = sessionActive ? '#22c55e' : cat.color;
      const strokeW = sessionActive ? 2.5 : 2;
      return `
      <g class="lab-node${selected}${sessionActive ? ' lab-node-live' : ''}" data-node-id="${n.id}" tabindex="0" role="button"
         aria-label="${escapeAttr(n.label)}${sessionActive ? ' — en línea' : ''}">
        <rect x="${n.x}" y="${n.y}" width="${sz.w}" height="${sz.h}" rx="10"
          fill="var(--surface-2)" stroke="${strokeColor}" stroke-width="${strokeW}"
          stroke-dasharray="${cat.wire === 'dashed' ? '6 4' : cat.wire === 'dotted' ? '2 4' : 'none'}" />
        <text x="${n.x + sz.w / 2}" y="${ty.title}" text-anchor="middle"
          class="lab-node-title" font-size="${fonts.title}">${escapeHtml(n.label)}</text>
        <text x="${n.x + sz.w / 2}" y="${ty.opt}" text-anchor="middle"
          class="lab-node-opt" font-size="${fonts.opt}">${escapeHtml(optionLabel(n.option))}</text>
        <text x="${n.x + sz.w / 2}" y="${ty.tags}" text-anchor="middle"
          class="lab-node-tags" font-size="${fonts.tags}">${tagEmojis(n.option)}</text>
        ${
          sessionActive
            ? `<text x="${n.x + sz.w / 2}" y="${n.y + sz.h - 6}" text-anchor="middle"
          class="lab-node-live-label" font-size="${Math.max(8, fonts.opt)}">● En línea</text>`
            : ''
        }
        ${renderPortHints(n, portR)}
      </g>`;
    })
    .join('');

  const defs = `<defs>
    <marker id="lab-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,4 L0,8 Z" class="lab-arrow-head" />
    </marker>
    <marker id="lab-arrow-live" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,4 L0,8 Z" fill="#22c55e" />
    </marker>
  </defs>`;

  svg.innerHTML = `${defs}${wires}${boxes}`;

  svg.querySelectorAll('.lab-node').forEach((g) => {
    g.addEventListener('click', (ev) => {
      ev.stopPropagation();
      selectNode(g.dataset.nodeId);
    });
    g.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        selectNode(g.dataset.nodeId);
      }
    });
  });

  renderFeasibilityAlerts(state.selectedId);
}

function selectNode(id) {
  const pop = document.getElementById('lab-node-editor');
  if (pop) {
    delete pop.dataset.manualPos;
    delete pop.dataset.dragLeft;
    delete pop.dataset.dragTop;
  }
  state.selectedId = id;
  saveDraft();
  renderSchematic();
  renderNodeEditor();
  renderAssistant();
  renderIntentPreview();
  renderFeasibilityAlerts(state.selectedId);
}

function closeOrganPopover() {
  state.selectedId = null;
  saveDraft();
  renderSchematic();
  renderNodeEditor();
  renderAssistant();
  renderFeasibilityAlerts();
}

const LAB_PANEL_POS_KEY = 'agenft-lab-panel-pos-v1';

function loadPanelPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(LAB_PANEL_POS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function savePanelPosition(panel) {
  if (!panel?.id || !panel.style.left) return;
  const positions = loadPanelPositions();
  positions[panel.id] = {
    left: parseFloat(panel.style.left),
    top: parseFloat(panel.style.top),
  };
  sessionStorage.setItem(LAB_PANEL_POS_KEY, JSON.stringify(positions));
}

function applySavedPanelPosition(panel) {
  if (!panel) return;
  const pos = loadPanelPositions()[panel.id];
  if (!pos) return;
  panel.style.left = `${pos.left}px`;
  panel.style.top = `${pos.top}px`;
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
  panel.style.transform = 'none';
  panel.dataset.manualPos = '1';
}

function ensurePanelPixelPosition(panel, wrap) {
  if (panel.dataset.manualPos === '1' && panel.style.left) return;
  const wrapRect = wrap.getBoundingClientRect();
  const rect = panel.getBoundingClientRect();
  panel.style.left = `${rect.left - wrapRect.left}px`;
  panel.style.top = `${rect.top - wrapRect.top}px`;
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
  panel.style.transform = 'none';
}

/** @type {{ panel: HTMLElement, handle: HTMLElement, pointerId: number, startX: number, startY: number, origLeft: number, origTop: number, wrapW: number, wrapH: number } | null} */
let labPanelDrag = null;

function bindPanelChrome() {
  const wrap = document.querySelector('.lab-schematic-wrap');
  if (!wrap || bindPanelChrome._bound) return;
  bindPanelChrome._bound = true;

  const handleClose = (ev) => {
    if (ev.target.closest('.lab-popover-close')) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (state.selectedId) closeOrganPopover();
      return;
    }
    if (ev.target.closest('[data-close-panel]')) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      const panel = ev.target.closest('.lab-panel');
      if (panel) closeLabPanel(panel.id.replace('lab-panel-', ''));
    }
  };
  document.addEventListener('click', handleClose, true);

  const popover = document.getElementById('lab-node-editor');
  popover?.addEventListener('click', (ev) => {
    if (ev.target.closest('.lab-popover-close')) return;
    ev.stopPropagation();
  });

  wrap.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    if (
      ev.target.closest(
        'button, select, input, textarea, a, summary, label, .lab-field, .lab-popover-close, [data-close-panel], details, .lab-organ-steps'
      )
    ) {
      return;
    }

    const handle = ev.target.closest('[data-drag-handle]');
    if (!handle) return;

    const panel = handle.closest('.lab-panel, .lab-node-popover');
    if (
      !panel ||
      panel.classList.contains('lab-panel-hidden') ||
      panel.classList.contains('lab-node-popover-hidden')
    ) {
      return;
    }

    ensurePanelPixelPosition(panel, wrap);
    labPanelDrag = {
      panel,
      handle,
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      origLeft: parseFloat(panel.style.left) || 0,
      origTop: parseFloat(panel.style.top) || 0,
      wrapW: wrap.clientWidth,
      wrapH: wrap.clientHeight,
    };
    panel.classList.add('lab-panel-dragging');
    handle.setPointerCapture?.(ev.pointerId);
    ev.preventDefault();
  });

  const finishDrag = (ev) => {
    if (!labPanelDrag || ev.pointerId !== labPanelDrag.pointerId) return;
    const { panel, handle } = labPanelDrag;
    panel.classList.remove('lab-panel-dragging');
    try {
      handle.releasePointerCapture?.(ev.pointerId);
    } catch {
      /* ignore */
    }
    if (panel.classList.contains('lab-panel')) savePanelPosition(panel);
    labPanelDrag = null;
  };

  wrap.addEventListener('pointermove', (ev) => {
    if (!labPanelDrag || ev.pointerId !== labPanelDrag.pointerId) return;
    const { panel, startX, startY, origLeft, origTop, wrapW, wrapH } = labPanelDrag;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const topBar = getLabHeaderOffsetPx();
    let left = origLeft + dx;
    let top = origTop + dy;
    left = Math.max(8, Math.min(left, wrapW - pw - 8));
    top = Math.max(topBar + 8, Math.min(top, wrapH - ph - 8));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.dataset.manualPos = '1';
    if (panel.id === 'lab-node-editor') {
      panel.dataset.dragLeft = String(left);
      panel.dataset.dragTop = String(top);
    }
  });

  wrap.addEventListener('pointerup', finishDrag);
  wrap.addEventListener('pointercancel', finishDrag);
}

function renderNodeEditor() {
  const root = document.getElementById('lab-node-editor');
  if (!root) return;

  const node = state.nodes.find((n) => n.id === state.selectedId);
  if (!node) {
    root.innerHTML = '';
    root.classList.add('lab-node-popover-hidden');
    root.setAttribute('aria-hidden', 'true');
    renderFeasibilityAlerts();
    return;
  }

  root.classList.remove('lab-node-popover-hidden');
  root.setAttribute('aria-hidden', 'false');

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

  const linkFromRuntime =
    node.id !== 'runtime'
      ? state.edges.find((e) => e.from === 'runtime' && e.to === node.id)
      : null;
  const hasReturn =
    node.id !== 'runtime'
      ? state.edges.some((e) => e.from === node.id && e.to === 'runtime')
      : false;
  const edgeLock = node.id !== 'runtime' ? getLiveEdgeLock('runtime', node.id) : null;
  const liveRec = getOrganLiveRecord(node.id, node.option);
  const sessionActive = Boolean(liveRec?.live?.sessionActive);

  const moreOpen = root.querySelector('.lab-popover-more')?.open ?? false;
  const advOpen = root.querySelector('.lab-popover-advanced')?.open ?? false;

  root.innerHTML = `
    <div class="lab-popover-head" data-drag-handle title="Arrastrar para mover">
      <h3 class="lab-panel-title">${escapeHtml(node.label)}</h3>
      <button type="button" class="lab-popover-close" aria-label="Cerrar editor">×</button>
    </div>
    <div class="lab-popover-notices">
    ${
      sessionActive
        ? '<p class="lab-live-banner" role="status"><span class="lab-live-dot" aria-hidden="true"></span> Conectado y en línea en el VPS</p>'
        : edgeLock
          ? '<p class="lab-live-banner lab-live-banner-partial" role="status"><span class="lab-live-dot" aria-hidden="true"></span> Servicio activo — cable fijado</p>'
          : ''
    }
    <div id="lab-popover-alerts" class="lab-popover-alerts" aria-live="polite"></div>
    </div>
    <div class="lab-popover-body">
    <label class="lab-field lab-field-compact">
      <span>Categoría (color)</span>
      <select id="lab-cat-select">${catOpts}</select>
    </label>
    <label class="lab-field lab-field-compact">
      <span>Opción cableada</span>
      <select id="lab-opt-select">${optHtml}</select>
    </label>
    <p class="lab-popover-hint">${escapeHtml(nodeBlurb(node.id))}</p>
    <div id="lab-organ-status" class="lab-organ-status" aria-live="polite"></div>
    <details class="lab-popover-more">
      <summary>Detalle de la opción</summary>
      <div class="lab-popover-more-inner">
        <div class="lab-option-intro">
          <span class="lab-blurb-label">Esta opción</span>
          <p class="lab-option-blurb" id="lab-option-blurb"></p>
        </div>
        <div id="lab-option-tags" class="lab-option-tags" aria-label="Etiquetas de la opción"></div>
      </div>
    </details>
    <details class="lab-popover-advanced">
      <summary>Añadir opción custom</summary>
      <div class="lab-popover-advanced-inner">
        <label class="lab-field lab-field-compact">
          <span>Id de la opción</span>
          <div class="lab-inline">
            <input type="text" id="lab-new-opt" placeholder="ej. discord" />
            <button type="button" class="btn btn-secondary btn-compact" id="lab-add-opt">+</button>
          </div>
        </label>
      </div>
    </details>
    </div>
    <div class="lab-popover-foot">
    <div class="lab-actions">
      <button type="button" class="btn btn-secondary btn-compact${edgeLock ? ' btn-live-locked' : ''}" id="lab-toggle-edge"${
        edgeLock ? ' disabled title="Para el servicio en el VPS antes de quitar el cable"' : ''
      }>${edgeLock ? '● Cable fijado (en línea)' : 'Alternar cable al motor'}</button>
      ${
        linkFromRuntime || edgeLock
          ? `<button type="button" class="btn btn-secondary btn-compact" id="lab-toggle-return">${
              hasReturn ? 'Quitar cable de vuelta' : 'Cable de vuelta'
            }</button>`
          : ''
      }
    </div>
    <p class="sub lab-port-hint">Puertos: <span class="lab-port-out-inline">●</span> salida · <span class="lab-port-in-inline">●</span> entrada</p>
    </div>
  `;

  renderOptionTags(node.option);
  renderOptionBlurb(node.option, node.id);
  renderFeasibilityAlerts(node.id);
  renderOrganStatusPanel(node);
  if (moreOpen) root.querySelector('.lab-popover-more')?.setAttribute('open', '');
  if (advOpen) root.querySelector('.lab-popover-advanced')?.setAttribute('open', '');
  if (organStatusUi.bridgeOnline) fetchOrganStatus(node.id);

  root.querySelector('#lab-cat-select')?.addEventListener('change', (ev) => {
    node.category = ev.target.value;
    syncEdgesForNode(node);
    saveDraft();
    renderSchematic();
    renderAssistant();
    renderIntentPreview();
    positionNodePopover(node);
    renderFeasibilityAlerts(node.id);
  });

  root.querySelector('#lab-opt-select')?.addEventListener('change', (ev) => {
    node.option = ev.target.value;
    renderOptionTags(node.option);
    renderOptionBlurb(node.option, node.id);
    saveDraft();
    renderSchematic();
    renderAssistant();
    renderIntentPreview();
    positionNodePopover(node);
    renderFeasibilityAlerts(node.id);
    flashFeasibilityForOption(node);
    renderOrganStatusPanel(node);
    if (organStatusUi.bridgeOnline) fetchOrganStatus(node.id);
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
    renderFeasibilityAlerts(node.id);
    flashFeasibilityForOption(node);
  });

  root.querySelector('#lab-toggle-edge')?.addEventListener('click', () => {
    toggleEdgeToRuntime(node.id);
    positionNodePopover(node);
  });

  root.querySelector('#lab-toggle-return')?.addEventListener('click', () => {
    toggleReturnEdge(node.id);
    positionNodePopover(node);
  });

  requestAnimationFrame(() => positionNodePopover(node));
}

function positionNodePopover(node) {
  const wrap = document.querySelector('.lab-schematic-wrap');
  const popover = document.getElementById('lab-node-editor');
  if (!wrap || !popover || !node || popover.classList.contains('lab-node-popover-hidden')) {
    return;
  }

  if (popover.dataset.manualPos === '1' && popover.dataset.dragLeft) {
    popover.style.display = 'block';
    popover.style.visibility = 'visible';
    popover.style.left = `${popover.dataset.dragLeft}px`;
    popover.style.top = `${popover.dataset.dragTop}px`;
    return;
  }

  const svg = document.getElementById('lab-schematic');
  const vb = svg?.viewBox.baseVal;
  const vbW = vb?.width || 960;
  const vbH = vb?.height || 480;
  const svgRect = svg?.getBoundingClientRect() ?? { width: wrap.clientWidth, height: wrap.clientHeight };
  const scaleX = svgRect.width / vbW;
  const scaleY = svgRect.height / vbH;

  const sz = getNodeSize();
  const nodeCx = (node.x + sz.w / 2) * scaleX;
  const nodeTop = node.y * scaleY;
  const nodeBottom = (node.y + sz.h) * scaleY;

  popover.style.visibility = 'hidden';
  popover.style.display = 'block';

  const pw = popover.offsetWidth;
  const ph = popover.offsetHeight;
  let left = nodeCx - pw / 2;
  let top = nodeBottom + 12;
  if (top + ph > wrap.clientHeight - 8) {
    top = nodeTop - ph - 12;
  }
  left = Math.max(8, Math.min(left, wrap.clientWidth - pw - 8));
  const topBar = getLabHeaderOffsetPx();
  top = Math.max(topBar + 8, Math.min(top, wrap.clientHeight - ph - 8));

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.style.visibility = 'visible';
}

function bindSchematicDismiss() {
  document.addEventListener('click', (ev) => {
    if (!state.selectedId) return;
    const pop = document.getElementById('lab-node-editor');
    const wrap = document.querySelector('.lab-schematic-wrap');
    if (!pop || !wrap || pop.contains(ev.target)) return;
    if (
      ev.target.closest('.lab-float-top') ||
      ev.target.closest('.lab-dock') ||
      ev.target.closest('.lab-panel') ||
      ev.target.closest('.lab-float-legend') ||
      ev.target.closest('.lab-float-help')
    ) {
      return;
    }
    if (wrap.contains(ev.target)) {
      if (ev.target.closest('.lab-node')) return;
      state.selectedId = null;
      saveDraft();
      renderSchematic();
      renderNodeEditor();
      renderAssistant();
      renderFeasibilityAlerts();
    }
  });
}

function bindLabPanels() {
  document.querySelectorAll('[data-lab-panel]').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleLabPanel(btn.dataset.labPanel);
    });
  });
}

function openLabPanel(id) {
  const panel = document.getElementById(`lab-panel-${id}`);
  const btn = document.querySelector(`[data-lab-panel="${id}"]`);
  panel?.classList.remove('lab-panel-hidden');
  applySavedPanelPosition(panel);
  btn?.classList.add('active');
}

function toggleLabPanel(id) {
  const panel = document.getElementById(`lab-panel-${id}`);
  const btn = document.querySelector(`[data-lab-panel="${id}"]`);
  if (!panel) return;
  const willOpen = panel.classList.contains('lab-panel-hidden');
  document.querySelectorAll('.lab-panel').forEach((p) => p.classList.add('lab-panel-hidden'));
  document.querySelectorAll('[data-lab-panel]').forEach((b) => b.classList.remove('active'));
  if (willOpen) {
    panel.classList.remove('lab-panel-hidden');
    applySavedPanelPosition(panel);
    btn?.classList.add('active');
  }
}

function closeLabPanel(id) {
  document.getElementById(`lab-panel-${id}`)?.classList.add('lab-panel-hidden');
  document.querySelector(`[data-lab-panel="${id}"]`)?.classList.remove('active');
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
  const lock = getLiveEdgeLock('runtime', nodeId);
  if (existing && lock) {
    flashStatus(lock.hint, 'warn', 12000);
    refreshLiveOrganUi();
    return;
  }
  if (existing) {
    state.edges = state.edges.filter(
      (e) => e.id !== existing.id && !(e.from === nodeId && e.to === 'runtime')
    );
    flashStatus(`Cable desconectado: Motor → ${node?.label ?? nodeId}`, 'info', 3500);
  } else if (node) {
    state.edges.push({
      id: `e-${Date.now()}`,
      from: 'runtime',
      to: nodeId,
      category: node.category,
    });
    flashStatus(`Cable conectado: Motor → ${node.label}`, 'ok', 3500);
  }
  saveDraft();
  renderSchematic();
  renderNodeEditor();
  renderIntentPreview();
  renderFeasibilityAlerts(nodeId);
}

function toggleReturnEdge(nodeId) {
  if (nodeId === 'runtime') return;
  const forward = state.edges.find((e) => e.from === 'runtime' && e.to === nodeId);
  const reverse = state.edges.find((e) => e.from === nodeId && e.to === 'runtime');
  const node = state.nodes.find((n) => n.id === nodeId);
  if (reverse) {
    state.edges = state.edges.filter((e) => e.id !== reverse.id);
    flashStatus(`Cable de vuelta quitado: ${node?.label ?? nodeId} → Motor`, 'info', 3500);
  } else if (forward) {
    state.edges.push({
      id: `e-ret-${Date.now()}`,
      from: nodeId,
      to: 'runtime',
      category: forward.category,
    });
    flashStatus(
      `Cable de vuelta añadido (${node?.label ?? nodeId} → Motor). Solo visual — el runtime no lo interpreta aún.`,
      'warn',
      8000
    );
  }
  saveDraft();
  renderSchematic();
  renderNodeEditor();
  renderIntentPreview();
  renderFeasibilityAlerts(nodeId);
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
    '<em>Cables:</em> flecha = salida → entrada. <strong>Cable de vuelta</strong> = segundo trazo al revés (ida y vuelta).',
  ];

  if (node) {
    const cat = CATEGORIES[node.category];
    tips.push(
      `<hr class="lab-hr" />`,
      `<strong>Módulo:</strong> ${escapeHtml(node.label)}`,
      `<strong>Qué es:</strong> ${escapeHtml(nodeBlurb(node.id))}`,
      `<strong>Esta opción (${escapeHtml(optionLabel(node.option))}):</strong> ${escapeHtml(optionBlurb(node.option, node.id))}`,
      `<strong>Categoría:</strong> ${escapeHtml(cat.label)} — ${escapeHtml(cat.hint)}`,
      `<em>Estado técnico y pasos → panel del módulo (clic en el órgano).</em>`,
      contextualTip(node)
    );
  } else {
    tips.push('<hr class="lab-hr" />', 'Selecciona un módulo para ver consejos específicos.');
  }

  const warnCount = visibleFeasibilityAlerts().filter((a) => a.level === 'warn').length;
  if (warnCount) {
    tips.push(
      '<hr class="lab-hr" />',
      `<strong class="status-warn">⚠ ${warnCount} advertencia(s)</strong> — revisa la barra amarilla bajo el header antes de enviar o aplicar.`
    );
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

async function resolvePackIdForWiring() {
  try {
    const tokenId = await tokenFromPath();
    if (tokenId === '1') return 'unit-mainnet';
    if (tokenId === '115') return 'unit-1';
    return `unit-${tokenId}`;
  } catch {
    return 'unit-mainnet';
  }
}

function buildWiringExport(packId = 'unit-mainnet') {
  return {
    type: 'agenft-wiring/v1',
    packId,
    layoutVersion: LAYOUT_VERSION,
    updatedAt: new Date().toISOString(),
    notes: state.notes.trim() || undefined,
    nodes: state.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      group: n.group,
      category: n.category,
      option: n.option,
      x: n.x,
      y: n.y,
    })),
    edges: state.edges.map((e) => ({
      id: e.id,
      from: e.from,
      to: e.to,
      category: e.category,
    })),
  };
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

  lines.push('', '### Cables (dirección)');
  if (state.edges.length) {
    for (const e of state.edges) {
      const rev = findReverseEdge(e, state.edges);
      const pair = rev ? ' _(ida y vuelta — 2 cables)_' : '';
      lines.push(`- ${e.from} → ${e.to}${pair}`);
    }
  } else {
    lines.push('_ninguno_');
  }

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
      : '¿Qué cableado priorizamos según este borrador?',
    '',
    '### Runtime',
    'Aplicar desde Lab: botón **Aplicar al runtime** (lab:bridge en :8799).'
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
  const packId = await resolvePackIdForWiring();
  const wiring = buildWiringExport(packId);
  const body = JSON.stringify({ markdown: buildChatMarkdown(), message: userMsg, wiring });
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

async function applyWiringToRuntime() {
  const packId = await resolvePackIdForWiring();
  const wiring = buildWiringExport(packId);
  const body = JSON.stringify({ wiring, packId, apply: true });
  let lastErr;
  for (const base of bridgeUrls()) {
    try {
      const res = await fetch(`${base}/v1/wiring`, {
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
  throw lastErr ?? new Error('Lab bridge no disponible — ejecuta: cd runtime && npm run lab:bridge');
}

async function probeBridgeStatus() {
  for (const base of bridgeUrls()) {
    try {
      const res = await fetch(`${base}/v1/health`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (!res.ok || !json.ok) continue;
      let stale = false;
      const hasOrgansFeature = Array.isArray(json.features) && json.features.includes('organs/status');
      if (!hasOrgansFeature) {
        try {
          const probe = await fetch(`${base}/v1/organs/status?nodeId=gateway`, {
            signal: AbortSignal.timeout(2500),
          });
          stale = !probe.ok;
        } catch {
          stale = true;
        }
      }
      return { online: true, base, stale };
    } catch {
      /* try next */
    }
  }
  return { online: false, base: null, stale: false };
}

function setBridgeStatus({ online, base, stale = false }) {
  organStatusUi.bridgeOnline = online && !stale;
  organStatusUi.bridgeStale = stale;
  const el = document.getElementById('lab-bridge-status');
  if (!el) return;
  if (stale) {
    el.className = 'sub lab-bridge-status warn';
    el.textContent = `Bridge antiguo (${base}) — reinicia: cd runtime && npm run lab:bridge`;
  } else if (online) {
    el.className = 'sub lab-bridge-status ok';
    el.textContent = `Bridge OK (${base}) — wiring + cables verdes en vivo`;
  } else {
    el.className = 'sub lab-bridge-status off';
    el.textContent = 'Bridge offline — sin cables verdes · cd runtime && npm run lab:bridge';
  }
  renderBridgeHelp(online && !stale);
  if (online && !stale) fetchOrganStatus();
  else {
    organStatusUi.organStatusReport = null;
    renderOrganStatusPanel(state.nodes.find((n) => n.id === state.selectedId));
    refreshLiveOrganUi();
  }
  requestAnimationFrame(syncLabHeaderOffset);
}

async function refreshBridgeStatus() {
  const status = await probeBridgeStatus();
  setBridgeStatus(status);
  return status;
}

function renderBridgeHelp(bridgeOnline = false) {
  const root = document.getElementById('lab-bridge-help');
  if (!root) return;
  const applyLine = bridgeOnline
    ? '<strong>Aplicar al runtime</strong> — ✅ bridge detectado. Pulsa el botón verde; el wiring se escribe en el VPS.'
    : '<strong>Aplicar al runtime</strong> — ⚠️ bridge offline desde este navegador. En el VPS: <code>cd ageNFT/runtime && npm run lab:bridge</code>. O usa Inbox + Cursor.';

  root.innerHTML = [
    '<p><strong>¿Puedo cablear desde aquí?</strong> Sí, en borrador. Lo que guardas son los cables del esquema.</p>',
    `<p>${applyLine}</p>`,
    '<p><strong>Enviar a Cursor</strong> — ✅ exporta markdown + <code>wiring-draft.json</code> (modo Inbox). Pega o @ en Cursor; allí o en el VPS: <code>npm run wiring:apply</code>.</p>',
    '<p><strong>¿El agente obedece al instante?</strong> Tras aplicar, el runtime lee <code>runtime/wiring/*.json</code>. Algunos servicios hay que reiniciarlos.</p>',
    '<p><strong>Cable de vuelta</strong> — por ahora es visual (ida y vuelta en el dibujo); el motor no lo interpreta aparte aún.</p>',
    '<p><strong>Advertencias</strong> — barra bajo el header: scroll si hay muchas; <strong>×</strong> en cada una o <em>Cerrar todas</em>. Vuelven al recargar la página.</p>',
    '<p><strong>Estado del órgano</strong> — al seleccionar un módulo: configurado / parcial / qué falta / pasos. Requiere <code>lab:bridge</code> en el VPS para probes en vivo.</p>',
    '<p><strong>Cable verde</strong> — servicio real en marcha (ej. bot Telegram). No se puede quitar en Lab hasta parar el proceso en el VPS.</p>',
    '<p><strong>Desde el portátil</strong> — Lab en duckdns no ve el bridge del VPS (es <code>127.0.0.1</code>). Usa Inbox/Cursor o abre Lab en el mismo VPS.</p>',
    '<p class="lab-guided-cta"><button type="button" class="btn btn-secondary btn-compact" id="lab-guided-test">▶ Prueba guiada #1</button> — desconectar Matrix y enviar a Cursor</p>',
  ].join('');
}

const GUIDED_TEST_MARKDOWN = [
  '<strong>Prueba guiada #1 — Bridge + Cursor</strong>',
  'Objetivo: comprobar que lo que cableas en Lab llega al runtime.',
  '',
  '<strong>1.</strong> Clic en módulo <em>Matrix</em> → <em>Alternar cable al motor</em> (desconectar).',
  '<strong>2.</strong> Dock 📤 → destino <em>Inbox proyecto</em> → mensaje: «Prueba bridge Matrix off» → <em>Enviar</em>.',
  '<strong>3.</strong> En Cursor (este chat): <code>@.cursor/lab-inbox/latest.md</code> y pide aplicar wiring.',
  '<strong>4.</strong> Verifica: <code>cd ageNFT/runtime && npm run wiring:show</code> — no debe haber cable runtime→matrix.',
  '<strong>5.</strong> (Opcional) Si bridge online aquí: <em>Aplicar al runtime</em> en lugar del paso 3.',
  '',
  '<em>Tip:</em> el cable de vuelta es solo visual; esta prueba usa el cable principal Motor→Matrix.',
].join('<br />');

function openGuidedTest() {
  const help = document.querySelector('.lab-float-help');
  if (help) help.open = true;
  openLabPanel('assistant');
  openLabPanel('cursor');
  const root = document.getElementById('lab-assistant');
  if (root) {
    root.innerHTML = GUIDED_TEST_MARKDOWN;
  }
  const msg = document.getElementById('lab-user-message');
  if (msg) msg.value = 'Prueba bridge: desconectar Matrix del runtime';
  const target = document.getElementById('lab-send-target');
  if (target) {
    target.value = 'inbox';
    saveSendTarget('inbox');
  }
  flashStatus('Prueba guiada abierta — sigue los pasos en 💬 y 📤', 'info', 8000);
  selectNode('matrix');
}

function bindGuidedTest() {
  document.querySelector('.lab-float-help')?.addEventListener('click', (ev) => {
    if (ev.target?.id === 'lab-guided-test') {
      ev.preventDefault();
      openGuidedTest();
    }
  });
}

async function handleApplyWiring() {
  if (!confirmIfFeasibilityWarnings('Aplicar al runtime')) return;

  const applyBtn = document.getElementById('lab-apply-wiring');
  if (applyBtn) setButtonState(applyBtn, 'busy', 'Aplicando…');
  flashStatus('Aplicando wiring al runtime…', 'busy', 60000);
  try {
    const result = await applyWiringToRuntime();
    saveDraft();
    await mergeWiringFromBridge();
    renderSchematic();
    renderNodeEditor();
    renderIntentPreview();
    if (applyBtn) setButtonState(applyBtn, 'ok', '✓ Aplicado');
    flashStatus(
      result.applied
        ? `✅ Runtime actualizado · ${result.path ?? 'runtime/wiring'}`
        : 'Borrador guardado (apply falló parcialmente)',
      result.applied ? 'ok' : 'err',
      8000
    );
    if (applyBtn) resetButtonState(applyBtn, 2800);
  } catch (e) {
    if (applyBtn) setButtonState(applyBtn, 'err', '✗ Falló');
    flashStatus(`❌ ${e.message ?? e}. ¿lab:bridge en marcha?`, 'err', 12000);
    if (applyBtn) resetButtonState(applyBtn, 3500);
  }
  await refreshBridgeStatus();
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
  if (!confirmIfFeasibilityWarnings('Enviar a Cursor')) return;

  const sendBtn = document.getElementById('lab-send-cursor');
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
    setButtonState(sendBtn, 'busy', 'Copiando…');
    const ok = await copyText(full);
    if (ok) {
      setButtonState(sendBtn, 'ok', '✓ Copiado');
      flashStatus('Copiado. Vuelve a ESTE chat de Cursor y pega (Ctrl+V).', 'ok', 6000);
    } else {
      setButtonState(sendBtn, 'err', '✗ Error');
      flashStatus('Copia manualmente desde la vista previa.', 'err', 8000);
    }
    resetButtonState(sendBtn, 2500);
    return;
  }

  if (target === 'inbox') {
    setButtonState(sendBtn, 'busy', 'Enviando…');
    try {
      const result = await postLabInbox(full, userMsg);
      const short = userMsg.trim()
        ? `${userMsg.trim()}\n\nContinúa con @.cursor/lab-inbox/latest.md`
        : 'Continúa con @.cursor/lab-inbox/latest.md';
      await copyText(short);
      setButtonState(sendBtn, 'ok', '✓ Enviado');
      flashStatus(
        `Guardado en ${result.path}${result.wiringDraft ? ' + wiring-draft.json' : ''}. @ en Cursor o npm run wiring:apply`,
        'ok',
        8000
      );
    } catch {
      const ok = await copyText(full);
      setButtonState(sendBtn, 'err', '✗ Offline');
      flashStatus(
        ok
          ? 'Bridge offline — copiado al portapapeles. Ejecuta: cd runtime && npm run lab:bridge'
          : 'Bridge offline. Arranca lab:bridge o usa Chat actual.',
        'err',
        10000
      );
    }
    resetButtonState(sendBtn, 2800);
    return;
  }

  if (target === 'new') {
    setButtonState(sendBtn, 'busy', 'Abriendo…');
    openCursorDeeplink(deeplinkPayload);
    setButtonState(sendBtn, 'ok', '✓ Abierto');
    flashStatus(
      full.length > CURSOR_PROMPT_MAX
        ? 'Abriendo chat nuevo (texto recortado en enlace).'
        : 'Abriendo chat nuevo — confirma el prompt en Cursor.',
      'ok',
      6000
    );
    resetButtonState(sendBtn, 2500);
    return;
  }

  if (target === 'both') {
    setButtonState(sendBtn, 'busy', 'Enviando…');
    await copyText(full);
    openCursorDeeplink(deeplinkPayload);
    setButtonState(sendBtn, 'ok', '✓ Hecho');
    flashStatus('Copiado + deeplink. Pega en chat actual o confirma el nuevo.', 'ok', 6000);
    resetButtonState(sendBtn, 2500);
  }
}

function bindGlobalActions() {
  const applyBtn = document.getElementById('lab-apply-wiring');
  rememberButtonLabel(applyBtn);
  applyBtn?.addEventListener('click', () => {
    handleApplyWiring();
  });

  const sendBtn = document.getElementById('lab-send-cursor');
  rememberButtonLabel(sendBtn);
  sendBtn?.addEventListener('click', () => {
    sendToCursor();
  });

  const copyBtn = document.getElementById('lab-copy-chat');
  rememberButtonLabel(copyBtn);
  copyBtn?.addEventListener('click', async () => {
    const userMsg = document.getElementById('lab-user-message')?.value ?? '';
    const text = buildFullPrompt(userMsg);
    renderIntentPreview();
    setButtonState(copyBtn, 'busy', 'Copiando…');
    try {
      await navigator.clipboard.writeText(text);
      setButtonState(copyBtn, 'ok', '✓ Copiado');
      flashStatus('Copiado al portapapeles.', 'ok', 5000);
    } catch {
      setButtonState(copyBtn, 'err', '✗ Error');
      flashStatus('Selecciona el texto del panel inferior y cópialo manualmente.', 'err', 8000);
    }
    resetButtonState(copyBtn, 2500);
  });

  const resetBtn = document.getElementById('lab-reset');
  rememberButtonLabel(resetBtn);
  resetBtn?.addEventListener('click', () => {
    if (!confirm('¿Resetear borrador local del Lab?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadDraft();
    state.selectedId = null;
    renderSchematic();
    renderNodeEditor();
    renderAssistant();
    renderIntentPreview();
    setButtonState(resetBtn, 'ok', '✓ Reset');
    flashStatus('Borrador reseteado.', 'ok', 5000);
    resetButtonState(resetBtn, 2200);
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

  document.getElementById('lab-toast-close')?.addEventListener('click', () => dismissToast());
}

const BUTTON_LABELS = new WeakMap();
let flashStatusTimer;

function rememberButtonLabel(btn) {
  if (!btn || BUTTON_LABELS.has(btn)) return;
  BUTTON_LABELS.set(btn, btn.textContent.trim());
}

function setButtonState(btn, state, tempLabel) {
  if (!btn) return;
  rememberButtonLabel(btn);
  const base = BUTTON_LABELS.get(btn);
  btn.classList.remove('btn-feedback-busy', 'btn-feedback-ok', 'btn-feedback-err');
  btn.disabled = false;
  if (state === 'busy') {
    btn.classList.add('btn-feedback-busy');
    btn.disabled = true;
    btn.textContent = tempLabel ?? '…';
  } else if (state === 'ok') {
    btn.classList.add('btn-feedback-ok');
    btn.textContent = tempLabel ?? '✓ Hecho';
  } else if (state === 'err') {
    btn.classList.add('btn-feedback-err');
    btn.textContent = tempLabel ?? '✗ Error';
  } else {
    btn.textContent = base;
  }
}

function resetButtonState(btn, delay = 0) {
  if (!btn) return;
  setTimeout(() => setButtonState(btn, 'idle'), delay);
}

function dismissToast() {
  clearTimeout(flashStatusTimer);
  const toast = document.getElementById('lab-toast');
  const msgEl = document.getElementById('lab-toast-msg');
  if (toast) {
    toast.classList.remove('lab-toast-visible');
    toast.hidden = true;
  }
  if (msgEl) msgEl.textContent = '';
}

function flashStatus(msg, type = 'info', ms = 5000) {
  const toast = document.getElementById('lab-toast');
  const msgEl = document.getElementById('lab-toast-msg');
  const statusEl = document.getElementById('lab-status');
  const schematicStatus = document.getElementById('lab-status-schematic');
  clearTimeout(flashStatusTimer);

  if (toast && msgEl) {
    msgEl.textContent = msg;
    toast.hidden = !msg;
    toast.className = `lab-toast lab-toast-${type}${msg ? ' lab-toast-visible' : ''}`;
  }

  for (const el of [statusEl, schematicStatus]) {
    if (!el) continue;
    el.textContent = msg;
    const baseClass =
      el.id === 'lab-status-schematic' ? 'lab-status-schematic' : 'lab-status sub';
    el.className = `${baseClass} lab-status-${type}`;
  }

  if (msg && type !== 'err' && type !== 'warn') {
    flashStatusTimer = setTimeout(() => dismissToast(), ms);
  }
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
