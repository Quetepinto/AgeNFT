/**
 * Dashboard settings — wiring + host elegido (browser / download / VPS bridge).
 */
import { assetUrl, fetchJson, tokenFromPath, applyAvatar, shortAddr } from './shared.js';
import { renderBodyMap } from './body-map.js';
import { bindOrganScaleControl, bindWatermarkControls } from './lab-display.js';
import {
  fetchOwnerOf,
  requestAccounts,
  sameAddress,
  loadBrowserWiring,
  saveBrowserWiring,
  loadBrowserHostPrefs,
  saveBrowserHostPrefs,
  downloadJson,
  settingsFetch,
} from './wallet-owner.js';

const PACK_BY_TOKEN = { 1: 'unit-mainnet', 115: 'unit-1' };

const MEMORY_OPTIONS = [
  { value: 'lab-local', label: 'Local (lab)' },
  { value: 'kubo-ipfs', label: 'Kubo / IPFS' },
  { value: 'toju-ipfs', label: 'toju + IPFS' },
  { value: 'w3stor-ipfs', label: 'w3stor' },
  { value: 'export-only', label: 'Solo export (sin sync)' },
];

const el = (id) => document.getElementById(id);

function setStatus(msg, kind = '') {
  const s = el('settings-status');
  if (!s) return;
  s.textContent = msg;
  s.className = 'settings-status' + (kind ? ` ${kind}` : '');
}

function packIdForToken(tokenId) {
  return PACK_BY_TOKEN[String(tokenId)] || `unit-${tokenId}`;
}

function ensureEdge(wiring, from, to, category = 'alive') {
  if (!wiring.edges) wiring.edges = [];
  if (wiring.edges.some((e) => e.from === from && e.to === to)) return;
  wiring.edges.push({
    id: `e-${from}-${to}-${Date.now()}`,
    from,
    to,
    category,
  });
}

function removeEdge(wiring, from, to) {
  wiring.edges = (wiring.edges || []).filter((e) => !(e.from === from && e.to === to));
}

function hasEdge(wiring, from, to) {
  return (wiring.edges || []).some((e) => e.from === from && e.to === to);
}

function getNode(wiring, id) {
  return (wiring.nodes || []).find((n) => n.id === id) || null;
}

function setNodeOption(wiring, id, option, category = 'alive') {
  const n = getNode(wiring, id);
  if (!n) return;
  n.option = option;
  n.category = category;
}

function cloneWiring(w) {
  return JSON.parse(JSON.stringify(w));
}

function defaultWiringSkeleton(packId) {
  return {
    type: 'agenft-wiring/v1',
    packId,
    layoutVersion: 3,
    notes: 'Creado desde Dashboard settings',
    nodes: [
      {
        id: 'brain',
        label: 'Cerebro',
        group: 'head',
        category: 'alive',
        option: 'tx402',
        x: 386,
        y: 4,
      },
      {
        id: 'memory',
        label: 'Memoria',
        group: 'head',
        category: 'alive',
        option: 'lab-local',
        x: 584,
        y: 20,
      },
      {
        id: 'nft',
        label: 'NFT · TBA',
        group: 'torso',
        category: 'alive',
        option: 'base-mainnet',
        x: 386,
        y: 152,
      },
      {
        id: 'runtime',
        label: 'Motor',
        group: 'torso',
        category: 'alive',
        option: 'hermes',
        x: 386,
        y: 232,
      },
      {
        id: 'gateway',
        label: 'Gateway chat',
        group: 'limb',
        category: 'partial',
        option: 'telegram',
        x: 36,
        y: 232,
      },
      {
        id: 'chatweb',
        label: 'Chat web',
        group: 'limb',
        category: 'alive',
        option: 'chat-api-caddy',
        x: 12,
        y: 328,
      },
      {
        id: 'doctor',
        label: 'Doctor Qi',
        group: 'torso',
        category: 'alive',
        option: 'probe',
        x: 568,
        y: 214,
      },
    ],
    edges: [
      { id: 'e1', from: 'nft', to: 'runtime', category: 'alive' },
      { id: 'e2', from: 'runtime', to: 'brain', category: 'alive' },
      { id: 'e3', from: 'brain', to: 'memory', category: 'alive' },
      { id: 'e5', from: 'runtime', to: 'doctor', category: 'alive' },
      { id: 'e7', from: 'runtime', to: 'chatweb', category: 'alive' },
      { id: 'e-gw', from: 'runtime', to: 'gateway', category: 'partial' },
    ],
  };
}

/** State */
const state = {
  tokenId: '1',
  packId: 'unit-mainnet',
  agent: null,
  wallet: null,
  owner: null,
  isOwner: false,
  wiring: null,
  hostPrefs: {
    mode: 'browser',
    bridgeUrl: 'http://127.0.0.1:8800',
    mobilityPack: '',
    notes: '',
    token: '',
  },
};

function fillMemorySelect() {
  const sel = el('mem-option');
  sel.innerHTML = MEMORY_OPTIONS.map(
    (o) => `<option value="${o.value}">${o.label}</option>`,
  ).join('');
}

