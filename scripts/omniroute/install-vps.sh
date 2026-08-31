#!/usr/bin/env bash
# Instala OmniRoute en el VPS (Docker). Uso lab — no commitear passwords.
set -euo pipefail

OMNI_PASSWORD="${OMNIROUTE_INITIAL_PASSWORD:-}"
if [[ -z "$OMNI_PASSWORD" ]]; then
  echo "Define OMNIROUTE_INITIAL_PASSWORD antes de ejecutar."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx omniroute; then
  echo "omniroute container ya existe — docker start omniroute o docker rm -f omniroute"
  exit 1
fi

docker pull diegosouzapw/omniroute
docker run -d --name omniroute --restart unless-stopped \
  -p 127.0.0.1:20128:20128 \
  -e "INITIAL_PASSWORD=${OMNI_PASSWORD}" \
  diegosouzapw/omniroute

echo "OmniRoute en http://127.0.0.1:20128"
echo "Configura proveedores gratis en el dashboard."
