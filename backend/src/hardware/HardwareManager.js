const i2c = require('i2c-bus');

class HardwareManager {
  constructor() {
    this.bus = null;
    this.connected = false;
    this.relayAddress = 0x20;
    this.scaleAddress = 0x26;
    this.weightRegister = 0x10;
    this.tareRegister = 0x50;
    this.currentWeight = 0;
    this.relayStates = Array(8).fill(false);
    this.isPouring = false;
    
    this.init();
  }

  async init() {
    try {
      this.bus = i2c.openSync(1);
      
      // Test relay board
      try {
        this.bus.i2cWriteSync(this.relayAddress, 1, Buffer.from([0xFF]));
        console.log('✅ Relay board connected at 0x20');
      } catch (error) {
        console.log('⚠️ Relay board not found at 0x20');
      }
      
      // Test scale
      try {
        this.bus.receiveByteSync(this.scaleAddress);
        console.log('✅ Scale connected at 0x26');
      } catch (error) {
        console.log('⚠️ Scale not found at 0x26');
      }
      
      this.connected = true;
      this.startWeightMonitoring();
      
    } catch (error) {
      console.error('❌ I2C initialization failed:', error);
      this.connected = false;
    }
  }

  startWeightMonitoring() {
    setInterval(() => {
      this.readWeight();
    }, 100); // Read weight every 100ms
  }

  readWeight() {
    if (!this.connected || !this.bus) return;
    
    try {
      const buffer = Buffer.alloc(4);
      this.bus.readI2cBlockSync(this.scaleAddress, this.weightRegister, 4, buffer);
      this.currentWeight = buffer.readFloatLE(0);
    } catch (error) {
      // Silently fail for now, weight will remain at last known value
    }
  }

  async tareScale() {
    if (!this.connected || !this.bus) {
      throw new Error('Hardware not connected');
    }
    
    try {
      this.bus.writeByteSync(this.scaleAddress, this.tareRegister, 0x1);
      await this.sleep(200); // Wait for tare to complete
      this.readWeight();
      console.log('✅ Scale tared successfully');
    } catch (error) {
      console.error('❌ Tare failed:', error);
      throw new Error('Failed to tare scale');
    }
  }

  async setRelay(relayId, state) {
    if (!this.connected || !this.bus) {
      throw new Error('Hardware not connected');
    }
    
    if (relayId < 0 || relayId > 7) {
      throw new Error('Invalid relay ID');
    }
    
    try {
      this.relayStates[relayId] = state;
      
      // Calculate relay register value (0 = ON, 1 = OFF)
      let relayRegister = 0xFF;
      for (let i = 0; i < 8; i++) {
        if (this.relayStates[i]) {
          relayRegister &= ~(1 << i);
        }
      }
      
      this.bus.i2cWriteSync(this.relayAddress, 1, Buffer.from([relayRegister]));
      console.log(`✅ Relay ${relayId} set to ${state ? 'ON' : 'OFF'}`);
    } catch (error) {
      console.error(`❌ Failed to set relay ${relayId}:`, error);
      throw new Error(`Failed to control relay ${relayId}`);
    }
  }

  async allRelaysOff() {
    if (!this.connected || !this.bus) return;
    
    try {
      this.relayStates.fill(false);
      this.bus.i2cWriteSync(this.relayAddress, 1, Buffer.from([0xFF]));
      console.log('✅ All relays turned OFF');
    } catch (error) {
      console.error('❌ Failed to turn off all relays:', error);
    }
  }

  async startCleaningCycle() {
    if (!this.connected) {
      throw new Error('Hardware not connected');
    }

    console.log('🧽 Starting cleaning cycle...');
    
    try {
      // Turn on each relay for 10 seconds
      for (let relay = 0; relay < 8; relay++) {
        console.log(`🧽 Cleaning pump ${relay + 1}/8...`);
        await this.setRelay(relay, true);
        await this.sleep(10000); // 10 seconds
        await this.setRelay(relay, false);
        await this.sleep(500); // Brief pause between pumps
      }
      
      console.log('✅ Cleaning cycle completed');
    } catch (error) {
      console.error('❌ Cleaning cycle failed:', error);
      await this.allRelaysOff();
      throw new Error('Cleaning cycle failed');
    }
  }

  getStatus() {
    return {
      connected: this.connected,
      weight: this.currentWeight,
      relayStates: [...this.relayStates],
      isPouring: this.isPouring
    };
  }

  async shutdown() {
    if (this.bus) {
      try {
        await this.allRelaysOff();
        this.bus.closeSync();
        this.connected = false;
        console.log('✅ Hardware manager shutdown complete');
      } catch (error) {
        console.error('❌ Error during hardware shutdown:', error);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = HardwareManager;