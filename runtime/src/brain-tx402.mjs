/** Cerebro vía tx402.ai — probe (402) o inferencia pagada (--pay). */
export async function inferBrain({ brain, systemPrompt, userMessage, pay = false, privateKey }) {
  const body = {
    model: brain.primary.model ?? 'minimax/minimax-m3',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 256,
  };

  if (!pay) {
    return probeBrain(brain.primary.endpoint, body);
  }

  if (!privateKey) {
    throw new Error('Pago requiere VALIDATION_PRIVATE_KEY o AGENFT_PAYER_PRIVATE_KEY');
  }

  return paidBrain(brain.primary.endpoint, body, privateKey);
}

async function probeBrain(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const paymentHeader = res.headers.get('payment-required');
  let payment = null;
  if (paymentHeader) {
    try {
      payment = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf8'));
    } catch {
      payment = { raw: paymentHeader.slice(0, 80) };
    }
  }

  if (res.status === 402) {
    const networks = payment?.accepts?.map((a) => a.network).join(', ') ?? 'n/a';
    return {
      mode: 'probe',
      ok: true,
      status: 402,
      message: `[probe] tx402 listo — pago requerido (networks: ${networks}). Usa --pay con wallet USDC Base mainnet.`,
      payment,
      content: null,
    };
  }

  if (res.ok) {
    const json = await res.json();
    return {
      mode: 'probe',
      ok: true,
      status: res.status,
      message: null,
      content: json.choices?.[0]?.message?.content ?? JSON.stringify(json).slice(0, 200),
    };
  }

  const text = await res.text();
  return {
    mode: 'probe',
    ok: false,
    status: res.status,
    message: text.slice(0, 300),
    content: null,
  };
}

async function paidBrain(endpoint, body, privateKey) {
  const { wrapFetchWithPayment, x402Client } = await import('@x402/fetch');
  const { ExactEvmScheme } = await import('@x402/evm/exact/client');
  const { createWalletClient, http, publicActions } = await import('viem');
  const { privateKeyToAccount } = await import('viem/accounts');
  const { base } = await import('viem/chains');
  const { checkPayerBalanceUsdc } = await import('./budget-tracker.mjs');

  const account = privateKeyToAccount(privateKey);
  const before = await checkPayerBalanceUsdc(account.address);

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

  const res = await fetchPaid(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? null;

  let costUsdMicro = 0;
  if (res.ok) {
    const after = await checkPayerBalanceUsdc(account.address);
    costUsdMicro = Math.max(0, before.usdMicro - after.usdMicro);
  }

  return {
    mode: 'paid',
    ok: res.ok,
    status: res.status,
    payer: account.address,
    content,
    costUsdMicro,
    costUsd: costUsdMicro / 1_000_000,
    raw: res.ok ? undefined : JSON.stringify(json).slice(0, 300),
  };
}
