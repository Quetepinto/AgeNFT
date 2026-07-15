#!/usr/bin/env node
/**
 * Spike head-to-head: three x402 payment paths on tx402.ai
 * A) ageNFT run-once (@x402/fetch + viem) — production path
 * B) agentwallet-sdk createX402Fetch — needs AgentAccountV2 (likely skip if no contract)
 * C) Hermes path documented only (requires upgrade + awal skill)
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const REPO = join(import.meta.dirname, '../..');
const cred = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
);
const pk = cred.privateKey;
const account = privateKeyToAccount(pk);

const body = JSON.stringify({
  model: 'minimax/minimax-m3',
  messages: [{ role: 'user', content: 'Responde una palabra: spike' }],
  max_tokens: 8,
});
const endpoint = 'https://tx402.ai/v1/chat/completions';

async function pathA_agenftX402() {
  const { wrapFetchWithPayment, x402Client } = await import('@x402/fetch');
  const { ExactEvmScheme } = await import('@x402/evm/exact/client');
  const client = createWalletClient({ account, chain: base, transport: http() }).extend(publicActions);
  const scheme = new ExactEvmScheme({
    address: account.address,
    signTypedData: (a) => client.signTypedData(a),
    readContract: client.readContract,
  });
  const x402 = new x402Client().register('eip155:8453', scheme);
  const fetchPaid = wrapFetchWithPayment(fetch, x402);
  const before = await fetchUSDC(account.address);
  const res = await fetchPaid(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    signal: AbortSignal.timeout(90000),
  });
  const json = await res.json();
  const after = await fetchUSDC(account.address);
  return {
    path: 'A: @x402/fetch (ageNFT run-once)',
    ok: res.ok,
    status: res.status,
    content: json.choices?.[0]?.message?.content ?? null,
    costUsd: (before - after) / 1_000_000,
    payer: account.address,
  };
}

async function pathB_agentWalletSdk() {
  try {
    const { createX402Fetch, createWallet } = await import('agentwallet-sdk');
    const client = createWalletClient({ account, chain: base, transport: http() }).extend(publicActions);
    // AgentAccountV2 required — lab EOA has no contract; expect failure
    const wallet = createWallet({
      accountAddress: account.address,
      chain: 'base',
      walletClient: client,
    });
    const x402Fetch = createX402Fetch(wallet);
    const res = await x402Fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const json = await res.json();
    return { path: 'B: agentwallet-sdk', ok: res.ok, status: res.status, content: json.choices?.[0]?.message?.content };
  } catch (e) {
    return {
      path: 'B: agentwallet-sdk',
      ok: false,
      blocked: true,
      reason: 'Requires AgentAccountV2 contract — not plain EOA/TBA',
      error: String(e.message ?? e).slice(0, 200),
    };
  }
}

async function pathC_runOnceCli() {
  try {
    const out = execSync('npm run once:pay', {
      cwd: join(REPO, 'runtime'),
      encoding: 'utf8',
      timeout: 120000,
      env: { ...process.env, AGENFT_USER_MESSAGE: 'Responde una palabra: spike-cli' },
    });
    const cost = out.match(/Cost USD: ([0-9.]+)/)?.[1];
    const assistant = out.match(/Assistant: (.+)/)?.[1];
    return { path: 'C: ageNFT run-once CLI', ok: true, costUsd: cost, content: assistant?.slice(0, 80) };
  } catch (e) {
    return { path: 'C: ageNFT run-once CLI', ok: false, error: String(e.message ?? e).slice(0, 300) };
  }
}

async function fetchUSDC(addr) {
  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const data = `0x70a08231${addr.slice(2).toLowerCase().padStart(64, '0')}`;
  const res = await fetch('https://mainnet.base.org', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: USDC, data }, 'latest'],
      id: 1,
    }),
  });
  const json = await res.json();
  return Number(BigInt(json.result ?? '0x0'));
}

async function inspectElizaPlugin() {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const plugin = require('elizaos-plugin-agentwallet');
  return {
    name: plugin.name ?? plugin.default?.name,
    actions: (plugin.actions ?? plugin.default?.actions ?? []).map((a) => a.name),
    requiresAgentAccountV2: true,
    note: 'AGENTWALLET_ACCOUNT_ADDRESS = AgentAccountV2, not ERC-6551 TBA direct',
  };
}

console.log('=== spike: x402 head-to-head ===');
console.log('payer:', account.address);

const eliza = await inspectElizaPlugin();
console.log('eliza plugin:', eliza);

const results = [];
results.push(await pathA_agenftX402());
results.push(await pathB_agentWalletSdk());
if (process.argv.includes('--full')) {
  results.push(await pathC_runOnceCli());
}

console.log('\n--- results ---');
for (const r of results) {
  console.log(JSON.stringify(r, null, 2));
}

import { writeFileSync, mkdirSync } from 'node:fs';
const out = join(REPO, 'docs/research/lab/spike-x402-headtohead.json');
mkdirSync(join(REPO, 'docs/research/lab'), { recursive: true });
writeFileSync(out, `${JSON.stringify({ at: new Date().toISOString(), eliza, results }, null, 2)}\n`);
console.log('\nReport:', out);
