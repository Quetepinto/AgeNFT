/**
 * Widget de chat reutilizable → agenft-chat-api (runtime).
 */
export function resolveApiUrl(defaultApi = '') {
  const apiMeta = document.querySelector('meta[name="agenft-api-url"]');
  const metaDefault = apiMeta?.content?.trim() || '';
  const stored = localStorage.getItem('agenft-api-url') || '';
  return (stored || defaultApi || metaDefault).replace(/\/$/, '');
}

/**
 * @param {{
 *   container: HTMLElement,
 *   defaultApi?: string,
 *   showApiField?: boolean,
 *   placeholder?: string,
 *   onConnected?: (ok: boolean) => void,
 * }} opts
 */
export function mountChatWidget(opts) {
  const {
    container,
    defaultApi = '',
    showApiField = false,
    placeholder = 'Escribe a URUIRU…',
    onConnected,
  } = opts;

  container.innerHTML = '';
  container.classList.add('chat-widget');

  const status = document.createElement('p');
  status.className = 'chat-widget-status mono';

  let apiInput = null;
  if (showApiField) {
    const apiRow = document.createElement('div');
    apiRow.className = 'chat-api-row';
    apiInput = document.createElement('input');
    apiInput.type = 'url';
    apiInput.className = 'chat-input';
    apiInput.placeholder = 'http://127.0.0.1:8787';
    apiInput.setAttribute('aria-label', 'URL API runtime');
    const apiSave = document.createElement('button');
    apiSave.type = 'button';
    apiSave.className = 'btn btn-secondary';
    apiSave.textContent = 'Guardar';
    apiSave.addEventListener('click', () => {
      const v = apiInput.value.trim().replace(/\/$/, '');
      if (v) localStorage.setItem('agenft-api-url', v);
      else localStorage.removeItem('agenft-api-url');
      probe();
    });
    apiRow.append(apiInput, apiSave);
    container.append(apiRow);
  }

  const log = document.createElement('div');
  log.className = 'chat-log';
  log.setAttribute('aria-live', 'polite');

  const form = document.createElement('form');
  form.className = 'chat-form';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'chat-input';
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn';
  submit.textContent = 'Enviar';
  form.append(input, submit);

  container.append(status, log, form);

  if (apiInput) apiInput.value = resolveApiUrl(defaultApi);

  function append(role, text) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function currentUrl() {
    return (apiInput?.value || resolveApiUrl(defaultApi)).trim().replace(/\/$/, '');
  }

  async function probe() {
    const url = currentUrl();
    if (!url) {
      status.textContent = 'Sin API — modo guía estática';
      onConnected?.(false);
      return false;
    }
    try {
      const r = await fetch(`${url}/health`);
      const j = await r.json();
      const ok = Boolean(j.ok);
      status.textContent = ok ? `Cerebro en línea · ${j.pay ? 'con pago USDC' : 'solo probe'}` : 'API no responde';
      onConnected?.(ok);
      return ok;
    } catch {
      status.textContent = 'Sin cerebro en línea — modo guía estática o Telegram';
      onConnected?.(false);
      return false;
    }
  }

  async function sendMessage(message) {
    const text = String(message ?? '').trim();
    if (!text) return { ok: false, reason: 'empty' };

    const url = currentUrl();
    if (!url) return { ok: false, reason: 'no_api' };

    append('user', text);
    input.disabled = true;
    try {
      const r = await fetch(`${url}/v1/turn`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const j = await r.json();
      if (j.ok && j.assistantText) {
        append('agent', j.assistantText);
        return { ok: true, text: j.assistantText };
      }
      if (j.dormant) {
        append('system', `Descansando: ${j.reason ?? 'presupuesto o USDC bajo en la hucha'}`);
        return { ok: false, dormant: true, reason: j.reason };
      }
      const err = j.error ?? j.reason ?? 'Error del runtime';
      append('system', err);
      return { ok: false, reason: err };
    } catch (err) {
      append('system', `Error de red: ${err.message}`);
      return { ok: false, reason: err.message };
    } finally {
      input.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    await sendMessage(message);
  });

  probe();

  return { append, sendMessage, probe, log, input, status };
}
