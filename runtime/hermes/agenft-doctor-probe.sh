#!/usr/bin/env bash
# Cron Hermes --no-agent: Doctor lite Unit-1 (probe tx402 + budget).
set -euo pipefail
export AGENFT_TOKEN_ID="${AGENFT_TOKEN_ID:-115}"
cd /home/openclaw/projects/ageNFT/runtime
exec npm run hermes:doctor --silent
