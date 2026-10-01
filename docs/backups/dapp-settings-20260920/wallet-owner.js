/**
 * Helpers wallet + ownerOf para dApp settings (sin dependencias).
 */

const OWNER_OF_SELECTOR = '0x6352211e';

export function padUint256(n) {
  const hex = BigInt(n).toString(16);
  return hex.padStart(64, '0');
}

export function encodeOwnerOf(tokenId) {
  return OWNER_OF_SELECTOR + padUint256(tokenId);
}

/**
 * @param {{ rpc: string, contract: string, tokenId: string|number }} opts
 * @returns {Promise<string|null>} address checksum-ish lowercase or null
 */
export async function fetchOwnerOf({ rpc, contract, tokenId }) {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: contract,
          data: encodeOwnerOf(tokenId),
        },
        'latest',
      ],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'eth_call failed');
  const result = json.result;
  if (!result || result === '0x' || result.length < 66) return null;
  return ('0x' + result.slice(-40)).toLowerCase();
}

export async function requestAccounts() {
  if (!window.ethereum) throw new Error('MetaMask / wallet no detectado');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts?.[0] || null;
}

export function sameAddress(a, b) {
  if (!a || !b) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

export const BROWSER_WIRING_KEY = (packId) => `agenft-wiring:${packId}`;
export const BROWSER_HOST_KEY = (packId) => `agenft-host-prefs:${packId}`;

export function loadBrowserWiring(packId) {
  try {
    const raw = localStorage.getItem(BROWSER_WIRING_KEY(packId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBrowserWiring(packId, wiring) {
  localStorage.setItem(BROWSER_WIRING_KEY(packId), JSON.stringify(wiring));
}

export function loadBrowserHostPrefs(packId) {
  try {
    const raw = localStorage.getItem(BROWSER_HOST_KEY(packId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBrowserHostPrefs(packId, prefs) {
  localStorage.setItem(BROWSER_HOST_KEY(packId), JSON.stringify(prefs));
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function settingsFetch(bridgeUrl, path, { method = 'GET', body, token, owner } = {}) {
  const base = bridgeUrl.replace(/\/$/, '');
  const headers = { 'content-type': 'application/json' };
  if (token) headers['x-settings-token'] = token;
  if (owner) headers['x-owner-address'] = owner;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `${method} ${path} → ${res.status}`);
  }
  return json;
}
