#!/bin/bash

# PotionMaster Permission Fix Script
# Fixes git repository permissions for proper updates

set -e

PROJECT_DIR="/home/potionmaster/PotionMaster"

echo "🔧 PotionMaster Permission Fix"
echo "==============================="

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ PotionMaster not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

echo "🔐 Fixing git repository permissions..."

# Fix ownership of the entire project directory
sudo chown -R potionmaster:potionmaster "$PROJECT_DIR"

# Fix git directory permissions specifically
if [ -d ".git" ]; then
    sudo chown -R potionmaster:potionmaster .git
    sudo chmod -R u+rwX,g+rX,o-rwx .git
    echo "✅ Git permissions fixed"
else
    echo "❌ No .git directory found"
    exit 1
fi

# Fix project file permissions
sudo find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
sudo find "$PROJECT_DIR" -type d -exec chmod 755 {} \;

# Make scripts executable
sudo chmod +x scripts/*.sh

echo "✅ All permissions fixed!"
echo ""
echo "You can now try updating again with:"
echo "  potionmaster update"