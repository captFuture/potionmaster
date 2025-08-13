#!/bin/bash

# PotionMaster Installation Script for Raspberry Pi
# This script sets up the complete PotionMaster system

set -e

echo "🍹 PotionMaster Installation Script"
echo "=================================="

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️  Warning: This script is designed for Raspberry Pi"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt-get install -y \
    git \
    i2c-tools \
    nginx \
    python3-dev \
    build-essential \
    libi2c-dev

# Enable I2C
echo "🔌 Enabling I2C interface..."
sudo raspi-config nonint do_i2c 0

# Create potionmaster user if it doesn't exist
if ! id "potionmaster" &>/dev/null; then
    echo "👤 Creating potionmaster user..."
    sudo useradd -m -s /bin/bash potionmaster
    sudo usermod -a -G i2c,gpio potionmaster
fi

# Set up project directory
PROJECT_DIR="/home/potionmaster/PotionMaster"
echo "📁 Setting up project directory at $PROJECT_DIR..."

if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Project directory already exists. Backing up..."
    sudo mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Clone repository (assuming it's already been created)
sudo mkdir -p "$PROJECT_DIR"
sudo cp -r . "$PROJECT_DIR/"
sudo chown -R potionmaster:potionmaster "$PROJECT_DIR"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
sudo -u potionmaster npm install

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_DIR"
sudo -u potionmaster npm install
sudo -u potionmaster npm run build

# Set up splash screen
echo "🖼️  Setting up splash screen..."
if [ -f "$PROJECT_DIR/public/rpi_splash.png" ]; then
    sudo cp "$PROJECT_DIR/public/rpi_splash.png" /usr/share/pixmaps/splash.png
    
    # Update boot config for splash screen
    if ! grep -q "disable_splash=1" /boot/config.txt; then
        echo "disable_splash=1" | sudo tee -a /boot/config.txt
    fi
    
    # Create custom splash service
    sudo tee /etc/systemd/system/splash-screen.service > /dev/null <<EOF
[Unit]
Description=Show splash screen
DefaultDependencies=false
Before=display-manager.service

[Service]
Type=oneshot
ExecStart=/usr/bin/fbi -d /dev/fb0 --noverbose -a /usr/share/pixmaps/splash.png
RemainAfterExit=yes

[Install]
WantedBy=sysinit.target
EOF

    sudo systemctl enable splash-screen.service
fi

# Set up nginx for frontend
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/potionmaster > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root $PROJECT_DIR/dist;
    index index.html index.htm;
    
    server_name _;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/potionmaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Create systemd service for backend
echo "🔧 Creating backend service..."
sudo tee /etc/systemd/system/potionmaster-backend.service > /dev/null <<EOF
[Unit]
Description=PotionMaster Backend Service
After=network.target

[Service]
Type=simple
User=potionmaster
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create kiosk mode service
echo "🖥️  Creating kiosk mode service..."
sudo tee /etc/systemd/system/potionmaster-kiosk.service > /dev/null <<EOF
[Unit]
Description=PotionMaster Kiosk Mode
After=graphical-session.target

[Service]
Type=simple
User=potionmaster
Environment=DISPLAY=:0
ExecStart=/usr/bin/chromium-browser --kiosk --no-sandbox --disable-dev-shm-usage --disable-gpu http://localhost
Restart=always
RestartSec=10

[Install]
WantedBy=graphical-session.target
EOF

# Set up auto-login for kiosk mode
echo "🔐 Setting up auto-login..."
sudo raspi-config nonint do_boot_behaviour B4

# Install Chromium for kiosk mode
echo "📦 Installing Chromium browser..."
sudo apt-get install -y chromium-browser

# Create control scripts
echo "📝 Creating control scripts..."
sudo tee /usr/local/bin/potionmaster > /dev/null <<'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "🚀 Starting PotionMaster services..."
        sudo systemctl start potionmaster-backend
        sudo systemctl start nginx
        ;;
    stop)
        echo "🛑 Stopping PotionMaster services..."
        sudo systemctl stop potionmaster-backend
        sudo systemctl stop potionmaster-kiosk 2>/dev/null || true
        ;;
    restart)
        echo "🔄 Restarting PotionMaster services..."
        sudo systemctl restart potionmaster-backend
        sudo systemctl restart nginx
        ;;
    kiosk-on)
        echo "🖥️  Enabling kiosk mode..."
        sudo systemctl enable potionmaster-kiosk
        sudo systemctl start potionmaster-kiosk
        ;;
    kiosk-off)
        echo "🖥️  Disabling kiosk mode..."
        sudo systemctl disable potionmaster-kiosk
        sudo systemctl stop potionmaster-kiosk
        ;;
    status)
        echo "📊 PotionMaster Service Status:"
        sudo systemctl status potionmaster-backend --no-pager -l
        echo ""
        sudo systemctl status nginx --no-pager -l
        ;;
    logs)
        echo "📋 PotionMaster Backend Logs:"
        sudo journalctl -u potionmaster-backend -f
        ;;
    test)
        echo "🧪 Running hardware tests..."
        cd "$PROJECT_DIR/backend" && npm test
        ;;
    update)
        echo "📥 Updating PotionMaster..."
        cd "$PROJECT_DIR"
        git pull
        cd backend && npm install
        cd .. && npm install && npm run build
        sudo systemctl restart potionmaster-backend
        sudo systemctl reload nginx
        echo "✅ Update complete"
        ;;
    *)
        echo "PotionMaster Control Script"
        echo "Usage: $0 {start|stop|restart|kiosk-on|kiosk-off|status|logs|test|update}"
        exit 1
        ;;
esac
EOF

sudo chmod +x /usr/local/bin/potionmaster

# Enable services
echo "🔧 Enabling services..."
sudo systemctl enable potionmaster-backend
sudo systemctl enable nginx

# Start services
echo "🚀 Starting services..."
sudo systemctl start potionmaster-backend
sudo systemctl start nginx

# Set file permissions
echo "🔒 Setting file permissions..."
sudo chown -R potionmaster:potionmaster "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"

echo ""
echo "✅ PotionMaster installation completed!"
echo ""
echo "🎮 Control commands:"
echo "  potionmaster start       - Start services"
echo "  potionmaster stop        - Stop services"  
echo "  potionmaster kiosk-on    - Enable kiosk mode"
echo "  potionmaster kiosk-off   - Disable kiosk mode"
echo "  potionmaster status      - Check service status"
echo "  potionmaster logs        - View backend logs"
echo "  potionmaster test        - Run hardware tests"
echo "  potionmaster update      - Update from git"
echo ""
echo "🌐 Web interface: http://localhost"
echo "📡 Backend API: http://localhost:3000"
echo ""
echo "⚠️  Please reboot the system to complete the installation:"
echo "sudo reboot"