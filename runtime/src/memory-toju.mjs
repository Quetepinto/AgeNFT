import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { privateKeyToAccount } from 'viem/accounts';
import { checkPayerBalanceUsdc } from './budget-tracker.mjs';

const TOJU_API = 'https://api.toju.network';
const POINTER_FILE = 'memory/remote-pointer.json';
const LAB_CAPSULE = 'memory-remote/capsule.json';
const IPFS_GATEWAYS = [
  (cid) => `https://${cid}.ipfs.dweb.link`,
  (cid) => `https://ipfs.io/ipfs/${cid}`,
  (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
];

export function pointerPath(dataDir) {
  return join(dataDir, POINTER_FILE);
}

export function loadPointer(dataDir) {
  const path = pointerPath(dataDir);
  if (!existsSync(path)) {
    const legacy = join(dataDir, 'memory/toju-pointer.json');
    if (existsSync(legacy)) return JSON.parse(readFileSync(legacy, 'utf8'));
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function savePointer(dataDir, pointer) {
  const path = pointerPath(dataDir);
  mkdirSync(join(dataDir, 'memory'), { recursive: true });
  writeFileSync(path, `${JSON.stringify({ ...pointer, updatedAt: new Date().toISOString() }, null, 2)}\n`);
  return path;
}

export function parseMemoryUri(uri) {
  if (!uri || typeof uri !== 'string') return null;
  if (uri.startsWith('toju://')) {
    const [, rest] = uri.split('toju://');
    const [network, cid] = rest.split('/');
    return { provider: 'toju', network, cid };
  }
  if (uri.startsWith('ipfs://')) {
    return { provider: 'ipfs', cid: uri.slice('ipfs://'.length) };
  }
  if (uri.startsWith('lab-remote://')) {
    return { provider: 'lab-remote', path: uri.slice('lab-remote://'.length) };
  }
  return null;
}

export function buildCapsule({ manifest, dataDir }) {
  const latestPath = join(dataDir, 'memory/latest.json');
  if (!existsSync(latestPath)) {
    throw new Error(`No local memory at ${latestPath} — run npm run once first`);
  }
  const latest = JSON.parse(readFileSync(latestPath, 'utf8'));
  const deltasDir = join(dataDir, 'memory/deltas');
  let recentDeltas = [];
  if (existsSync(deltasDir)) {
    recentDeltas = readdirSync(deltasDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .slice(-5)
      .map((f) => JSON.parse(readFileSync(join(deltasDir, f), 'utf8')));
  }
  return {
    type: 'agenft-memory-capsule/v1',
    agent: manifest.name,
    agentId: manifest.identity?.agentId ?? null,
    packagedAt: new Date().toISOString(),
    latest,
    recentDeltas,
  };
}

async function createPaidX402(privateKey) {
  const { x402Client, x402HTTPClient } = await import('@x402/fetch');
  const { ExactEvmScheme } = await import('@x402/evm/exact/client');
  const { createWalletClient, http, publicActions } = await import('viem');
  const { base } = await import('viem/chains');

  const account = privateKeyToAccount(privateKey);
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
  const httpClient = new x402HTTPClient(x402);
  return { httpClient, x402, account };
}

/** Multipart no se puede clonar en retry x402 — reconstruir FormData. */
async function uploadFileToToju({ fileName, body, durationDays, privateKey }) {
  const { httpClient, x402, account } = await createPaidX402(privateKey);

  const post = async (withPayment) => {
    const file = new File([body], fileName, { type: 'application/json' });
    const form = new FormData();
    form.append('file', file);
    const url = `${TOJU_API}/upload/agent?size=${file.size}&duration=${durationDays}`;
    return fetch(url, {
      method: 'POST',
      body: form,
      headers: withPayment ?? {},
      signal: AbortSignal.timeout(90000),
    });
  };

  const first = await post();
  if (first.ok) return { stored: await first.json(), account };

  if (first.status !== 402) {
    const err = await first.text();
    throw new Error(`toju upload HTTP ${first.status}: ${err.slice(0, 300)}`);
  }

  const getHeader = (name) => first.headers.get(name);
  let paymentBody;
  try {
    paymentBody = JSON.parse(await first.text());
  } catch {
    paymentBody = undefined;
  }
  const paymentRequired = httpClient.getPaymentRequiredResponse(getHeader, paymentBody);
  const paymentPayload = await x402.createPaymentPayload(paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

  const paid = await post(paymentHeaders);
  if (!paid.ok) {
    const err = await paid.text();
    throw new Error(`toju upload paid HTTP ${paid.status}: ${err.slice(0, 300)}`);
  }

  await httpClient.processPaymentResult(
    paymentPayload,
    (name) => paid.headers.get(name),
    paid.status,
  );

  return { stored: await paid.json(), account };
}

export function syncCapsuleToLabRemote({ manifest, dataDir, capsule }) {
  const cap = capsule ?? buildCapsule({ manifest, dataDir });
  const capsulePath = join(dataDir, LAB_CAPSULE);
  mkdirSync(join(dataDir, 'memory-remote'), { recursive: true });
  writeFileSync(capsulePath, `${JSON.stringify(cap, null, 2)}\n`);

  const pointer = {
    provider: 'lab-remote',
    uri: `lab-remote://${LAB_CAPSULE}`,
    capsulePath: LAB_CAPSULE,
    experientialHash: cap.latest.experientialHash ?? null,
    deltaCount: cap.latest.deltaCount ?? 0,
    costUsd: 0,
  };
  const path = savePointer(dataDir, pointer);
  return { pointer, path, costUsdMicro: 0, capsule: cap, fallback: true };
}

export async function uploadCapsuleToToju({ manifest, dataDir, privateKey, durationDays = 7 }) {
  const capsule = buildCapsule({ manifest, dataDir });
  const body = JSON.stringify(capsule, null, 2);
  const fileName = `${manifest.name.toLowerCase().replace(/\s+/g, '-')}-memory.json`;

  const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const before = await checkPayerBalanceUsdc(privateKeyToAccount(pk).address);

  const { stored, account } = await uploadFileToToju({
    fileName,
    body,
    durationDays,
    privateKey: pk,
  });

  const after = await checkPayerBalanceUsdc(account.address);
  const costUsdMicro = Math.max(0, before.usdMicro - after.usdMicro);

  const pointer = {
    provider: 'toju',
    network: 'mainnet',
    cid: stored.cid,
    uri: `toju://mainnet/${stored.cid}`,
    ipfsUri: `ipfs://${stored.cid}`,
    expiresAt: stored.expiresAt ?? null,
    fileName: stored.fileName ?? fileName,
    fileSize: stored.fileSize ?? body.length,
    experientialHash: capsule.latest.experientialHash ?? null,
    deltaCount: capsule.latest.deltaCount ?? 0,
    costUsd: costUsdMicro / 1_000_000,
  };

  const path = savePointer(dataDir, pointer);
  return { pointer, path, costUsdMicro, capsule, fallback: false };
}

/**
 * Sync memoria offchain. `auto` intenta toju; si falla → lab-remote (sin coste).
 */
export async function syncMemoryRemote({
  manifest,
  dataDir,
  privateKey,
  durationDays = 7,
  provider = 'auto',
}) {
  if (provider === 'lab-remote') {
    return syncCapsuleToLabRemote({ manifest, dataDir });
  }

  if (provider === 'toju') {
    if (!privateKey) throw new Error('toju sync requires payer private key');
    return uploadCapsuleToToju({ manifest, dataDir, privateKey, durationDays });
  }

  // auto
  if (!privateKey) return syncCapsuleToLabRemote({ manifest, dataDir });
  try {
    return await uploadCapsuleToToju({ manifest, dataDir, privateKey, durationDays });
  } catch (e) {
    console.warn('⚠️  toju upload failed — lab-remote fallback:', e.message);
    return syncCapsuleToLabRemote({ manifest, dataDir });
  }
}

export async function fetchCapsuleFromCid(cid, { timeoutMs = 30000 } = {}) {
  let lastErr;
  for (const urlOf of IPFS_GATEWAYS) {
    const url = urlOf(cid);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        lastErr = new Error(`${url} → HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      if (json?.type !== 'agenft-memory-capsule/v1' || !json.latest) {
        throw new Error('Invalid capsule format');
      }
      return { capsule: json, url };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`Could not fetch CID ${cid}`);
}

function writeLatestFromCapsule(dataDir, capsule) {
  const latestPath = join(dataDir, 'memory/latest.json');
  mkdirSync(join(dataDir, 'memory'), { recursive: true });
  writeFileSync(latestPath, `${JSON.stringify(capsule.latest, null, 2)}\n`);
  return latestPath;
}

export async function hydrateLocalFromPointer({ dataDir, pointer }) {
  if (pointer?.provider === 'lab-remote') {
    const rel = pointer.capsulePath ?? LAB_CAPSULE;
    const capsulePath = join(dataDir, rel);
    if (!existsSync(capsulePath)) {
      throw new Error(`lab-remote capsule missing: ${capsulePath}`);
    }
    const capsule = JSON.parse(readFileSync(capsulePath, 'utf8'));
    const latestPath = writeLatestFromCapsule(dataDir, capsule);
    return {
      latestPath,
      capsule,
      fetchedFrom: `lab-remote:${rel}`,
      experientialHash: capsule.latest.experientialHash,
      l0Summary: capsule.latest.l0Summary,
    };
  }

  const cid = pointer?.cid ?? parseMemoryUri(pointer?.uri)?.cid;
  if (!cid) throw new Error('Pointer missing cid');

  const { capsule, url } = await fetchCapsuleFromCid(cid);
  const latestPath = writeLatestFromCapsule(dataDir, capsule);

  return {
    latestPath,
    capsule,
    fetchedFrom: url,
    experientialHash: capsule.latest.experientialHash,
    l0Summary: capsule.latest.l0Summary,
  };
}

export function resolveRemotePointer(manifest, dataDir) {
  const local = loadPointer(dataDir);
  if (local) return local;

  const primary = manifest.organs?.memory?.operational?.primary;
  const parsed = parseMemoryUri(primary);
  if (parsed?.cid) {
    return {
      provider: parsed.provider ?? 'toju',
      network: parsed.network ?? 'mainnet',
      cid: parsed.cid,
      uri: primary,
    };
  }
  if (parsed?.provider === 'lab-remote') {
    return { provider: 'lab-remote', uri: primary, capsulePath: parsed.path };
  }
  return null;
}
