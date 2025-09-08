# 🍹 PotionMaster v1.0.0

**Automated Cocktail Mixing Machine for Raspberry Pi**

PotionMaster is a sophisticated IoT cocktail mixing machine that transforms your Raspberry Pi into an automated bartender. With precision dispensing, touch-optimized interface, and multi-language support, it delivers consistent, perfect cocktails every time.

![PotionMaster Interface](public/rpi_splash.png)

## ✨ Features

- **🔄 8 Automated Pumps**: Precision ingredient dispensing with volume control
- **⚖️ Digital Scale Integration**: Real-time weight monitoring (M5Stack MiniScale)
- **📱 Touch-Optimized Interface**: Beautiful, responsive web UI designed for touchscreens
- **🌍 Multi-Language Support**: English, German, and magical Hogwarts theme
- **🎨 Multiple Themes**: Beautiful themed backgrounds (Summer, Winter, Harry Potter houses, Retro)
- **📴 Offline Operation**: No internet required after setup
- **📊 Real-Time Monitoring**: Live hardware status and preparation progress
- **🎛️ Ingredient Management**: Flexible pump configuration and ingredient activation
- **🚨 Emergency Controls**: Instant stop functionality for safety
- **🧽 Automated Cleaning**: Built-in cleaning cycle for maintenance
- **🔧 Hardware Debug Panel**: Comprehensive testing and diagnostics
- **💾 Persistent Settings**: Automatic saving of configurations and preferences

## 🛠️ Hardware Requirements

### Essential Components
- **Raspberry Pi 4** (4GB RAM minimum, 8GB recommended)
- **5" HDMI Touchscreen** (800x480 or larger) 
- **8-Channel I2C Relay Board** (PCF8574 chipset)
- **M5Stack MiniScale Unit** (I2C digital scale)
- **8 Peristaltic Pumps** (12V DC, food-grade)
- **12V Power Supply** (minimum 5A for all pumps)
- **Food-grade silicone tubing**
- **High-quality microSD card** (32GB+, Class 10)

### Optional Components
- **Case/Housing**: 3D printed or custom enclosure
- **LED Strips**: Ambient lighting effects
- **External Display**: Additional status monitor

## 🚀 Quick Installation

### Prerequisites Setup
1. **Flash Raspberry Pi OS** using Raspberry Pi Imager
   - Select "Raspberry Pi OS (64-bit) Desktop"
   - Configure SSH, WiFi, and user credentials during imaging
   - Username: `potionmaster`

2. **Initial Boot & SSH Connection**
   ```bash
   ssh potionmaster@potionmaster.local
   ```

### Automated Installation
```bash
# Clone repository
git clone https://github.com/yourusername/PotionMaster.git
cd PotionMaster

# Run installation script (15-30 minutes)
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

The installation script automatically:
- ✅ Installs Node.js 18 and dependencies
- ✅ Configures nginx web server
- ✅ Sets up systemd services
- ✅ Enables I2C interface
- ✅ Creates potionmaster user and permissions
- ✅ Configures auto-start and kiosk mode

### Hardware Connection
```bash
# I2C Wiring (Raspberry Pi 4 GPIO):
Pin 3  (GPIO 2)  → SDA (relay + scale)
Pin 5  (GPIO 3)  → SCL (relay + scale)
Pin 6  (Ground)  → GND (both devices)
Pin 4  (5V)      → VCC (check voltage requirements)

# Expected I2C addresses:
0x20 = Relay Board (PCF8574)
0x26 = M5Stack Scale
```

### Start Services
```bash
# Start PotionMaster
potionmaster start

# Enable kiosk mode (optional)
potionmaster kiosk-on
sudo reboot
```

## 🎮 Control Commands

```bash
potionmaster start          # Start all services
potionmaster stop           # Stop all services  
potionmaster restart        # Restart all services
potionmaster status         # Check service status
potionmaster logs           # View service logs
potionmaster test           # Run hardware tests
potionmaster update         # Update system
potionmaster kiosk-on       # Enable kiosk mode
potionmaster kiosk-off      # Disable kiosk mode
```

## 🏗️ System Architecture

### Backend (Node.js + Express)
- **Hardware Manager**: Controls relays and scales via I2C
- **Cocktail Service**: Recipe management and preparation logic
- **SSE Manager**: Real-time communication with frontend
- **API Routes**: RESTful endpoints for all operations

### Frontend (React + TypeScript + Tailwind)
- **Component-Based Architecture**: Modular, reusable UI components
- **Real-Time Updates**: SSE integration for live hardware status
- **Responsive Design**: Touch-optimized for various screen sizes
- **Theme System**: Dynamic theming with beautiful backgrounds
- **State Management**: Custom hooks for configuration persistence

### Services
- **potionmaster-backend**: Main application service
- **nginx**: Web server and API proxy
- **potionmaster-kiosk**: Chromium kiosk mode

## 📱 User Interface

### Main Screen
- **Cocktail Grid**: Visual selection of available cocktails
- **Real-Time Filtering**: Only shows makeable cocktails based on active ingredients
- **Beautiful Cards**: High-quality cocktail images with names

### Preparation Flow
- **Order Confirmation**: Ingredient list and quantities
- **Live Progress**: Real-time dispensing status with progress bar
- **Weight Monitoring**: Scale readings during preparation
- **Completion Feedback**: Success confirmation and cleanup instructions

### Settings Panel
- **🧪 Ingredients**: Activate/deactivate available ingredients
- **🔧 Pump Configuration**: Assign ingredients to physical pumps (max 8)
- **🌍 Language**: Switch between English, German, Hogwarts
- **🎨 Theme**: Change background themes
- **⚙️ Hardware Debug**: Test individual components

### Screensaver
- **Auto-Activation**: Triggers after period of inactivity
- **Ambient Display**: Themed background with clock
- **Touch to Wake**: Instant return to main interface

## 🧪 Hardware Testing

### I2C Device Detection
```bash
sudo i2cdetect -y 1
# Expected: 0x20 (relay), 0x26 (scale)
```

### Component Testing
```bash
# Run comprehensive hardware tests
potionmaster test

