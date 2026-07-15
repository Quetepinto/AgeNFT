import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { privateKeyToAccount } from 'viem/accounts';

export function loadPayerKey() {
  if (process.env.VALIDATION_PRIVATE_KEY) return process.env.VALIDATION_PRIVATE_KEY;
  if (process.env.AGENFT_PAYER_PRIVATE_KEY) return process.env.AGENFT_PAYER_PRIVATE_KEY;
  const cred = join(homedir(), '.credentials/agenft-base-sepolia.json');
  if (existsSync(cred)) {
    try {
      return JSON.parse(readFileSync(cred, 'utf8')).privateKey;
    } catch {
      return null;
    }
  }
  return null;
}

export function loadPayerAccount() {
  const pk = loadPayerKey();
  return pk ? privateKeyToAccount(pk) : null;
}
