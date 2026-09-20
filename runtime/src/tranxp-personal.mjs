/**
 * Datos personales TRNXP (capa M2) — NO viajan con el NFT al vender.
 * Vault 0 / PII del owner: favoritos de paradas, ciudad elegida por chat.
 *
 * Archivo: runtime/data/tranxp/personal-store.json (gitignored vía data/)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_DIR = join(__dirname, '../data/tranxp');
const STORE_FILE = join(STORE_DIR, 'personal-store.json');

/**
 * @typedef {{ label: string, network: string, stop: string, line?: string, packId: string }} PersonalFav
 * @typedef {{ packId?: string, favorites: PersonalFav[], updatedAt?: string }} PersonalUser
 */

function emptyStore() {
  return {
    type: 'agenft-tranxp-personal/v1',
    layer: 'M2-personal',
    transfer: 'never-with-nft',
    note: 'Favoritos y ciudad por usuario. No incluir en cápsula de venta salvo política full explícita.',
    users: {},
  };
}

export function loadPersonalStore() {
  try {
    if (!existsSync(STORE_FILE)) return emptyStore();
    const raw = JSON.parse(readFileSync(STORE_FILE, 'utf8'));
    if (!raw.users) raw.users = {};
    return raw;
  } catch {
    return emptyStore();
  }
}

function saveStore(store) {
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2) + '\n');
}

/** @param {string} chatKey ej. telegram:123 o matrix:!room */
export function getPersonalUser(chatKey) {
  const store = loadPersonalStore();
  return store.users[chatKey] || { favorites: [] };
}

export function setPersonalPack(chatKey, packId) {
  const store = loadPersonalStore();
  const u = store.users[chatKey] || { favorites: [] };
  u.packId = packId || undefined;
  u.updatedAt = new Date().toISOString();
  store.users[chatKey] = u;
  saveStore(store);
  return u;
}

export function clearPersonalPack(chatKey) {
  return setPersonalPack(chatKey, '');
}

/**
 * @param {string} chatKey
 * @param {PersonalFav} fav
 */
export function addPersonalFavorite(chatKey, fav) {
  const store = loadPersonalStore();
  const u = store.users[chatKey] || { favorites: [] };
  const label = String(fav.label || '').trim().toLowerCase();
  if (!label) throw new Error('Falta etiqueta del favorito');
  u.favorites = (u.favorites || []).filter((f) => f.label.toLowerCase() !== label);
  u.favorites.push({
    label,
    network: fav.network,
    stop: fav.stop,
    line: fav.line,
    packId: fav.packId,
  });
  u.updatedAt = new Date().toISOString();
  store.users[chatKey] = u;
  saveStore(store);
  return u.favorites;
}

export function removePersonalFavorite(chatKey, label) {
  const store = loadPersonalStore();
  const u = store.users[chatKey] || { favorites: [] };
  const want = String(label || '').trim().toLowerCase();
  u.favorites = (u.favorites || []).filter((f) => f.label.toLowerCase() !== want);
  u.updatedAt = new Date().toISOString();
  store.users[chatKey] = u;
  saveStore(store);
  return u.favorites;
}

/** Si el texto es (o empieza por) un favorito personal, lo devuelve. */
export function matchPersonalFavorite(chatKey, text) {
  const u = getPersonalUser(chatKey);
  const t = String(text || '').trim().toLowerCase();
  if (!t) return null;
  const favs = u.favorites || [];
  const exact = favs.find((f) => f.label === t);
  if (exact) return exact;
  return favs.find((f) => t === f.label || t.startsWith(f.label + ' ') || t.includes(f.label)) || null;
}

export function personalStorePath() {
  return STORE_FILE;
}
