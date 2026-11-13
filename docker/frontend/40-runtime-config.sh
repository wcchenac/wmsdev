#!/bin/sh
set -eu

API_BASE_URL="${API_BASE_URL:-}"
ESCAPED=$(printf '%s' "$API_BASE_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > /usr/share/nginx/html/config.js <<EOF
window.__WMS_CONFIG__ = { apiBaseUrl: "${ESCAPED}" };
EOF
