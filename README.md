# 🍹 PotionMaster - Raspberry Pi Cocktail Machine
## Version 1.0.0

A sophisticated, fully responsive cocktail mixing machine built for Raspberry Pi 4 with an 8-ingredient automated dispensing system.

## ✨ Features

- **8 Automated Pumps**: Controlled via I2C relay board (PCF8574 at 0x20)
- **Precision Scale**: M5Stack MiniScale for accurate measurements (I2C at 0x26)
- **Touch-Optimized Interface**: Fixed 3x2 cocktail grid with responsive scaling
- **Multi-Language & Themes**: English, German, and Hogwarts themes with configurable app titles
- **Offline Operation**: Complete functionality without internet
- **Real-time Monitoring**: Server-Sent Events for live hardware updates and preparation progress
- **Ingredient Management**: Configure alcoholic, non-alcoholic, and external ingredients
- **Emergency Controls**: Stop all pumps button for safety
- **Cleaning Cycle**: Automated pump cleaning system
- **Hardware Debug Panel**: Comprehensive testing and diagnostics
- **Modern UI**: Dark theme with glass morphism effects and touch-optimized controls

## 🛠️ Hardware Requirements

### Required Components
- **Raspberry Pi 4** (4GB+ recommended, 8GB for heavy usage)
- **7" Raspberry Pi® Touch Display 2** (1280 x 720) or similar HDMI touchscreen
- **8-Channel I2C Relay Board** (PCF8574 chip at address 0x20)
- **M5Stack MiniScale Unit** (I2C precision scale at address 0x26)
- **8 Peristaltic Pumps** (12V DC recommended or membrane pumps with 5V)
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
# - Connect power supplies (5V for Pi, 12V for pumps if needed)

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
- **Tailwind CSS** with custom design system
- **Touch-optimized** interface with fixed 3x2 cocktail grid
- **Multi-language** support with configurable app titles

### Hardware Integration
- **Relay Board**: PCF8574 at I2C address 0x20
- **Scale**: M5Stack MiniScale at I2C address 0x26

## 📱 User Interface Features

### Main Screen
- **Fixed 3x2 cocktail grid** that scales responsively across all screen sizes
- **Cocktail cards** with background images, ingredient lists, and external ingredient indicators
- **Round pagination buttons** with page dot indicators
- **Emergency stop all pumps** button always visible in footer
- **Real-time hardware status** indicators
- **Automatic screensaver** after 60 seconds (disabled during cocktail preparation)

### Cocktail Preparation Flow
1. **Selection**: Browse cocktail grid with visual ingredient information
2. **Details**: View complete recipe and preparation instructions
3. **Confirmation**: Large, accessible action buttons
4. **Preparation**: Real-time progress with live weight monitoring
5. **Completion**: Clear instructions for adding external ingredients

### Settings & Configuration
- **App Title Configuration**: Customize primary and secondary titles
- **Language Selection**: English, German, Hogwarts themes
- **Ingredient Management**: Visual enable/disable per category
- **System Controls**: Shutdown button for graceful Pi shutdown
- **Hardware Controls**: Cleaning cycles and calibration
- **Debug Access**: Hidden panel (5 taps in corner)

### Hardware Debug Panel
- **I2C Device Detection**: Real-time device scanning
- **Scale Testing**: Live weight readings and calibration
- **Relay Testing**: Individual relay control with 2-second test cycles
- **Emergency Controls**: Stop all relays button
- **Test Log**: Real-time feedback with timestamps

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
curl -X POST http://localhost:3000/api/hardware/relay/0 \
  -H "Content-Type: application/json" \
  -d '{"state": true}'

# Stop all relays
curl -X POST http://localhost:3000/api/hardware/relay/all-off

# Test scale reading
curl http://localhost:3000/api/hardware/status

# Tare the scale
curl -X POST http://localhost:3000/api/hardware/tare
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

