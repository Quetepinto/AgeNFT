#!/usr/bin/env node
/**
 * Instala integración Hermes para Unit-1:
 * - sync skill agenft-core
 * - scripts en ~/.hermes/scripts/
 * - cron Doctor cada 15m (--no-agent)
 */
import { copyFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '../..');
const HERMES_HOME = join(homedir(), '.hermes');
const SCRIPTS = join(HERMES_HOME, 'scripts');
const SKILL_DST = join(HERMES_HOME, 'skills/agenft/core/SKILL.md');
const SKILL_SRC = join(REPO, 'runtime/pack/unit-1/skills/agenft-core/SKILL.md');

const CRON_NAME = 'agenft-unit1-doctor';
const CRON_SCRIPT = 'agenft-doctor-probe.sh';

function sh(cmd) {
  console.log('$', cmd);
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim();
}

mkdirSync(dirname(SKILL_DST), { recursive: true });
mkdirSync(SCRIPTS, { recursive: true });

copyFileSync(SKILL_SRC, SKILL_DST);
console.log('✓ skill', SKILL_DST);

for (const name of ['agenft-doctor-probe.sh', 'agenft-turn.sh']) {
  const src = join(REPO, 'runtime/hermes', name);
  const dst = join(SCRIPTS, name);
  copyFileSync(src, dst);
  chmodSync(dst, 0o755);
  console.log('✓ script', dst);
}

// AGENTS.md para workdir Hermes
const agentsPath = join(REPO, 'AGENTS.md');
if (!existsSync(agentsPath)) {
  console.log('· AGENTS.md ya existe o créalo manualmente');
} else {
  console.log('✓ AGENTS.md presente');
}

let existing = [];
try {
  existing = sh('hermes cron list 2>/dev/null || true');
} catch {
  existing = '';
}

if (!existing.includes(CRON_NAME)) {
  sh(
    `hermes cron create --no-agent --name ${CRON_NAME} ` +
      `--script ${CRON_SCRIPT} --workdir ${REPO} "every 15m"`,
  );
  console.log('✓ cron', CRON_NAME);
} else {
  console.log('· cron ya existe:', CRON_NAME);
}

console.log('\nInstalación Hermes Unit-1 OK.');
console.log('Verificar: cd runtime && npm run hermes:verify');
