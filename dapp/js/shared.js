export function basePath() {
  const meta = document.querySelector('meta[name="agenft-base"]');
  if (meta?.content && meta.content !== '.') {
    return meta.content.replace(/\/$/, '');
  }
  const parts = location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';
  if (last.endsWith('.html')) parts.pop();
  if (parts[parts.length - 1] && /^\d+$/.test(parts[parts.length - 1])) parts.pop();
  if (parts[parts.length - 1] === 'agent') parts.pop();
  return parts.length ? `/${parts.join('/')}` : '';
}

export function assetUrl(path) {
  return `${basePath()}/${path.replace(/^\//, '')}`;
}

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

export async function defaultTokenId() {
  try {
    const idx = await fetchJson(assetUrl('assets/index.json'));
    return idx.defaultAgentId || '1';
  } catch {
    return '1';
  }
}

export async function tokenFromPath() {
  const m = location.pathname.match(/\/agent\/(\d+)\/?$/);
  if (m) return m[1];
  const params = new URLSearchParams(location.search);
  if (params.get('id')) return params.get('id');
  return defaultTokenId();
}

/** Resuelve URL de imagen (http, ipfs, assets relativos). */
export function resolveImageSrc(imagePath) {
  if (!imagePath || imagePath.includes('placeholder')) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('ipfs://')) {
    return imagePath.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return assetUrl(imagePath);
}

/** Fallback: PNG → SVG o imageFallback del agente. */
export function imageFallbackSrc(primaryPath, explicitFallback) {
  if (explicitFallback) return resolveImageSrc(explicitFallback);
  if (!primaryPath || primaryPath.includes('placeholder')) {
    return assetUrl('assets/unit-mainnet.svg');
  }
  if (primaryPath.endsWith('.png')) {
    return assetUrl(primaryPath.replace(/\.png$/i, '.svg'));
  }
  return assetUrl('assets/unit-mainnet.svg');
}

/**
 * Muestra avatar URUIRU en img + fallback letra.
 * @param {object} agent — agents/N.json
 * @param {{ imgId?: string, fallbackId?: string, large?: boolean }} opts
 */
export function applyAvatar(agent, opts = {}) {
  const imgId = opts.imgId ?? 'avatar';
  const fallbackId = opts.fallbackId ?? 'avatar-fallback';
  const img = document.getElementById(imgId);
  const fallback = document.getElementById(fallbackId);
  if (!img || !fallback) return;

  const label = agent.visual?.name
    ? `${agent.visual.name} — Gespenster`
    : agent.name || 'Agente';
  const letter = agent.visual?.name?.slice(0, 1) || agent.name?.slice(0, 1) || 'U';

  const primary = resolveImageSrc(agent.image);
  const secondary = imageFallbackSrc(agent.image, agent.imageFallback);

  const showImg = () => {
    img.hidden = false;
    fallback.hidden = true;
    if (opts.large) img.classList.add('avatar-lg');
  };

  const showFallback = () => {
    img.hidden = true;
    fallback.hidden = false;
    fallback.textContent = letter;
    if (opts.large) fallback.classList.add('avatar-lg');
  };

  if (!primary && !secondary) {
    showFallback();
    return;
  }

  img.alt = label;
  img.onload = showImg;
  img.onerror = () => {
    if (img.dataset.triedFallback) {
      showFallback();
      return;
    }
    img.dataset.triedFallback = '1';
    img.src = secondary;
  };
  img.src = primary || secondary;
}

export function shortAddr(a) {
  if (!a || a.length < 12) return a || '—';
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