# Check power supply connections
# Ensure proper wiring and stable power delivery
```

## 📁 File Structure

```
PotionMaster/
├── backend/                 # Node.js backend service
│   ├── server.js           # Main server file
│   ├── src/
│   │   ├── hardware/       # Hardware control (HardwareManager)
│   │   ├── services/       # Business logic (CocktailService)
│   │   └── sse/           # Server-Sent Events (SSEManager)
│   └── test/              # Hardware tests
├── src/                    # React frontend
│   ├── components/        # UI components
│   │   ├── ui/           # Reusable UI components
│   │   ├── CocktailGrid.tsx      # Fixed 3x2 cocktail display
│   │   ├── PreparationView.tsx   # Real-time preparation
│   │   ├── DebugPanel.tsx        # Hardware diagnostics
│   │   └── SettingsPanel.tsx     # Configuration
│   ├── hooks/            # Custom hooks
│   │   ├── useHardware.ts        # Hardware control
│   │   ├── useCocktails.ts       # Cocktail data management
│   │   └── useAppConfig.ts       # App configuration
│   └── pages/            # Page components
├── data/                  # JSON configuration files
│   ├── cocktails.json            # Recipe database
│   ├── ingredient_*.json         # Ingredient mappings
│   └── interface_language.json   # Translations
├── scripts/               # Installation/update scripts
└── public/               # Static assets
    └── cocktails/        # Cocktail images
```

## ⚙️ Configuration

### Ingredient Mapping
Edit `backend/src/services/CocktailService.js` to match your physical pump setup:

```javascript
const ingredientToRelayMap = {
  'vodka': 0,           // Pump 1 (Relay 0)
  'white_rum': 1,       // Pump 2 (Relay 1)
  'white_wine': 2,      // Pump 3 (Relay 2)
  'tonic_water': 3,     // Pump 4 (Relay 3)
  'orange_juice': 4,    // Pump 5 (Relay 4)
  'cranberry_juice': 5, // Pump 6 (Relay 5)
  'lime_juice': 6,      // Pump 7 (Relay 6)
  'simple_syrup': 7     // Pump 8 (Relay 7)
};
```

### Custom Cocktails
Add new recipes to `data/cocktails.json`:

```json
{
  "id": "my_cocktail",
  "ingredients": {
    "vodka": 40,
    "orange_juice": 100,
    "cranberry_juice": 60
  },
  "post_add": "ice_cubes"  // Optional external ingredient
}
```

### App Configuration
Customize app titles and settings in the Settings panel:
- Primary Title (default: "Potion Master")
- Secondary Title (default: "Mixmagic System")
- Language and theme selection
- Ingredient category management

## 🌐 API Endpoints

### Hardware Control
- `GET /api/hardware/status` - Get hardware status
- `POST /api/hardware/tare` - Tare the scale
- `POST /api/hardware/relay/:id` - Control individual relay
- `POST /api/hardware/relay/all-off` - Emergency stop all relays
- `POST /api/hardware/cleaning-cycle` - Start cleaning cycle

### Cocktail Preparation
- `POST /api/cocktails/prepare` - Start cocktail preparation
- `POST /api/cocktails/stop` - Stop current preparation

### System Control
- `POST /api/system/shutdown` - Gracefully shutdown Raspberry Pi

### Real-time Data
- `GET /api/events` - Server-Sent Events stream for live updates

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

# Test hardware via debug panel
# Access: 5 taps in bottom right corner

# Manual hardware test
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

## 🎨 Design System & Themes

### Dark Mode Themes
- **English**: Modern blue/purple gradients with clean lines
- **German**: Professional green with glass morphism effects
- **Hogwarts**: Magical purple/gold with floating animations

### UI Features
- **Fixed 3x2 cocktail grid** across all screen sizes
- **Responsive card scaling** maintaining aspect ratios
- **Touch-optimized** controls with proper spacing
- **Glass morphism effects** with backdrop blur
- **Smooth animations** and transitions
- **High contrast** for accessibility
- **Emergency controls** always accessible

### Ingredient Indicators
- **Snowflake icons** for external ingredients (ice, garnishes, etc.)
- **Visual ingredient lists** on cocktail cards
- **Category-based** ingredient management

## 📄 License

This project is for personal/educational use. Please ensure compliance with local regulations regarding automated beverage dispensing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test on actual hardware
4. Submit a pull request

## ⚠️ Safety Notes

- **Emergency Stop**: Use the "Stop All" button to immediately halt all pumps
- Always disconnect bottles before cleaning
- Use food-grade tubing and pumps
- Regular cleaning is essential
- Monitor alcohol dispensing laws in your area
- Never leave the system unattended during operation
- Ensure stable power supply for all components

---

**Enjoy responsibly! 🍹**