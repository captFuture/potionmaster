# 🚀 Complete Raspberry Pi 4 Installation Guide

This guide provides step-by-step instructions for setting up PotionMaster on a Raspberry Pi 4.

## 📋 Prerequisites

### Hardware Requirements
- **Raspberry Pi 4** (4GB RAM minimum, 8GB recommended)
- **High-quality microSD card** (32GB+, Class 10 or UHS-1)
- **5" HDMI Touchscreen** (800x480 or larger)
- **8-Channel I2C Relay Board** (PCF8574)
- **M5Stack MiniScale Unit**
- **8 Peristaltic Pumps** (12V DC)
- **12V Power Supply** (minimum 5A for all pumps)
- **Food-grade silicone tubing**
- **Ethernet cable or WiFi access**

### Tools Needed
- Computer with SD card reader
- HDMI cable for initial setup
- USB keyboard and mouse (for initial setup)

## 🔧 Step 1: Prepare the SD Card

### Download and Flash Raspberry Pi OS
1. Download **Raspberry Pi Imager** from https://rpi.org/imager
2. Insert your microSD card into your computer
3. Open Raspberry Pi Imager

### Configure OS Settings
1. Select **"Raspberry Pi OS (64-bit) Desktop"**
2. Click the **gear icon** (Advanced options)
3. Configure the following:
   ```
   ✅ Enable SSH
   📝 Username: potionmaster
   🔑 Password: [choose a secure password]
   🌐 WiFi SSID: [your network name]
   🔐 WiFi Password: [your network password]
   📍 Hostname: potionmaster
   ⌚ Timezone: [your timezone]
   ⌨️ Keyboard layout: [your layout]
   ```
4. Flash the image to your SD card
5. Safely eject the SD card

## 🖥️ Step 2: Initial Boot and Connection

### First Boot
1. Insert the SD card into your Raspberry Pi 4
2. Connect your 5" touchscreen via HDMI
3. Connect power and wait for boot (first boot takes longer)
4. The Pi should automatically connect to WiFi

### Find Your Pi's IP Address
```bash
# Option 1: Check your router's admin panel
# Option 2: Use network scanner
nmap -sn 192.168.1.0/24 | grep potionmaster

# Option 3: Connect directly via hostname
ssh potionmaster@potionmaster.local
```

### Connect via SSH
```bash
ssh potionmaster@[IP_ADDRESS]
# Enter the password you set during imaging
```

## 📦 Step 3: System Preparation

### Update System Packages
```bash
# Update package lists and upgrade system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl wget nano

# Reboot if kernel was updated
sudo reboot
```

### Enable Required Interfaces
```bash
# Open Raspberry Pi configuration
sudo raspi-config

# Navigate through menus:
# 3 Interface Options
#   → I2C → Enable
#   → SSH → Enable (should already be enabled)
# 7 Advanced Options
#   → Memory Split → 128

# Save and exit, then reboot
sudo reboot
```

## 🔽 Step 4: Download and Install PotionMaster

### Clone Repository
```bash
# Navigate to home directory
cd ~

# Clone PotionMaster repository
git clone https://github.com/yourusername/PotionMaster.git
cd PotionMaster

# Make installation script executable
chmod +x scripts/install.sh
```

### Run Installation Script
```bash
# Run the automated installation (this takes 15-30 minutes)
sudo ./scripts/install.sh

# The script will:
# - Install Node.js 18
# - Install required system packages
# - Set up nginx web server
# - Create systemd services
# - Configure auto-start
# - Set up kiosk mode
```

## ⚡ Step 5: Hardware Connection

### I2C Wiring
```bash
# Raspberry Pi 4 GPIO Pinout (for I2C):
# Pin 3  (GPIO 2)  → SDA (connect to both relay and scale)
# Pin 5  (GPIO 3)  → SCL (connect to both relay and scale) 
# Pin 6  (Ground)  → GND (connect to both devices)
# Pin 4  (5V)      → VCC (for scale, check voltage requirements)
```

