const STATUS_CLASS = {
  alive: 'body-alive',
  partial: 'body-partial',
  off: 'body-off',
  planned: 'body-planned',
};

const STATUS_LABEL = {
  alive: 'Vivo',
  partial: 'Parcial',
  off: 'Apagado',
  planned: 'Previsto',
};

/** Renderiza el muñeco de órganos en #body-map */
export function renderBodyMap(agent) {
  const root = document.getElementById('body-map');
  if (!root) return;

  const organs = agent.organs ?? defaultOrgans(agent);
  root.innerHTML = '';

  const core = document.createElement('div');
  core.className = 'body-core';
  core.innerHTML = `
    <div class="body-chain">Onchain · NFT #${agent.tokenId}</div>
    <div class="body-chain-sub">${shortChain(agent)}</div>
  `;
  root.appendChild(core);

  const grid = document.createElement('div');
  grid.className = 'body-grid';

  for (const o of organs) {
    const node = document.createElement('article');
    node.className = `body-node ${STATUS_CLASS[o.status] ?? 'body-planned'}`;
    node.innerHTML = `
      <span class="body-node-label">${escapeHtml(o.label)}</span>
      <span class="body-node-detail">${escapeHtml(o.detail || '')}</span>
      <span class="body-node-status">${STATUS_LABEL[o.status] ?? o.status}</span>
    `;
    if (o.wire) node.dataset.wire = o.wire;
    grid.appendChild(node);
  }

  root.appendChild(grid);

  const foot = document.createElement('p');
  foot.className = 'body-foot sub';
  foot.textContent =
    'Esqueleto del cuerpo digital — cableado real en runtime y manifiesto. Organ Studio: ver Lab Studio (lab.html).';
  root.appendChild(foot);
}

function shortChain(agent) {
  const tba = agent.tba ? `${agent.tba.slice(0, 8)}…` : '—';
  return `TBA ${tba} · ${agent.budgetProfile || '—'}`;
}

function defaultOrgans(agent) {
  return [
    { id: 'brain', label: 'Cerebro', detail: 'tx402.ai', status: 'alive', wire: 'core' },
    { id: 'runtime', label: 'Motor', detail: 'Hermes', status: 'alive', wire: 'core' },
    { id: 'memory', label: 'Memoria', detail: 'local + export', status: 'partial', wire: 'core' },
    { id: 'doctor', label: 'Doctor Qi', detail: 'probe', status: 'alive', wire: 'core' },
    { id: 'reflexes', label: 'Reflejos', detail: 'budget', status: 'alive', wire: 'core' },
    { id: 'gateway', label: 'Chat', detail: agent.chat?.telegram ? `@${agent.chat.telegram}` : 'web', status: 'alive', wire: 'edge' },
    { id: 'presence', label: 'Presencia', detail: 'URUIRU visual', status: agent.image ? 'partial' : 'off', wire: 'edge' },
    { id: 'senses', label: 'Sentidos', detail: 'STT · OCR', status: 'planned', wire: 'edge' },
    { id: 'hygiene', label: 'Hygiene', detail: 'seguridad', status: 'planned', wire: 'edge' },
  ];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
