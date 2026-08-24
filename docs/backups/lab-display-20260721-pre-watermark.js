/** Lab Studio — escala visual de órganos (localStorage, compartido Lab + Ajustes). */
export const ORGAN_SCALE_KEY = 'agenft-lab-organ-scale-v1';
export const ORGAN_SCALE_DEFAULT = 0.82;
export const ORGAN_SCALE_MIN = 0.65;
export const ORGAN_SCALE_MAX = 1.15;
export const ORGAN_SCALE_STEP = 0.05;

export const NODE_SIZE_BASE = { w: 128, h: 74 };
export const NODE_FONT_BASE = { title: 12, opt: 9, tags: 12 };

export function clampOrganScale(v) {
  if (!Number.isFinite(v)) return ORGAN_SCALE_DEFAULT;
  return Math.min(ORGAN_SCALE_MAX, Math.max(ORGAN_SCALE_MIN, v));
}

export function getOrganScale() {
  try {
    const raw = localStorage.getItem(ORGAN_SCALE_KEY);
    if (raw != null && raw !== '') return clampOrganScale(parseFloat(raw));
  } catch {
    /* ignore */
  }
  return ORGAN_SCALE_DEFAULT;
}

export function setOrganScale(v) {
  const clamped = clampOrganScale(v);
  localStorage.setItem(ORGAN_SCALE_KEY, String(clamped));
  return clamped;
}

export function getNodeSize() {
  const s = getOrganScale();
  return { w: NODE_SIZE_BASE.w * s, h: NODE_SIZE_BASE.h * s };
}

export function getNodeFonts() {
  const s = getOrganScale();
  return {
    title: NODE_FONT_BASE.title * s,
    opt: NODE_FONT_BASE.opt * s,
    tags: NODE_FONT_BASE.tags * s,
  };
}

/** Posiciones Y relativas dentro del rect del nodo. */
export function nodeTextYs(nodeY, nodeH) {
  return {
    title: nodeY + nodeH * 0.35,
    opt: nodeY + nodeH * 0.62,
    tags: nodeY + nodeH * 0.86,
  };
}

/**
 * @param {HTMLInputElement} input
 * @param {HTMLElement|null} valueEl
 * @param {(() => void)|undefined} onChange
 */
export function bindOrganScaleControl(input, valueEl, onChange) {
  if (!input) return;
  input.min = String(ORGAN_SCALE_MIN);
  input.max = String(ORGAN_SCALE_MAX);
  input.step = String(ORGAN_SCALE_STEP);

  const sync = () => {
    const v = getOrganScale();
    input.value = String(v);
    if (valueEl) valueEl.textContent = `${Math.round(v * 100)}%`;
  };

  sync();
  input.addEventListener('input', () => {
    setOrganScale(parseFloat(input.value));
    if (valueEl) valueEl.textContent = `${Math.round(getOrganScale() * 100)}%`;
    onChange?.();
  });
}

/** viewBox con margen para que quepan todos los módulos. */
export function computeSchematicViewBox(nodes, nodeSize, pad = 56) {
  if (!nodes?.length) return '0 0 960 480';
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + nodeSize.w);
    maxY = Math.max(maxY, n.y + nodeSize.h);
  }
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  return `${minX - pad} ${minY - pad} ${w} ${h}`;
}
