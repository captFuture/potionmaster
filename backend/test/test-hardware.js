#!/usr/bin/env node

const HardwareManager = require('../src/hardware/HardwareManager');

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testHardware() {
  console.log('🔧 PotionMaster Hardware Test Suite');
  console.log('='.repeat(50));

  const hardware = new HardwareManager();

  // Give hardware a moment to initialize
  await sleep(500);

  console.log('\n📡 Initial Hardware Status:');
  const initialStatus = hardware.getStatus();
  console.log(initialStatus);

  // Test Scale
  console.log('\n⚖️  Testing Scale (tare + read)...');
  try {
    await hardware.tareScale();
    console.log('✅ Tare command sent. Sampling weight for 1s...');
    for (let i = 0; i < 10; i++) {
      await sleep(100);
      process.stdout.write(`\rWeight: ${hardware.currentWeight.toFixed(2)} g   `);
    }
    process.stdout.write('\n');
    console.log('✅ Scale test passed');
  } catch (error) {
    console.error('❌ Scale test failed:', error.message);
  }

  // Test individual relays
  console.log('\n🔌 Testing Relays (0-7)...');
  for (let relay = 0; relay < 8; relay++) {
    try {
      process.stdout.write(`Relay ${relay}: ON  \r`);
      await hardware.setRelay(relay, true);
      await sleep(250);
      process.stdout.write(`Relay ${relay}: OFF \r`);
      await hardware.setRelay(relay, false);
      await sleep(150);
      process.stdout.write(`Relay ${relay}: OK  \n`);
    } catch (error) {
      console.error(`Relay ${relay} failed:`, error.message);
    }
  }

  console.log('\n🧹 Ensuring all relays are OFF...');
  await hardware.allRelaysOff();

  console.log('\n🎯 Hardware test completed');
  console.log('='.repeat(50));

  await hardware.shutdown();
}

if (require.main === module) {
  testHardware();
}

module.exports = testHardware;
