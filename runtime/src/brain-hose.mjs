/**
 * Cerebro “manguera” (hose) — OpenAI-compatible, sin x402.
 *
 * Esquema: **LLM router** = endpoint OpenAI-compatible que agrega modelos
 * (FreeLLMAPI, OmniRoute, OpenRouter directo, Ollama, custom del owner).
 *
 * Env (prioridad alta → baja):
 *   AGENFT_HOSE_ENDPOINT / AGENFT_HOSE_MODEL / AGENFT_HOSE_API_KEY  (override total)
 *   AGENFT_HOSE_PRESET   freellmapi | omniroute | openrouter | ollama | custom
 *   AGENFT_HOSE_API_KEY_FILE  ruta a un fichero con la key (opcional)
 *
 * Defaults lab (2026-09): FreeLLMAPI en :3001, model `auto`.
 */
import { readFileSync, existsSync } from 'node:fs';

/** @typedef {'freellmapi' | 'omniroute' | 'openrouter' | 'ollama' | 'custom'} HosePreset */

/** @type {Record<HosePreset, { endpoint: string, model: string, apiKeyHint: string }>} */
export const LLM_ROUTER_PRESETS = {
  freellmapi: {
    endpoint: 'http://127.0.0.1:3001',
    model: 'auto',
    apiKeyHint: 'FREELLMAPI_API_KEY o HERMES_CUSTOM_FREELLMAPI_API_KEY',
  },
  omniroute: {
    endpoint: 'http://127.0.0.1:20128',
    model: 'auto/best-free',
    apiKeyHint: 'HERMES_CUSTOM_OMNIROUTE_API_KEY',
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api',
    model: 'openrouter/auto',
    apiKeyHint: 'OPENROUTER_API_KEY',
  },
  ollama: {
    endpoint: 'http://127.0.0.1:11434',
    model: 'qwen2.5:3b',
    apiKeyHint: 'ollama (cualquier Bearer; Ollama suele ignorarlo)',
  },
  custom: {
    endpoint: 'http://127.0.0.1:3001',
    model: 'auto',
    apiKeyHint: 'AGENFT_HOSE_API_KEY',
  },
};

const DEFAULT_PRESET = /** @type {HosePreset} */ (
  process.env.AGENFT_HOSE_PRESET ?? 'freellmapi'
);

function readKeyFile(path) {
  if (!path || !existsSync(path)) return null;
  return readFileSync(path, 'utf8').trim().split(/\r?\n/)[0]?.trim() || null;
}

function resolveApiKey(explicit) {
  if (explicit) return explicit;
  if (process.env.AGENFT_HOSE_API_KEY) return process.env.AGENFT_HOSE_API_KEY;
  const fromFile = readKeyFile(process.env.AGENFT_HOSE_API_KEY_FILE);
  if (fromFile) return fromFile;
  // Fallbacks comunes en el VPS (sin imprimir)
  for (const k of [
    'HERMES_CUSTOM_FREELLMAPI_API_KEY',
    'FREELLMAPI_API_KEY',
    'HERMES_CUSTOM_OMNIROUTE_API_KEY',
    'OPENROUTER_API_KEY',
  ]) {
    if (process.env[k]) return process.env[k];
  }
  return 'hose';
}

/**
 * @param {{ preset?: string, endpoint?: string, model?: string, apiKey?: string, apiKeyEnv?: string } | null | undefined} fromManifest
 */
export function resolveHoseConfig(fromManifest) {
  const presetName = /** @type {HosePreset} */ (
    process.env.AGENFT_HOSE_PRESET ||
      fromManifest?.preset ||
      DEFAULT_PRESET
  );
  const preset = LLM_ROUTER_PRESETS[presetName] ?? LLM_ROUTER_PRESETS.freellmapi;

  let apiKey = process.env.AGENFT_HOSE_API_KEY || fromManifest?.apiKey || null;
  if (!apiKey && fromManifest?.apiKeyEnv && process.env[fromManifest.apiKeyEnv]) {
    apiKey = process.env[fromManifest.apiKeyEnv];
  }
  apiKey = resolveApiKey(apiKey);

  const endpoint = (
    process.env.AGENFT_HOSE_ENDPOINT ||
    fromManifest?.endpoint ||
    preset.endpoint
  ).replace(/\/$/, '');

  const model =
    process.env.AGENFT_HOSE_MODEL || fromManifest?.model || preset.model;

  return {
    preset: presetName in LLM_ROUTER_PRESETS ? presetName : 'freellmapi',
    endpoint,
    model,
    apiKey,
  };
}

/** @deprecated prefer resolveHoseConfig — mantiene nombre histórico */
export function hoseConfigFromEnv() {
  return resolveHoseConfig(null);
}

function chatUrl(endpoint) {
  if (endpoint.endsWith('/v1')) return `${endpoint}/chat/completions`;
  if (endpoint.endsWith('/v1/chat/completions')) return endpoint;
  return `${endpoint}/v1/chat/completions`;
}

/** @param {{ systemPrompt: string, userMessage: string, endpoint?: string, model?: string, apiKey?: string, preset?: string }} opts */
export async function inferHoseBrain({
  systemPrompt,
  userMessage,
  endpoint,
  model,
  apiKey,
  preset,
}) {
  const resolved = resolveHoseConfig(
    endpoint || model || apiKey || preset
      ? { endpoint, model, apiKey, preset }
      : null,
  );
  const url = chatUrl(resolved.endpoint);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${resolved.apiKey}`,
    },
    body: JSON.stringify({
      model: resolved.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 512,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      mode: 'hose',
      ok: false,
      status: res.status,
      message: text.slice(0, 300),
      content: null,
      llmRouter: resolved,
    };
  }

  const content = json.choices?.[0]?.message?.content ?? null;
  return {
    mode: 'hose',
    ok: res.ok && Boolean(content),
    status: res.status,
    endpoint: resolved.endpoint,
    model: resolved.model,
    preset: resolved.preset,
    payer: null,
    payerMode: 'hose',
    content,
    costUsdMicro: 0,
    message: res.ok ? null : (json.error?.message ?? text.slice(0, 200)),
    llmRouter: resolved,
  };
}
