/**
 * Panel Ajustes — contenido dinámico y textos para usuario no técnico.
 */
import { assetUrl, fetchJson, defaultTokenId, applyAvatar, shortAddr } from './shared.js';
import { renderBodyMap } from './body-map.js';
import { bindOrganScaleControl, bindWatermarkControls } from './lab-display.js';

function el(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text ?? '—';
}

function telegramUrl(handle) {
  const h = (handle || '').replace(/^@/, '');
  return h ? `https://t.me/${h}` : null;
}

function formatUsd(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `$${n.toFixed(2)}`;
}

export async function initSettingsPage() {
  const tokenId = await defaultTokenId();
  const agent = await fetchJson(assetUrl(`assets/agents/${tokenId}.json`));
  let budget = null;
  try {
    budget = await fetchJson(assetUrl(`assets/budget-${tokenId}.json`));
  } catch {
    /* export opcional */
  }

  applyAvatar(agent);
  renderBodyMap(agent);

  const visualName = agent.visual?.name || 'URUIRU';
  setText('guide-agent-name', visualName);
  setText('guide-agent-sub', agent.description || 'Agente de inteligencia artificial que vive en un NFT.');

  const tg = agent.chat?.telegram;
  const tgUrl = telegramUrl(tg);
  if (tgUrl) {
    const link = el('channel-telegram-link');
    if (link) {
      link.href = tgUrl;
      link.textContent = tg ? `@${tg.replace(/^@/, '')}` : 'Abrir Telegram';
    }
    setText('channel-telegram-handle', tg ? `@${tg.replace(/^@/, '')}` : '—');
  }

  setText('treasury-tba-short', agent.tba ? shortAddr(agent.tba) : '—');
  setText('treasury-tba-full', agent.tba || '—');
  const tbaLink = el('treasury-tba-link');
  if (tbaLink && agent.links?.tba) tbaLink.href = agent.links.tba;

  if (budget?.budget) {
    const b = budget.budget;
    setText('budget-spent-today', formatUsd(b.globalDayUsd));
    setText('budget-cap-day', formatUsd(b.globalCap ?? agent.globalCapPerDayUsd));
    setText('budget-status-hint', 'Datos exportados del runtime (pueden estar desactualizados unos minutos).');
  } else {
    setText('budget-status-hint', 'Sin datos recientes — el agente sigue pudiendo funcionar.');
  }

  bindOrganScaleControl(el('lab-organ-scale'), el('lab-organ-scale-val'));
  bindWatermarkControls({
    enabledInput: el('lab-watermark-enabled'),
    opacityInput: el('lab-watermark-opacity'),
    valueEl: el('lab-watermark-opacity-val'),
  });

  bindWallet();
  bindCopyButtons();
}

function bindWallet() {
  const btn = el('btn-connect');
  const st = el('wallet-status');
  if (!btn || !st) return;

  if (!window.ethereum) {
    st.textContent =
      'No detectamos MetaMask en este navegador. Puedes hablar con URUIRU por Telegram sin instalar nada de cripto.';
    btn.hidden = true;
    return;
  }

  btn.addEventListener('click', async () => {
    try {
      const [addr] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      st.innerHTML = `Conectado: <strong>${shortAddr(addr)}</strong>. Si eres el dueño del NFT #1, en el futuro podrás recargar la hucha desde aquí. Si solo quieres chatear, no necesitas wallet.`;
    } catch (e) {
      st.textContent = e.message || 'No se pudo conectar la wallet.';
    }
  });
}

function bindCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-copy-target');
      const src = el(id);
      if (!src) return;
      const text = src.textContent?.trim() || '';
      navigator.clipboard?.writeText(text).then(
        () => {
          const prev = btn.textContent;
          btn.textContent = 'Copiado';
          setTimeout(() => {
            btn.textContent = prev;
          }, 1500);
        },
        () => {},
      );
    });
  });
}