function wiringToForm(wiring) {
  el('gw-enabled').checked = hasEdge(wiring, 'runtime', 'gateway');
  el('chatweb-enabled').checked = hasEdge(wiring, 'runtime', 'chatweb');
  const mem = getNode(wiring, 'memory');
  if (mem?.option) el('mem-option').value = mem.option;
  el('wiring-notes').value = wiring.notes || '';
}

function formToWiring() {
  const w = cloneWiring(state.wiring || defaultWiringSkeleton(state.packId));
  w.packId = state.packId;
  w.type = 'agenft-wiring/v1';
  if (el('gw-enabled').checked) ensureEdge(w, 'runtime', 'gateway', 'partial');
  else removeEdge(w, 'runtime', 'gateway');
  if (el('chatweb-enabled').checked) ensureEdge(w, 'runtime', 'chatweb', 'alive');
  else removeEdge(w, 'runtime', 'chatweb');
  setNodeOption(w, 'memory', el('mem-option').value, 'alive');
  w.notes = el('wiring-notes').value.trim();
  w.updatedAt = new Date().toISOString();
  return w;
}

function hostPrefsFromForm() {
  return {
    type: 'agenft-host-prefs/v1',
    packId: state.packId,
    mode: el('host-mode').value,
    bridgeUrl: el('bridge-url').value.trim(),
    mobilityPack: el('mobility-pack').value.trim(),
    notes: el('host-notes').value.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function applyHostPrefsToForm(prefs) {
  if (!prefs) return;
  if (prefs.mode) el('host-mode').value = prefs.mode;
  if (prefs.bridgeUrl) el('bridge-url').value = prefs.bridgeUrl;
  if (prefs.mobilityPack != null) el('mobility-pack').value = prefs.mobilityPack;
  if (prefs.notes != null) el('host-notes').value = prefs.notes;
  toggleBridgeFields();
}

function toggleBridgeFields() {
  const mode = el('host-mode').value;
  const needsUrl = mode === 'local' || mode === 'vps' || mode === 'custom';
  el('bridge-fields').hidden = !needsUrl;
  el('browser-hint').hidden = mode !== 'browser';
  el('download-hint').hidden = mode !== 'browser';
}

function updateOwnerUi() {
  const badge = el('owner-badge');
  const saveBtn = el('btn-save');
  if (!state.wallet) {
    badge.textContent = 'Sin wallet';
    badge.className = 'settings-badge';
    saveBtn.disabled = true;
    return;
  }
  if (!state.owner) {
    badge.textContent = `Wallet ${shortAddr(state.wallet)} · owner onchain desconocido`;
    badge.className = 'settings-badge warn';
    saveBtn.disabled = true;
    return;
  }
  state.isOwner = sameAddress(state.wallet, state.owner);
  if (state.isOwner) {
    badge.textContent = `Owner verificado · ${shortAddr(state.wallet)}`;
    badge.className = 'settings-badge ok';
    saveBtn.disabled = false;
  } else {
    badge.textContent = `Conectado ${shortAddr(state.wallet)} · owner es ${shortAddr(state.owner)}`;
    badge.className = 'settings-badge warn';
    saveBtn.disabled = true;
  }
}

async function refreshOwner() {
  const a = state.agent;
  if (!a?.nft?.contract || !a?.chain?.rpc) {
    state.owner = null;
    updateOwnerUi();
    return;
  }
  try {
    state.owner = await fetchOwnerOf({
      rpc: a.chain.rpc,
      contract: a.nft.contract,
      tokenId: a.nft.tokenId || state.tokenId,
    });
    el('onchain-owner').textContent = state.owner ? shortAddr(state.owner) : '—';
  } catch (e) {
    el('onchain-owner').textContent = `error: ${e.message}`;
    state.owner = null;
  }
  updateOwnerUi();
}

async function connectWallet() {
  try {
    state.wallet = await requestAccounts();
    el('wallet-status').textContent = state.wallet
      ? `Conectado: ${shortAddr(state.wallet)}`
      : '';
    await refreshOwner();
    setStatus('Wallet conectada.', 'ok');
  } catch (e) {
    setStatus(e.message, 'err');
  }
}

async function probeBridge() {
  const url = el('bridge-url').value.trim();
  const token = el('bridge-token').value.trim();
  if (!url) {
    setStatus('Indica URL del settings-bridge.', 'warn');
    return;
  }
  try {
    const h = await settingsFetch(url, '/v1/health', { token });
    el('bridge-probe').textContent = `OK · ${h.service} v${h.version} · ${h.host}:${h.port}`;
    el('bridge-probe').className = 'mono settings-probe ok';
    setStatus('Bridge reachable.', 'ok');
  } catch (e) {
    el('bridge-probe').textContent = `Offline: ${e.message}`;
    el('bridge-probe').className = 'mono settings-probe err';
    setStatus(e.message, 'err');
  }
}

async function loadFromTarget() {
  const mode = el('host-mode').value;
  try {
    if (mode === 'browser') {
      const local = loadBrowserWiring(state.packId);
      const prefs = loadBrowserHostPrefs(state.packId);
      if (prefs) {
        state.hostPrefs = { ...state.hostPrefs, ...prefs };
        applyHostPrefsToForm(prefs);
      }
      state.wiring = local || state.wiring || defaultWiringSkeleton(state.packId);
      wiringToForm(state.wiring);
      setStatus(
        local ? 'Wiring cargado desde este navegador.' : 'Sin wiring en navegador — plantilla.',
        local ? 'ok' : 'warn',
      );
      return;
    }

    const url = el('bridge-url').value.trim();
    const token = el('bridge-token').value.trim();
    const wRes = await settingsFetch(url, `/v1/wiring?packId=${encodeURIComponent(state.packId)}`, {
      token,
    });
    if (wRes.wiring) {
      state.wiring = wRes.wiring;
      wiringToForm(state.wiring);
    }
    try {
      const pRes = await settingsFetch(
        url,
        `/v1/host-prefs?packId=${encodeURIComponent(state.packId)}`,
        { token },
      );
      if (pRes.prefs) {
        applyHostPrefsToForm(pRes.prefs);
        el('host-mode').value = mode;
        toggleBridgeFields();
      }
    } catch {
      /* host-prefs optional */
    }
    setStatus(
      wRes.missing ? 'Host sin wiring aún — usa plantilla al guardar.' : `Wiring leído de ${url}`,
      wRes.missing ? 'warn' : 'ok',
    );
    if (wRes.missing && !state.wiring) {
      state.wiring = defaultWiringSkeleton(state.packId);
      wiringToForm(state.wiring);
    }
  } catch (e) {
    setStatus(e.message, 'err');
  }
}

async function saveAll() {
  if (!state.isOwner) {
    setStatus('Solo el owner del NFT puede guardar.', 'err');
    return;
  }
  const wiring = formToWiring();
  const prefs = hostPrefsFromForm();
  const mode = prefs.mode;
  state.wiring = wiring;

  try {
    if (mode === 'browser') {
      saveBrowserWiring(state.packId, wiring);
      saveBrowserHostPrefs(state.packId, prefs);
      downloadJson(`wiring-${state.packId}.json`, wiring);
      downloadJson(`host-prefs-${state.packId}.json`, prefs);
      setStatus(
        'Guardado en este navegador + descargas JSON (puedes copiarlas a tu VPS).',
        'ok',
      );
      return;
    }

    const url = prefs.bridgeUrl || el('bridge-url').value.trim();
    const token = el('bridge-token').value.trim();
    if (!url) throw new Error('Falta URL del host (settings-bridge)');

    await settingsFetch(url, '/v1/wiring', {
      method: 'POST',
      token,
      owner: state.wallet,
      body: { wiring, packId: state.packId, apply: true, owner: state.wallet },
    });
    await settingsFetch(url, '/v1/host-prefs', {
      method: 'POST',
      token,
      owner: state.wallet,
      body: prefs,
    });
    saveBrowserHostPrefs(state.packId, prefs);
    setStatus(`Guardado en host ${url} → runtime/wiring/${state.packId}.json`, 'ok');
  } catch (e) {
    setStatus(e.message, 'err');
  }
}

async function init() {
  fillMemorySelect();
  bindOrganScaleControl(el('lab-organ-scale'), el('lab-organ-scale-val'));
  bindWatermarkControls({
    enabledInput: el('lab-watermark-enabled'),
    opacityInput: el('lab-watermark-opacity'),
    valueEl: el('lab-watermark-opacity-val'),
  });

  state.tokenId = await tokenFromPath();
  state.packId = packIdForToken(state.tokenId);
  el('token-label').textContent = `#${state.tokenId}`;
  el('pack-label').textContent = state.packId;

  const agent = await fetchJson(assetUrl(`assets/agents/${state.tokenId}.json`));
  state.agent = agent;
  applyAvatar(agent);
  renderBodyMap(agent);
  el('agent-name').textContent = agent.name || 'ageNFT';

  const browserPrefs = loadBrowserHostPrefs(state.packId);
  if (browserPrefs) applyHostPrefsToForm(browserPrefs);
  else toggleBridgeFields();

  const browserWiring = loadBrowserWiring(state.packId);
  state.wiring = browserWiring || defaultWiringSkeleton(state.packId);
  wiringToForm(state.wiring);

  await refreshOwner();

  el('btn-connect').addEventListener('click', connectWallet);
  el('host-mode').addEventListener('change', toggleBridgeFields);
  el('btn-probe').addEventListener('click', probeBridge);
  el('btn-load').addEventListener('click', loadFromTarget);
  el('btn-save').addEventListener('click', saveAll);

  if (window.ethereum) {
    window.ethereum.on?.('accountsChanged', async (accs) => {
      state.wallet = accs?.[0] || null;
      el('wallet-status').textContent = state.wallet
        ? `Conectado: ${shortAddr(state.wallet)}`
        : 'Desconectado';
      updateOwnerUi();
    });
  } else {
    el('wallet-status').textContent = 'MetaMask no detectado (puedes usar solo export JSON).';
  }
}

init().catch((e) => setStatus(e.message, 'err'));
