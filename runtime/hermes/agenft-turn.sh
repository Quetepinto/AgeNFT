#!/usr/bin/env bash
# Turno ageNFT para gateway Hermes — mensaje en $1 o AGENFT_USER_MESSAGE.
set -euo pipefail
export AGENFT_TOKEN_ID="${AGENFT_TOKEN_ID:-115}"
MSG="${1:-${AGENFT_USER_MESSAGE:-}}"
if [[ -z "$MSG" ]]; then
  echo "agenft-turn: falta mensaje" >&2
  exit 1
fi
cd /home/openclaw/projects/ageNFT/runtime
exec npm run hermes:turn:pay -- --plain --quiet "$MSG"