# Manual testing
cd ~/PotionMaster/backend
npm run test
```

### Individual Component Tests
```bash
# Test scale reading
curl http://localhost:3000/api/hardware/status

# Test relay control
curl -X POST http://localhost:3000/api/hardware/relay/0/on
curl -X POST http://localhost:3000/api/hardware/relay/0/off

# Tare scales
curl -X POST http://localhost:3000/api/hardware/tare
```

## 📁 Project Structure

```
PotionMaster/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── hardware/       # Hardware control modules
│   │   ├── services/       # Business logic
│   │   └── sse/           # Real-time communication
│   ├── test/              # Hardware tests
│   └── server.js          # Main server file
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API
│   └── pages/            # Main pages
├── public/
│   ├── data/             # JSON configuration files
│   └── cocktails/        # Cocktail images
├── scripts/              # Installation and utility scripts
└── data/                 # Development data files
```

## ⚙️ Configuration

### Cocktail Recipes (`public/data/cocktails.json`)
```json
[
  {
    "id": "white_wine_spritz",
    "ingredients": {
      "white_wine": 100,
      "soda": 100
    }
  },
  {
    "id": "vodka_tonic_lite", 
    "ingredients": {
      "vodka": 40
    },
    "post_add": "tonic_water"
  }
]
```

### Ingredient Names (`public/data/ingredient_mapping.json`)
```json
{
  "vodka": {
    "de": "Wodka",
    "en": "Vodka", 
    "hogwarts": "Essenz des Nordens"
  }
}
```

### UI Translations (`public/data/interface_language.json`)
```json
{
  "en": {
    "confirm_title": "Confirm Your Order",
    "glass_instruction": "Please place your glass on the marked spot now."
  }
}
```

## 🔌 API Documentation

### Base URL
- **Local**: `http://localhost:3000`
- **Network**: `http://potionmaster.local:3000`

### Data Endpoints

#### GET `/data/cocktails.json`
Returns all available cocktails with ingredients and ratios.

#### GET `/data/ingredient_mapping.json`
Returns ingredient names in different languages.

#### GET `/data/interface_language.json`
Returns UI text translations.

### Hardware Control

#### GET `/api/hardware/status`
Returns current hardware status including scales and relay states.

```json
{
  "scales": {
    "scale1": { "weight": 0, "stable": true }
  },
  "relays": {
    "relay1": false,
    "relay2": true
  },
  "status": "ready"
}
```

#### POST `/api/hardware/tare`
Tares all connected scales.

#### POST `/api/hardware/relay/:relayId/:action`
Controls individual relays.
- `relayId`: relay1, relay2, etc.
- `action`: "on" or "off"

#### POST `/api/hardware/clean`
Initiates cleaning cycle for all dispensers.

### Cocktail Preparation

#### POST `/api/cocktails/prepare`
Starts cocktail preparation process.

```json
{
  "cocktailId": "white_wine_spritz",
  "ingredients": {
    "white_wine": 100,
    "soda": 100
  }
}
```

#### POST `/api/cocktails/stop`
Stops current preparation process.

### Real-time Communication

#### GET `/api/events` (SSE)
Server-Sent Events stream for real-time updates.

**Event Types:**
- `hardware_status`: Hardware state changes
- `preparation_progress`: Cocktail preparation updates  
- `error`: Error notifications

## 🆘 Troubleshooting

### Service Issues
```bash
# Check service status
potionmaster status

# View logs
potionmaster logs

# Restart services
potionmaster restart
```

### Hardware Issues
```bash
# Check I2C devices
sudo i2cdetect -y 1

# Test hardware
potionmaster test

# Check permissions
sudo usermod -a -G i2c,gpio potionmaster
```

### Network Issues
```bash
# Check nginx status
sudo systemctl status nginx

# Restart web server
sudo systemctl restart nginx

# Check firewall
sudo ufw status
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R potionmaster:potionmaster /home/potionmaster/PotionMaster

# Fix permissions
chmod +x scripts/*.sh
```

## 🔄 Updates

### Automatic Update
```bash
potionmaster update
```

### Manual Update
```bash
cd ~/PotionMaster
git pull
./scripts/update.sh
potionmaster restart
```

## 🎨 Design System

### Themes
- **Summer**: Bright, vibrant beach vibes
- **Winter**: Cool, elegant winter atmosphere
- **Gryffindor**: Bold red and gold
- **Hufflepuff**: Warm yellow and black
- **Ravenclaw**: Cool blue and bronze
- **Slytherin**: Sophisticated green and silver
- **Retro Arcade**: Nostalgic gaming aesthetics
- **Retro Console**: Classic gaming console style

### Color System
The design uses semantic color tokens defined in `src/index.css`:
- HSL-based color palette for consistent theming
- Automatic dark/light mode adaptation
- Theme-specific accent colors and gradients

### Typography
- Modern, readable fonts optimized for touchscreens
- Consistent sizing scale across all components
- High contrast for accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Safety Notes

- **Electrical Safety**: Ensure proper grounding and use appropriate power supplies
- **Food Safety**: Use only food-grade materials for liquid contact
- **Pump Maintenance**: Regular cleaning prevents contamination
- **Emergency Stop**: Always accessible during operation
- **Adult Supervision**: Required when serving alcoholic beverages
- **Moderation**: Please drink responsibly

## 📞 Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support

---

**🎉 Enjoy your PotionMaster and drink responsibly! 🍹**