#!/usr/bin/env bash
# Aviso si ageNFT lleva más de N días sin commit (default 5).
# Cron Hermes --no-agent: silencio si está fresco; texto si está parado.
# 0 = fresco o aviso emitido; 1 = no se pudo leer git.
set -eu

DAYS="${AGENFT_STALE_DAYS:-5}"
REPO="${AGENFT_REPO:-}"

if [ -z "$REPO" ]; then
  if [ -e /home/openclaw/projects/ageNFT/.git ]; then
    REPO=/home/openclaw/projects/ageNFT
  elif [ -e "${HOME}/Projects/ageNFT/.git" ]; then
    REPO="${HOME}/Projects/ageNFT"
  else
    REPO="$(cd "$(dirname "$0")/../.." && pwd)"
  fi
fi

cd "$REPO"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ageNFT stale-nudge: $REPO no es un repo git"
  exit 1
fi

last_unix="$(git log -1 --format=%ct 2>/dev/null || true)"
if [ -z "$last_unix" ]; then
  echo "ageNFT stale-nudge: no hay commits"
  exit 1
fi

now="$(date +%s)"
age_days=$(( (now - last_unix) / 86400 ))
last_human="$(git log -1 --format='%ci (%s)')"

if [ "$age_days" -lt "$DAYS" ]; then
  exit 0
fi

cat <<EOF
⏰ ageNFT lleva ${age_days} días sin commit (umbral ${DAYS}).
Último: ${last_human}

Retomar Unit-Mainnet #1 (sin gastar si no hace falta):
  cd runtime && npm run hermes:doctor
  ficha: https://quetepinto.github.io/AgeNFT/
Siguiente de producto: Bloque 3 — memoria que viaja + Doctor en #1, no en el lab 115.
EOF
