/**
 * Mini-chat guiado en Ajustes — híbrido: guía estática + cerebro real si hay API.
 */
import { mountChatWidget, resolveApiUrl } from './chat-widget.js';

const STATIC_GUIDE = {
  hola: `¡Hola! Soy URUIRU. Si ves este mensaje en modo guía, el cerebro aún no está conectado al dashboard.

Para hablar de verdad: (1) el operador ejecuta \`npm run chat:api\` en el servidor, o (2) abre Telegram — es lo más fácil.`,

  cables: `Los «cables» conectan órganos al Motor (runtime). El primero crítico es el **cerebro** (modelo IA vía tx402 + USDC en la TBA).

Orden típico para el dueño:
1. Cerebro — USDC en la hucha (TBA)
2. Gateway — bot Telegram nuevo
3. Doctor — \`npm run hermes:doctor\`

Comprueba: \`npm run transfer:vigilante\` en el servidor.`,

  telegram: `Telegram es el canal más fácil. Busca el bot en la sección «Empezar en tres pasos» arriba.

Si eres dueño del NFT: crea **tu** bot en @BotFather (no reutilices el del vendedor).`,

  hermes: `Hermes (Nous) es el arnés del MVP — gateway, tools, MCPs, skills. Instalar CLI + npm run hermes:install. Los puentes directos (bot/chat-api) son atajo temporal; la visión es construir encima de Hermes, no reimplementarlo. Ver docs/decisions/nomenclatura-hermes-nous.md.`,

  dormir: `«Descansando» (DORMANT) significa que la hucha (TBA) no tiene USDC suficiente o se alcanzó el tope diario. El personaje URUIRU sigue existiendo — solo pausa gasto del cerebro.`,
};

const CHIPS = [
  { id: 'hola', label: '¿Quién eres?' },
  { id: 'cables', label: '¿Qué cables faltan?' },
  { id: 'telegram', label: 'Ayuda Telegram' },
  { id: 'hermes', label: '¿Qué es Hermes?' },
  { id: 'dormir', label: '¿Por qué descansa?' },
];

export function initOnboardingChat(agentName = 'URUIRU') {
  const host = document.getElementById('onboarding-chat-host');
  const chipsHost = document.getElementById('onboarding-chat-chips');
  const pill = document.getElementById('onboarding-chat-pill');
  if (!host) return;

  let brainOnline = false;
  const widget = mountChatWidget({
    container: host,
    showApiField: false,
    placeholder: `Escribe a ${agentName}…`,
    onConnected: (ok) => {
      brainOnline = ok;
      if (pill) {
        pill.textContent = ok ? 'Cerebro en línea' : 'Modo guía';
        pill.className = ok ? 'status-pill status-pill-ok' : 'status-pill status-pill-warn';
      }
    },
  });

  widget.append(
    'agent',
    `Hola — soy ${agentName}. Pulsa un botón abajo o escribe. Si el operador tiene el runtime activo, te respondo con el cerebro real; si no, te guío con textos fijos.`,
  );

  if (chipsHost) {
    for (const chip of CHIPS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary btn-compact chat-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => handleChip(chip));
      chipsHost.append(btn);
    }
  }

  async function handleChip(chip) {
    const userLine = chip.label;
    if (brainOnline && resolveApiUrl()) {
      await widget.sendMessage(userLine);
      return;
    }
    widget.append('user', userLine);
    widget.append('agent', STATIC_GUIDE[chip.id] ?? 'Sin guía para esto aún.');
  }

  const adv = document.getElementById('onboarding-chat-advanced');
  adv?.addEventListener('toggle', () => {
    if (adv.open && !host.querySelector('.chat-api-row')) {
      const row = document.createElement('div');
      row.className = 'chat-api-row';
      row.style.marginTop = '0.5rem';
      const input = document.createElement('input');
      input.type = 'url';
      input.className = 'chat-input';
      input.placeholder = 'http://127.0.0.1:8787';
      input.value = resolveApiUrl();
      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'btn btn-secondary';
      save.textContent = 'Conectar cerebro';
      save.addEventListener('click', () => {
        const v = input.value.trim().replace(/\/$/, '');
        if (v) localStorage.setItem('agenft-api-url', v);
        widget.probe();
      });
      row.append(input, save);
      host.insertBefore(row, host.querySelector('.chat-log'));
    }
  });
}
