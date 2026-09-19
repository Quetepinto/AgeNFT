#!/usr/bin/env bash
# Apunta Hermesclaw a OmniRoute local (lab). Restaura con el backup generado.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
CONFIG="$HERMES_HOME/config.yaml"
ENV_FILE="$HERMES_HOME/.env"
BACKUP_DIR="$HERMES_HOME/backups"
TS="$(date +%Y%m%d-%H%M%S)"
OMNI_ENDPOINT="${OMNIROUTE_ENDPOINT:-http://127.0.0.1:20128/v1}"
OMNI_MODEL="${OMNIROUTE_MODEL:-auto/best-free}"
OMNI_KEY="${OMNIROUTE_API_KEY:-omniroute}"

if [[ ! -f "$CONFIG" ]]; then
  echo "No existe $CONFIG — ¿Hermes instalado?"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
cp -a "$CONFIG" "$BACKUP_DIR/config.yaml.pre-omniroute-$TS"
[[ -f "$ENV_FILE" ]] && cp -a "$ENV_FILE" "$BACKUP_DIR/env.pre-omniroute-$TS"

python3 - <<PY
import pathlib, yaml

config_path = pathlib.Path("$CONFIG")
data = yaml.safe_load(config_path.read_text()) or {}

data.setdefault("model", {})
data["model"]["provider"] = "custom:omniroute"
data["model"]["base_url"] = "$OMNI_ENDPOINT".rstrip("/")
data["model"]["default"] = "$OMNI_MODEL"
data["model"]["context_length"] = data["model"].get("context_length") or 65536
data["model"]["key_env"] = "HERMES_CUSTOM_OMNIROUTE_API_KEY"

cps = data.get("custom_providers")
if not isinstance(cps, list):
    cps = []
cps = [e for e in cps if str((e or {}).get("name", "")).lower() not in {"omniroute", "omni route"}]
cps.append({
    "name": "OmniRoute",
    "base_url": "$OMNI_ENDPOINT".rstrip("/"),
    "key_env": "HERMES_CUSTOM_OMNIROUTE_API_KEY",
    "model": "$OMNI_MODEL",
})
data["custom_providers"] = cps

config_path.write_text(yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False))
print("config.yaml → OmniRoute ($OMNI_ENDPOINT, $OMNI_MODEL) + custom_providers")
PY

touch "$ENV_FILE"
if grep -q '^HERMES_CUSTOM_OMNIROUTE_API_KEY=' "$ENV_FILE" 2>/dev/null; then
  sed -i "s|^HERMES_CUSTOM_OMNIROUTE_API_KEY=.*|HERMES_CUSTOM_OMNIROUTE_API_KEY=$OMNI_KEY|" "$ENV_FILE"
else
  echo "HERMES_CUSTOM_OMNIROUTE_API_KEY=$OMNI_KEY" >> "$ENV_FILE"
fi

echo "Backup: $BACKUP_DIR/config.yaml.pre-omniroute-$TS"
echo "Reinicia: systemctl --user restart hermes-gateway.service"
echo "Restaurar: cp $BACKUP_DIR/config.yaml.pre-omniroute-$TS $CONFIG"
