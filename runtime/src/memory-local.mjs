import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function preloadContext({ packDir, dataDir }) {
  const soul = readText(join(packDir, 'soul.md'));
  const skills = readText(join(packDir, 'skills.md'));
  const latest = readJson(join(dataDir, 'memory/latest.json'));

  const l0 = latest?.l0Summary ?? '(sin memoria previa — primer turno)';
  const recent = Array.isArray(latest?.recentFacts) ? latest.recentFacts.slice(-5) : [];

  const systemPrompt = [
    '## Soul',
    soul,
    '',
    '## Skills',
    skills,
    '',
    '## Memory L0',
    l0,
    '',
    '## Memory L1 (hechos recientes)',
    recent.length ? recent.map((f) => `- ${f}`).join('\n') : '(ninguno)',
  ].join('\n');

  return {
    systemPrompt,
    meta: {
      soulBytes: soul.length,
      skillsBytes: skills.length,
      recentCount: recent.length,
      memoryPath: join(dataDir, 'memory'),
    },
  };
}

export function autowriteDelta({ dataDir, userMessage, assistantMessage, manifest }) {
  mkdirSync(join(dataDir, 'memory/deltas'), { recursive: true });
  const ts = new Date().toISOString();
  const delta = {
    ts,
    agent: manifest.name,
    user: truncate(userMessage, 500),
    assistant: truncate(assistantMessage, 800),
    bullets: extractBullets(userMessage, assistantMessage),
  };

  const deltaPath = join(dataDir, 'memory/deltas', `${ts.replace(/[:.]/g, '-')}.json`);
  writeFileSync(deltaPath, `${JSON.stringify(delta, null, 2)}\n`);

  const latestPath = join(dataDir, 'memory/latest.json');
  const prev = readJson(latestPath) ?? { recentFacts: [] };
  const recentFacts = [...prev.recentFacts, ...delta.bullets].slice(-20);
  const l0Summary = buildL0(recentFacts, manifest.name);

  const latest = {
    updatedAt: ts,
    l0Summary,
    recentFacts,
    experientialHash: hashJson({ recentFacts, l0Summary }),
    deltaCount: (prev.deltaCount ?? 0) + 1,
  };
  writeFileSync(latestPath, `${JSON.stringify(latest, null, 2)}\n`);

  return { deltaPath, latestPath, latest };
}

function buildL0(facts, name) {
  const tail = facts.slice(-3).join('; ');
  return tail ? `${name}: ${tail}` : `${name}: agente lab sin hechos acumulados aún.`;
}

function extractBullets(user, assistant) {
  const u = truncate(user, 120);
  const a = truncate(assistant, 160);
  return [`Usuario: ${u}`, `Agente: ${a}`];
}

function hashJson(obj) {
  return `0x${createHash('sha256').update(JSON.stringify(obj)).digest('hex')}`;
}

function readText(path) {
  if (!existsSync(path)) return `(missing ${path})`;
  return readFileSync(path, 'utf8').trim();
}

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function truncate(s, n) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}
