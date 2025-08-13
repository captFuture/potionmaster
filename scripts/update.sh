#!/bin/bash

# PotionMaster Update Script
# Updates the application from git repository

set -e

PROJECT_DIR="/home/potionmaster/PotionMaster"

echo "📥 PotionMaster Update Script"
echo "============================="

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ PotionMaster not found at $PROJECT_DIR"
    echo "Please run the installation script first."
    exit 1
fi

cd "$PROJECT_DIR"

# Stop services
echo "🛑 Stopping services..."
sudo systemctl stop potionmaster-backend 2>/dev/null || true
sudo systemctl stop potionmaster-kiosk 2>/dev/null || true

# Backup current version
echo "💾 Creating backup..."
BACKUP_DIR="${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
echo "Backup created at: $BACKUP_DIR"

# Pull latest changes
echo "📡 Pulling latest changes from git..."
sudo -u potionmaster git pull

# Update backend dependencies
echo "📦 Updating backend dependencies..."
cd "$PROJECT_DIR/backend"
sudo -u potionmaster npm install

# Update frontend dependencies and rebuild
echo "📦 Updating frontend dependencies..."
cd "$PROJECT_DIR"
sudo -u potionmaster npm install
sudo -u potionmaster npm run build

# Restart services
echo "🚀 Restarting services..."
sudo systemctl start potionmaster-backend
sudo systemctl reload nginx

# Check service status
echo "📊 Checking service status..."
if sudo systemctl is-active --quiet potionmaster-backend; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    echo "Check logs with: sudo journalctl -u potionmaster-backend -f"
fi

if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx service is running"
else
    echo "❌ Nginx service is not running"
fi

echo ""
echo "✅ Update completed successfully!"
echo ""
echo "🌐 Web interface: http://localhost"
echo "📡 Backend API: http://localhost:3000"
echo ""
echo "To view logs: potionmaster logs"
echo "To check status: potionmaster status"