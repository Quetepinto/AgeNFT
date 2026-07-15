#!/usr/bin/env node
/**
 * ageNFT Fase 0 — probes de servicios (no producto).
 * Uso: node probe-services.mjs [--quick] [--pay]
 */

import { writeFileSync } from 'node:fs';

const quick = process.argv.includes('--quick');
const withPay = process.argv.includes('--pay');
const pk = process.env.VALIDATION_PRIVATE_KEY;

const results = [];

function log(msg) {
  console.log(msg);
}

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  log(`${ok ? '✅' : '❌'} ${name}: ${detail}`);
}

async function fetchProbe(name, url, init = {}) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
    return { name, ok: true, status: res.status, headers: Object.fromEntries(res.headers) };
  } catch (e) {
    return { name, ok: false, error: String(e.message || e) };
  }
}

function decodePaymentHeader(headers) {
  const raw = headers.get?.('payment-required') ?? headers['payment-required'];
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return { raw: String(raw).slice(0, 120) };
  }
}

async function probeBaseSepolia() {
  const res = await fetch('https://sepolia.base.org', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  const chainId = parseInt(json.result, 16);
  record('Base Sepolia RPC', chainId === 84532, `chainId=${chainId}`);
}

async function probeTx402() {
  const res = await fetch('https://tx402.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'minimax/minimax-m3',
      messages: [{ role: 'user', content: 'ping' }],
    }),
    signal: AbortSignal.timeout(20000),
  });
  const payment = decodePaymentHeader(res.headers);
  const networks = payment?.accepts?.map((a) => a.network).join(', ') ?? 'n/a';
  record(
    'tx402.ai chat 402',
    res.status === 402,
    `status=${res.status} networks=[${networks}]`
  );

  const models = await fetch('https://tx402.ai/v1/models', { signal: AbortSignal.timeout(15000) });
  const modelsJson = await models.json();
  record('tx402.ai models', models.ok, `count=${modelsJson.data?.length ?? 0}`);
}

async function probeToju() {
  const health = await fetchProbe('toju health', 'https://api.toju.network/health');
  record('toju mainnet health', health.ok && health.status === 200, health.error ?? `HTTP ${health.status}`);

  const quote = await fetch(
    'https://api.toju.network/pricing/quote?size=1000&duration=7&chain=base',
    { signal: AbortSignal.timeout(15000) }
  );
  const quoteJson = await quote.json();
  record(
    'toju pricing quote',
    quote.ok && quoteJson.success,
    `totalCost=${quoteJson.quote?.totalCost ?? '?'} (units per API)`
  );

  const blob = new Blob(['ageNFT validation probe'], { type: 'text/plain' });
  const form = new FormData();
  form.append('file', blob, 'probe.txt');
  const upload = await fetch('https://api.toju.network/upload/agent?size=32&duration=7', {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(20000),
  });
  const pay = decodePaymentHeader(upload.headers);
  record(
    'toju upload 402',
    upload.status === 402,
    `status=${upload.status} network=${pay?.accepts?.[0]?.network ?? 'n/a'}`
  );

  if (!quick) {
    try {
      const staging = await fetch('https://staging-api.toju.network/health', {
        signal: AbortSignal.timeout(8000),
      });
      record('toju staging health', staging.ok, `HTTP ${staging.status}`);
    } catch (e) {
      record('toju staging health', false, String(e.message || e));
    }
  }
}

async function probeAgentVims() {
  const res = await fetch('https://agent.vims.com', { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  const hasMint = /mint|sovereign|ERC-6551/i.test(text);
  record('agent.vims.com', res.ok && hasMint, `HTTP ${res.status}`);
}

async function probePaidFlows() {
  if (!withPay || !pk) {
    log('\n⏭️  --pay omitido (export VALIDATION_PRIVATE_KEY=0x...)');
    return;
  }

  const { createAgentClient } = await import('@toju.network/x402');
  const { wrapFetchWithPayment, x402Client } = await import('@x402/fetch');
  const { ExactEvmScheme } = await import('@x402/evm/exact/client');
  const { createWalletClient, http, publicActions } = await import('viem');
  const { privateKeyToAccount } = await import('viem/accounts');
  const { base } = await import('viem/chains');

  const account = privateKeyToAccount(pk);
  log(`\n💳 Wallet prueba: ${account.address}`);

  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  }).extend(publicActions);

  const scheme = new ExactEvmScheme({
    address: account.address,
    signTypedData: (args) => client.signTypedData(args),
    readContract: client.readContract,
  });
  const x402 = new x402Client().register('eip155:8453', scheme);
  const fetchPaid = wrapFetchWithPayment(fetch, x402);

  try {
    const res = await fetchPaid('https://tx402.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'minimax/minimax-m3',
        messages: [{ role: 'user', content: 'Responde solo: pong' }],
        max_tokens: 16,
      }),
      signal: AbortSignal.timeout(60000),
    });
    const body = await res.json();
    const content = body.choices?.[0]?.message?.content ?? JSON.stringify(body).slice(0, 80);
    record('tx402.ai inferencia pagada', res.ok, `status=${res.status} reply=${content}`);
  } catch (e) {
    record('tx402.ai inferencia pagada', false, String(e.message || e));
  }

  try {
    const toju = createAgentClient({ privateKey: pk, environment: 'mainnet' });
    const file = new File(['ageNFT toju probe'], 'probe.txt', { type: 'text/plain' });
    const stored = await toju.store(file, { durationDays: 7 });
    record('toju upload pagado', Boolean(stored.cid), `cid=${stored.cid ?? '?'}`);
  } catch (e) {
    record('toju upload pagado', false, String(e.message || e));
  }
}

async function main() {
  log('ageNFT validation probes\n');
  await probeBaseSepolia();
  await probeTx402();
  await probeToju();
  await probeAgentVims();
  await probePaidFlows();

  const out = {
    at: new Date().toISOString(),
    quick,
    withPay: Boolean(withPay && pk),
    results,
  };
  writeFileSync('../../docs/research/validation-results.latest.json', JSON.stringify(out, null, 2));
  log('\n📄 JSON: docs/research/validation-results.latest.json');

  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
