/**
 * Cerebro “manguera” (hose) — OpenAI-compatible, sin x402.
 * Para lab: OmniRoute, Ollama, OpenRouter con key del owner.
 *
 * Env:
 *   AGENFT_HOSE_ENDPOINT  default http://127.0.0.1:20128
 *   AGENFT_HOSE_MODEL     default auto/best-free
 *   AGENFT_HOSE_API_KEY   default omniroute
 */
const HOSE_ENDPOINT = (process.env.AGENFT_HOSE_ENDPOINT ?? 'http://127.0.0.1:20128').replace(
  /\/$/,
  '',
);
const HOSE_MODEL = process.env.AGENFT_HOSE_MODEL ?? 'auto/best-free';
const HOSE_API_KEY = process.env.AGENFT_HOSE_API_KEY ?? 'omniroute';

function chatUrl(endpoint) {
  if (endpoint.endsWith('/v1')) return `${endpoint}/chat/completions`;
  if (endpoint.endsWith('/v1/chat/completions')) return endpoint;
  return `${endpoint}/v1/chat/completions`;
}

/** @param {{ systemPrompt: string, userMessage: string, endpoint?: string, model?: string, apiKey?: string }} opts */
export async function inferHoseBrain({
  systemPrompt,
  userMessage,
  endpoint = HOSE_ENDPOINT,
  model = HOSE_MODEL,
  apiKey = HOSE_API_KEY,
}) {
  const url = chatUrl(endpoint);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
      costUsdMicro: 0,
    };
  }

  const content = json.choices?.[0]?.message?.content ?? null;
  return {
    mode: 'hose',
    ok: res.ok && Boolean(content),
    status: res.status,
    endpoint,
    model,
    payer: null,
    payerMode: 'hose',
    content,
    costUsdMicro: 0,
    message: res.ok ? null : (json.error?.message ?? text.slice(0, 200)),
  };
}

export function hoseConfigFromEnv() {
  return {
    endpoint: HOSE_ENDPOINT,
    model: HOSE_MODEL,
    apiKey: HOSE_API_KEY,
  };
}