### Relay Board Connection
```bash
# 8-Channel Relay Board (PCF8574):
# VCC → 5V (Pin 4)
# GND → Ground (Pin 6) 
# SDA → GPIO 2 (Pin 3)
# SCL → GPIO 3 (Pin 5)
```

### Scale Connection
```bash
# M5Stack MiniScale:
# VCC → 5V (Pin 4) - check scale voltage requirements
# GND → Ground (Pin 6)
# SDA → GPIO 2 (Pin 3) - shared with relay
# SCL → GPIO 3 (Pin 5) - shared with relay
```

### Pump Connections
```bash
# Connect 8 peristaltic pumps to relay outputs
# Each pump should be rated for 12V DC
# Connect 12V power supply to relay board power terminals
# Ensure proper polarity and adequate current capacity
```

## 🧪 Step 6: Hardware Testing

### Test I2C Devices
```bash
# Scan for I2C devices
sudo i2cdetect -y 1

# Expected output:
#      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
# 00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
# 10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
# 20: 20 -- -- -- -- -- 26 -- -- -- -- -- -- -- -- -- 
# 30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

# 0x20 = Relay Board (PCF8574)
# 0x26 = M5Stack Scale
```

### Run Hardware Tests
```bash
# Test all hardware components
potionmaster test

# Individual tests
cd ~/PotionMaster/backend
npm run test
```

## 🚀 Step 7: Start PotionMaster

### Start Services
```bash
# Start all PotionMaster services
potionmaster start

# Check service status
potionmaster status

# View logs
potionmaster logs
```

### Enable Kiosk Mode (Optional)
```bash
# Enable fullscreen kiosk mode for touchscreen
potionmaster kiosk-on

# Reboot to start in kiosk mode
sudo reboot
```

### Access the Interface
- **Local Web Interface**: http://localhost
- **From other devices**: http://potionmaster.local or http://[PI_IP_ADDRESS]
- **Backend API**: http://localhost:3000

## 🔧 Step 8: Configuration

### Configure Ingredients
1. Access the web interface
2. Tap **Settings** (gear icon)
3. Go to **Ingredients** tab
4. Enable ingredients corresponding to your pump setup
5. Maximum 4 alcoholic + 4 non-alcoholic + 4 external ingredients

### Language Selection
1. In Settings, go to **Language** tab
2. Choose from English, German, or Hogwarts theme
3. Theme changes automatically with language

## ✅ Verification Checklist

- [ ] Raspberry Pi boots successfully
- [ ] WiFi/Network connection working
- [ ] I2C devices detected (0x20 and 0x26)
- [ ] Web interface accessible
- [ ] All pumps respond to commands
- [ ] Scale provides weight readings
- [ ] Settings panel functional
- [ ] Can prepare test cocktail
- [ ] Kiosk mode working (if enabled)

## 🆘 Troubleshooting

### Common Issues

**I2C devices not detected:**
```bash
# Check I2C is enabled
sudo raspi-config # Interface Options > I2C

# Check wiring connections
# Verify power supply voltages
```

**Web interface not loading:**
```bash
# Check service status
potionmaster status

# Restart services
potionmaster restart

# Check logs for errors
potionmaster logs
```

**Pumps not working:**
```bash
# Check 12V power supply
# Verify relay board connections
# Test individual relays via API
curl -X POST http://localhost:3000/api/hardware/relay/0
```

**Permission issues:**
```bash
# Fix ownership
sudo chown -R potionmaster:potionmaster /home/potionmaster/PotionMaster

# Add user to groups
sudo usermod -a -G i2c,gpio potionmaster
```

## 🔄 Updates and Maintenance

### Update PotionMaster
```bash
potionmaster update
```

### Manual Update
```bash
cd ~/PotionMaster
git pull
./scripts/update.sh
```

### Regular Maintenance
- Clean pumps and tubing regularly
- Check I2C connections
- Monitor system logs
- Update Raspberry Pi OS monthly

## 🎉 Congratulations!

Your PotionMaster is now ready to serve delicious cocktails! 

**Next Steps:**
- Add your favorite cocktail recipes
- Configure your specific ingredients
- Enjoy responsibly! 🍹

For support and updates, visit: https://github.com/yourusername/PotionMaster