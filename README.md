# 🍹 PotionMaster - Raspberry Pi Cocktail Machine

A sophisticated, fully responsive cocktail mixing machine built for Raspberry Pi 4 with an 8-ingredient automated dispensing system.

## ✨ Features

- **8 Automated Pumps**: Controlled via I2C relay board (PCF8574 at 0x20)
- **Precision Scale**: M5Stack MiniScale for accurate measurements (I2C at 0x26)
- **Fully Responsive Design**: Optimized for touchscreens, tablets, desktops, and mobile devices
- **Multi-Language**: English, German, and Hogwarts themes with dynamic switching
- **Offline Operation**: Complete functionality without internet
- **Real-time Monitoring**: Server-Sent Events for live hardware updates
- **Ingredient Management**: Configure up to 4 alcoholic + 4 non-alcoholic + external ingredients
- **Cleaning Cycle**: Automated pump cleaning system
- **Modern UI**: Glass morphism effects, animations, and touch-optimized controls

## 🛠️ Hardware Requirements

### Required Components
- **Raspberry Pi 4** (4GB+ recommended, 8GB for heavy usage)
- **7" Raspberry Pi® Touch Display 2  Pixel 1280 x 720** (or similar hdmi screens)
- **8-Channel I2C Relay Board** (PCF8574 chip)
- **M5Stack MiniScale Unit** (I2C precision scale)
- **8 Peristaltic Pumps** (12V DC recommended or membrane pumps with 5v)
- **5V and/or 12V Power Supply** (sufficient voltage and amperage for all devices)
- **Food-grade Silicone Tubing**
- **MicroSD Card** (32GB+ Class 10 recommended)

## 📋 Complete Raspberry Pi 4 Installation Guide

### 1. Prepare SD Card
```bash
# Download Raspberry Pi Imager from https://rpi.org/imager
# Use a high-quality 32GB+ microSD card (Class 10 or better)

# Flash Raspberry Pi OS (64-bit) Desktop to SD card
# In imager settings (gear icon):
#   - Enable SSH with password authentication
#   - Set username: potionmaster
#   - Set password: [your choice]
#   - Configure WiFi if needed
#   - Set hostname: potionmaster
```

### 2. Initial Boot and Setup
```bash
# Insert SD card and boot Raspberry Pi
# Connect via SSH or use the desktop

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Git if not present
sudo apt install git -y

# Clone the PotionMaster repository
git clone https://github.com/yourusername/PotionMaster.git
cd PotionMaster

# Make installation script executable
chmod +x scripts/install.sh

# Run the automated installation
sudo ./scripts/install.sh
```

### 3. Hardware Setup
```bash
# Enable I2C and configure boot options
sudo raspi-config
# Navigate to Interface Options > I2C > Enable
# Navigate to Advanced Options > Memory Split > Set to 128

# Connect hardware:
# - Relay board to GPIO pins (SDA/SCL for I2C)
# - M5Stack scale to I2C bus
# - Connect pumps to relay outputs
# - Connect 12V power supply

# Test I2C connection
sudo i2cdetect -y 1
# Should show devices at 0x20 (relay) and 0x26 (scale)
```

### 4. Final Configuration
```bash
# Reboot to apply all changes
sudo reboot

# After reboot, start PotionMaster
potionmaster start

# Enable kiosk mode for touchscreen (optional)
potionmaster kiosk-on
```

## 🎮 Control Commands

After installation, manage PotionMaster with these commands:

```bash
# Service Management
potionmaster start       # Start all services (backend + frontend)
potionmaster stop        # Stop all services gracefully
potionmaster restart     # Restart all services
potionmaster status      # Check service status and health

# Display Modes
potionmaster kiosk-on    # Enable fullscreen kiosk mode (auto-start)
potionmaster kiosk-off   # Disable kiosk mode (return to desktop)

# Maintenance
potionmaster logs        # View real-time backend logs
potionmaster test        # Run comprehensive hardware tests
potionmaster update      # Update from git repository

# Development
potionmaster dev         # Start in development mode (with hot reload)
potionmaster build       # Build frontend for production
```

### Quick Access URLs
- **Main Interface**: http://localhost
- **Backend API**: http://localhost:3000
- **Hardware Status**: http://localhost:3000/api/hardware/status

## 🔧 System Architecture

### Backend Service (Port 3000)
- **Node.js/Express** server
- **REST API** for hardware commands
- **Server-Sent Events** for real-time data
- **I2C Hardware** integration

### Frontend Service (Port 80)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Touch-optimized** interface
- **Multi-language** support

### Hardware Integration
- **Relay Board**: PCF8574 at I2C address 0x20
- **Scale**: M5Stack MiniScale at I2C address 0x26

## 📱 Responsive User Interface

### Main Screen Features
- Responsive cocktail grid (3 columns)
- Touch-optimized buttons with proper sizing
- Real-time hardware status indicators
- Intuitive navigation with visual feedback
- Automatic screensaver after 60 seconds of inactivity

