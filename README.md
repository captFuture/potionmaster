# 🍹 PotionMaster - Raspberry Pi Cocktail Machine

A sophisticated cocktail mixing machine built for Raspberry Pi 4 with an 8-ingredient automated dispensing system.

## ✨ Features

- **8 Automated Pumps**: Controlled via I2C relay board (PCF8574 at 0x20)
- **Precision Scale**: M5Stack MiniScale for accurate measurements (I2C at 0x26)
- **Touch Interface**: Optimized for 5" touchscreen (800x480)
- **Multi-Language**: English, German, and Hogwarts themes
- **Offline Operation**: Complete functionality without internet
- **Real-time Monitoring**: Server-Sent Events for live updates
- **Ingredient Management**: Configure up to 4 alcoholic + 4 non-alcoholic + 4 external ingredients
- **Cleaning Cycle**: Automated pump cleaning system

## 🛠️ Hardware Requirements

- Raspberry Pi 4 (4GB+ recommended)
- 5" HDMI Touchscreen (800x480)
- 8-Channel I2C Relay Board (PCF8574)
- M5Stack MiniScale Unit
- 8 Peristaltic pumps
- Power supply and tubing

## 📋 Quick Installation

### 1. Flash Raspberry Pi OS
```bash
# Download Raspberry Pi Imager
# Flash Raspberry Pi OS (64-bit) to SD card
# Enable SSH and set username/password if needed
```

### 2. Initial Setup
```bash
# Boot Pi and connect to network
sudo apt update && sudo apt upgrade -y

# Clone repository
git clone <your-repository-url> PotionMaster
cd PotionMaster

# Run installation script
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

### 3. Reboot
```bash
sudo reboot
```

## 🎮 Control Commands

After installation, use the `potionmaster` command:

```bash
potionmaster start       # Start all services
potionmaster stop        # Stop all services
potionmaster restart     # Restart services
potionmaster kiosk-on    # Enable fullscreen kiosk mode
potionmaster kiosk-off   # Disable kiosk mode
potionmaster status      # Check service status
potionmaster logs        # View backend logs
potionmaster test        # Run hardware tests
potionmaster update      # Update from git repository
```

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

## 📱 User Interface

### Main Screen
- 3x3 grid of available cocktails
- Touch-optimized buttons
- Hardware status indicators
- Language selection
- Settings access

### Preparation Flow
1. Select cocktail from grid
2. View ingredients and details
3. Confirm order
4. Place glass on scale
5. Watch real-time pouring progress
6. Add external ingredients if needed

### Settings Panel
- Language selection (EN/DE/Hogwarts)
- Ingredient configuration
- Cleaning cycle
- Hardware debug panel (hidden)

## 🧪 Hardware Testing

### Test I2C Devices
```bash
# Scan for I2C devices
i2cdetect -y 1

# Test relay board
node test-relay.js

# Test scale
node test-scale.js

# Test both
potionmaster test
```

### Expected I2C Addresses
- `0x20` (32) - 8-Channel Relay Board
- `0x26` (38) - M5Stack MiniScale

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

## 🎨 Theming

The system includes three themes:
- **English**: Modern blue/purple gradient
- **German**: Professional with subtle effects  
- **Hogwarts**: Magical purple/gold theme

Themes are automatically applied based on language selection.

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
