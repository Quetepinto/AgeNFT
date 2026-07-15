#!/usr/bin/env node
/**
 * Spike: Eliza agentwallet-sdk x402 vs ageNFT run-once x402.
 * Uses lab wallet from ~/.credentials/agenft-base-sepolia.json
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { createX402Fetch, createX402Client } from 'agentwallet-sdk';

const cred = JSON.parse(
  readFileSync(join(homedir(), '.credentials/agenft-base-sepolia.json'), 'utf8'),
);
const account = privateKeyToAccount(cred.privateKey);
const client = createWalletClient({
  account,
  chain: base,
  transport: http(),
}).extend(publicActions);

const TX402_ENDPOINT = 'https://tx402.ai/v1/chat/completions';
const body = JSON.stringify({
  model: 'minimax/minimax-m3',
  messages: [{ role: 'user', content: 'Responde solo: spike-eliza' }],
  max_tokens: 8,
});

async function probe402() {
  const res = await fetch(TX402_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
  const paymentHeader = res.headers.get('payment-required');
  return {
    status: res.status,
    hasPaymentHeader: Boolean(paymentHeader),
    networks: paymentHeader
      ? (() => {
          try {
            return JSON.parse(Buffer.from(paymentHeader, 'base64').toString()).accepts?.map(
              (a) => a.network,
            );
          } catch {
            return null;
          }
        })()
      : null,
  };
}

async function testAgentWalletX402Fetch() {
  try {
    const x402Fetch = createX402Fetch({
      walletClient: client,
      address: account.address,
    });
    const res = await x402Fetch(TX402_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(90000),
    });
    const json = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      content: json.choices?.[0]?.message?.content ?? null,
      error: res.ok ? null : JSON.stringify(json).slice(0, 200),
    };
  } catch (e) {
    return { ok: false, error: String(e.message ?? e) };
  }
}

async function testAgentWalletX402Client() {
  try {
    const x402 = createX402Client({
      walletClient: client,
      address: account.address,
    });
    const res = await x402.fetch(TX402_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(90000),
    });
    const json = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      content: json.choices?.[0]?.message?.content ?? null,
    };
  } catch (e) {
    return { ok: false, error: String(e.message ?? e) };
  }
}

async function inspectPlugin() {
  const { default: plugin } = await import('elizaos-plugin-agentwallet');
  return {
    name: plugin.name,
    actions: plugin.actions?.map((a) => a.name) ?? [],
    providers: plugin.providers?.length ?? 0,
  };
}

async function inspectErc8004() {
  try {
    const mod = await import('agentwallet-sdk');
    const has8004 = Boolean(mod.IdentityRegistry || mod.registerAgent);
    return { exported: Object.keys(mod).filter((k) => /8004|6551|identity/i.test(k)), has8004 };
  } catch (e) {
    return { error: String(e.message ?? e) };
  }
}

console.log('=== spike: Eliza agentwallet-sdk ===');
console.log('payer:', account.address);

const probe = await probe402();
console.log('probe402:', probe);

const plugin = await inspectPlugin();
console.log('elizaos-plugin-agentwallet:', plugin);

const erc8004 = await inspectErc8004();
console.log('erc8004 exports:', erc8004);

const pay = process.argv.includes('--pay');
if (pay) {
  console.log('\n--- paid tests (USDC) ---');
  const fetchResult = await testAgentWalletX402Fetch();
  console.log('createX402Fetch:', fetchResult);
  const clientResult = await testAgentWalletX402Client();
  console.log('createX402Client:', clientResult);
} else {
  console.log('\n(skip paid — pass --pay to spend USDC)');
}