### Cocktail Preparation Flow
1. **Selection**: Browse responsive cocktail grid with pagination
2. **Details**: View ingredients, volume, and preparation time
3. **Confirmation**: Large, accessible action buttons
4. **Preparation**: Real-time progress with glass fill visualization
5. **Completion**: Clear instructions for external ingredients

### Settings & Configuration
- **Language Selection**: English, German, Hogwarts themes
- **Ingredient Management**: Visual enable/disable per category
- **Hardware Controls**: Cleaning cycles and calibration
- **Debug Access**: Hidden panel (5 taps in corner)

## 🧪 Hardware Testing & Diagnostics

### I2C Device Detection
```bash
# Scan for connected I2C devices
sudo i2cdetect -y 1

# Expected output should show:
#      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
# 00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
# 10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
# 20: 20 -- -- -- -- -- 26 -- -- -- -- -- -- -- -- -- 
# 30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
```

### Hardware Component Tests
```bash
# Test all hardware components
potionmaster test

# Individual component tests
cd backend && npm run test

# Manual relay testing (careful!)
# Test relay channels 0-7
curl -X POST http://localhost:3000/api/hardware/relay/0

# Test scale reading
curl http://localhost:3000/api/hardware/scale/weight

# Tare the scale
curl -X POST http://localhost:3000/api/hardware/scale/tare
```

### Expected I2C Device Addresses
- **0x20** (32) - PCF8574 8-Channel Relay Board
- **0x26** (38) - M5Stack MiniScale Unit

### Troubleshooting Hardware Issues
```bash
# Check I2C is enabled
sudo raspi-config # Interface Options > I2C > Enable

# Verify GPIO pins are not in use
cat /sys/kernel/debug/gpio

# Check power supply (12V for pumps, 5V for Pi)
# Ensure proper wiring and connections
```

## 📁 File Structure

```
PotionMaster/
├── backend/                 # Node.js backend service
│   ├── server.js           # Main server file
│   ├── src/
│   │   ├── hardware/       # Hardware control
│   │   ├── services/       # Business logic
│   │   └── sse/           # Server-Sent Events
│   └── test/              # Hardware tests
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── hooks/            # Custom hooks
│   └── pages/            # Page components
├── data/                  # JSON configuration files
│   ├── cocktails.json
│   ├── ingredient_*.json
│   └── interface_language.json
├── scripts/               # Installation/update scripts
└── public/               # Static assets
```

## ⚙️ Configuration

### Ingredient Mapping
Edit `backend/src/services/CocktailService.js` to match your physical pump setup:

```javascript
const ingredientToRelayMap = {
  'vodka': 0,           // Pump 1 (Relay 0)
  'white_rum': 1,       // Pump 2 (Relay 1)
  'white_wine': 2,      // Pump 3 (Relay 2)
  // ... configure all 8 pumps
};
```

### Custom Cocktails
Add new recipes to `data/cocktails.json`:

```json
{
  "id": "my_cocktail",
  "ingredients": {
    "vodka": 40,
    "orange_juice": 100
  },
  "post_add": "tonic_water"  // Optional external ingredient
}
```

## 🌐 API Endpoints

### Hardware Control
- `GET /api/hardware/status` - Get hardware status
- `POST /api/hardware/tare` - Tare the scale
- `POST /api/hardware/relay/:id` - Control relay
- `POST /api/hardware/cleaning-cycle` - Start cleaning

### Cocktail Preparation
- `POST /api/cocktails/prepare` - Start cocktail preparation
- `POST /api/cocktails/stop` - Stop current preparation

### Real-time Data
- `GET /api/events` - Server-Sent Events stream

## 🚨 Troubleshooting

### Service Issues
```bash
# Check service status
systemctl status potionmaster-backend
systemctl status nginx

# View logs
journalctl -u potionmaster-backend -f
journalctl -u nginx -f
```

### Hardware Issues
```bash
# Check I2C
ls /dev/i2c*
i2cdetect -y 1

# Test hardware
potionmaster test
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R potionmaster:potionmaster /home/potionmaster/PotionMaster

# Add user to groups
sudo usermod -a -G i2c,gpio potionmaster
```

## 🔄 Updates

To update the system:
```bash
potionmaster update
```

Or manually:
```bash
cd /home/potionmaster/PotionMaster
git pull
./scripts/update.sh
```

## 🎨 Theming & Responsive Design

### Built-in Themes
- **English (Default)**: Modern blue/purple gradients with clean lines
- **German**: Professional green with subtle glass morphism effects
- **Hogwarts**: Magical purple/gold with floating animations

### Theme Features
- **Automatic switching** based on language selection
- **Glass morphism effects** with backdrop blur
- **Smooth animations** and transitions
- **Touch-optimized** spacing and sizing
- **High contrast** for accessibility
- **Magical effects** in Hogwarts theme (floating, glowing)

## 📄 License

This project is for personal/educational use. Please ensure compliance with local regulations regarding automated beverage dispensing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test on actual hardware
4. Submit a pull request

## ⚠️ Safety Notes

- Always disconnect bottles before cleaning
- Use food-grade tubing and pumps
- Regular cleaning is essential
- Monitor alcohol dispensing laws in your area
- Never leave the system unattended during operation

---

**Enjoy responsibly! 🍹**
