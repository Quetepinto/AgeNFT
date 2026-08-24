/**
 * Chat web → agenft-chat-api (runtime).
 */
export function initChat() {
  const apiMeta = document.querySelector('meta[name="agenft-api-url"]');
  const defaultApi = apiMeta?.content?.trim() || '';
  const stored = localStorage.getItem('agenft-api-url') || '';
  const apiUrl = (stored || defaultApi).replace(/\/$/, '');

  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const log = document.getElementById('chat-log');
  const status = document.getElementById('chat-status');
  const apiInput = document.getElementById('chat-api-url');
  const apiSave = document.getElementById('chat-api-save');

  if (!form || !log) return;

  if (apiInput) {
    apiInput.value = apiUrl;
    apiSave?.addEventListener('click', () => {
      const v = apiInput.value.trim().replace(/\/$/, '');
      if (v) localStorage.setItem('agenft-api-url', v);
      else localStorage.removeItem('agenft-api-url');
      if (status) status.textContent = v ? `API: ${v}` : 'Sin API — solo lectura';
    });
  }

  function append(role, text) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  async function probe() {
    const url = (apiInput?.value || apiUrl).trim().replace(/\/$/, '');
    if (!url) {
      if (status) status.textContent = 'Configura URL del runtime (ej. http://127.0.0.1:8787)';
      return false;
    }
    try {
      const r = await fetch(`${url}/health`);
      const j = await r.json();
      if (status) status.textContent = j.ok ? `Conectado · pay=${j.pay}` : 'API no responde';
      return j.ok;
    } catch {
      if (status) status.textContent = 'No se alcanza la API — ¿npm run chat:api en el servidor?';
      return false;
    }
  }

  probe();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    const url = (apiInput?.value || apiUrl).trim().replace(/\/$/, '');
    if (!url) {
      append('system', 'Falta URL de API del runtime.');
      return;
    }
    append('user', message);
    input.value = '';
    input.disabled = true;
    try {
      const r = await fetch(`${url}/v1/turn`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const j = await r.json();
      if (j.ok && j.assistantText) {
        append('agent', j.assistantText);
      } else if (j.dormant) {
        append('system', `DORMANT: ${j.reason ?? 'presupuesto o USDC bajo'}`);
      } else {
        append('system', j.error ?? j.reason ?? 'Error del runtime');
      }
    } catch (err) {
      append('system', `Error de red: ${err.message}`);
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
}
