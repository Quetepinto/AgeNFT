import { initChat } from './chat.js';
import {
  assetUrl,
  fetchJson,
  tokenFromPath,
  applyAvatar,
  shortAddr,
} from './shared.js';
import { renderBodyMap } from './body-map.js';

const USDC_DECIMALS = 6;

async function rpc(chainRpc, method, params) {
  const res = await fetch(chainRpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'RPC error');
  return json.result;
}

async function ethBalance(rpcUrl, address) {
  const hex = await rpc(rpcUrl, 'eth_getBalance', [address, 'latest']);
  return Number(BigInt(hex)) / 1e18;
}

async function usdcBalance(rpcUrl, usdcAddress, address) {
  const data = `0x70a08231${address.slice(2).toLowerCase().padStart(64, '0')}`;
  const hex = await rpc(rpcUrl, 'eth_call', [{ to: usdcAddress, data }, 'latest']);
  return Number(BigInt(hex)) / 10 ** USDC_DECIMALS;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function statusLabel(status) {
  if (status === 'mvp-mainnet') return 'MVP mainnet';
  if (status === 'beta-lab') return 'Beta lab';
  return status || '—';
}

async function main() {
  const tokenId = await tokenFromPath();
  const errEl = document.getElementById('load-error');
  errEl.hidden = true;

  try {
    const agent = await fetchJson(assetUrl(`assets/agents/${tokenId}.json`));
    let budget = null;
    try {
      budget = await fetchJson(assetUrl(`assets/budget-${tokenId}.json`));
    } catch {
      budget = null;
    }

    const chainName = agent.chain?.name || 'Base';
    const usdcAddr = agent.chain?.usdc;

    document.title = `${agent.name} — ageNFT`;
    setText('agent-name', agent.name);
    setText('agent-id', `#${agent.tokenId}`);
    setText('agent-desc', agent.description || '');
    setText('chain-name', chainName);
    setText('payer-mode', agent.payerMode === 'tba-sovereign' ? 'TBA soberana' : 'EOA lab');
    setText('tba-full', agent.tba);
    setText('tba-short', shortAddr(agent.tba));
    setText('nft-contract', shortAddr(agent.nft?.contract));
    setText('budget-profile', agent.budgetProfile || '—');
    setText('global-cap', agent.globalCapPerDayUsd ? `$${agent.globalCapPerDayUsd}/día` : '—');

    if (agent.visual?.name) {
      setText('visual-name', agent.visual.name);
      setText('visual-series', agent.visual.series || 'Gespenster');
    }

    const badge = document.getElementById('status-badge');
    if (badge) {
      badge.textContent = statusLabel(agent.status);
      badge.classList.toggle('badge-mainnet', agent.status === 'mvp-mainnet');
    }

    const tbaLink = document.getElementById('link-tba');
    if (tbaLink && agent.links?.tba) {
      tbaLink.href = agent.links.tba;
      tbaLink.textContent = 'Ver TBA en explorer';
    }

    const nftLink = document.getElementById('link-nft');
    if (nftLink && agent.links?.nft) {
      nftLink.href = agent.links.nft;
      nftLink.textContent = 'Ver NFT en explorer';
    }

    applyAvatar(agent, { imgId: 'avatar', fallbackId: 'avatar-fallback' });
    applyAvatar(agent, { imgId: 'presence-img', fallbackId: 'presence-fallback', large: true });

    renderBodyMap(agent);

    const balRows = document.getElementById('balances');
    balRows.innerHTML = '<div class="row"><span>Consultando onchain…</span><span>…</span></div>';

    const [eth, usdc] = await Promise.all([
      ethBalance(agent.chain.rpc, agent.tba),
      usdcBalance(agent.chain.rpc, usdcAddr, agent.tba),
    ]);

    balRows.innerHTML = `
      <div class="row"><span>ETH (${chainName})</span><span>${eth.toFixed(6)}</span></div>
      <div class="row"><span>USDC (${chainName})</span><span>${usdc.toFixed(4)}</span></div>
    `;

    const budgetEl = document.getElementById('budget-rows');
    if (budget?.budget?.windows) {
      const w = budget.budget.windows;
      budgetEl.innerHTML = `
        <div class="row"><span>Hoy (requests)</span><span>${w.day?.requests ?? 0} / ${agent.brainCaps?.perDay?.requests ?? '—'}</span></div>
        <div class="row"><span>Hoy (USD cerebro)</span><span>$${w.day?.usd ?? '0'} / $${agent.brainCaps?.perDay?.usd ?? '—'}</span></div>
        <div class="row"><span>Global hoy</span><span>$${budget.budget.globalDayUsd ?? '0'} / $${agent.globalCapPerDayUsd ?? '—'}</span></div>
        <div class="row"><span>Snapshot</span><span class="mono">${(budget.exportedAt || '').slice(0, 19)}</span></div>
      `;
    } else {
      budgetEl.innerHTML =
        '<div class="row"><span>Snapshot</span><span class="status-warn">No disponible — ejecutar npm run dapp:export</span></div>';
    }

    const tg = document.getElementById('btn-telegram');
    if (agent.chat?.telegram) {
      tg.href = `https://t.me/${agent.chat.telegram.replace('@', '')}`;
      tg.classList.remove('disabled');
      tg.removeAttribute('aria-disabled');
      tg.textContent = `@${agent.chat.telegram.replace('@', '')}`;
    }

    const connectBtn = document.getElementById('btn-connect');
    if (window.ethereum) {
      connectBtn.addEventListener('click', async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setText('wallet-status', `Conectado: ${shortAddr(accounts[0])}`);
        } catch (e) {
          setText('wallet-status', `Error: ${e.message}`);
        }
      });
    } else {
      setText('wallet-status', 'Instala MetaMask para conectar (opcional).');
      connectBtn.classList.add('disabled');
    }

    initChat();
  } catch (e) {
    errEl.hidden = false;
    errEl.textContent = `No se pudo cargar el agente: ${e.message}`;
  }
}

main();
