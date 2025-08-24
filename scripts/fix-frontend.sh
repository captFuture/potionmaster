#!/bin/bash

# PotionMaster Frontend Fix Script
# Rebuilds and properly serves the frontend

set -e

PROJECT_DIR="/home/potionmaster/PotionMaster"

echo "🔧 PotionMaster Frontend Fix"
echo "============================="

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ PotionMaster not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

echo "🛑 Stopping services..."
sudo systemctl stop potionmaster-backend 2>/dev/null || true

echo "📦 Installing dependencies..."
sudo -u potionmaster npm install

echo "🏗️ Building frontend..."
sudo -u potionmaster npm run build

echo "🔐 Fixing permissions..."
sudo chown -R potionmaster:potionmaster "$PROJECT_DIR"
# Ensure nginx (www-data) can traverse parent dirs
HOME_DIR="$(dirname "$PROJECT_DIR")"
sudo chmod 755 "$HOME_DIR"
sudo chmod 755 "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR/dist"

echo "🌐 Testing nginx configuration..."
sudo nginx -t

echo "🚀 Restarting services..."
sudo systemctl start potionmaster-backend
sudo systemctl reload nginx

echo "📊 Checking services..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    sudo systemctl status nginx
fi

if sudo systemctl is-active --quiet potionmaster-backend; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    sudo systemctl status potionmaster-backend
fi

echo ""
echo "✅ Frontend fix completed!"
echo "🌐 Web interface should now be available at: http://localhost"