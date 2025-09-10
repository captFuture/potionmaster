#!/bin/bash

# Setup passwordless sudo for system shutdown commands
# This allows the PotionMaster backend to gracefully shutdown the Raspberry Pi
# by calling: POST /api/system/shutdown

set -euo pipefail

USER_NAME=${1:-potionmaster}
SUDOERS_FILE="/etc/sudoers.d/${USER_NAME}-shutdown"

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root: sudo $0 [username]"
  exit 1
fi

if ! id -u "$USER_NAME" >/dev/null 2>&1; then
  echo "❌ User '$USER_NAME' does not exist"
  exit 1
fi

echo "🔐 Configuring sudoers for user: $USER_NAME"

# Write sudoers entry
cat > "$SUDOERS_FILE" <<EOF
$USER_NAME ALL=(root) NOPASSWD: /sbin/shutdown, /usr/sbin/shutdown, /sbin/poweroff, /usr/sbin/poweroff
EOF

# Set correct permissions
chmod 440 "$SUDOERS_FILE"

# Validate sudoers file
if visudo -cf "$SUDOERS_FILE"; then
  echo "✅ Sudoers configuration valid: $SUDOERS_FILE"
else
  echo "❌ Invalid sudoers configuration. Reverting."
  rm -f "$SUDOERS_FILE"
  exit 1
fi

echo "Done. The backend can now shutdown the system without a password."
