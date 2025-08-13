#!/usr/bin/env node

const testRelay = require('../../test-relay.js');
const testScale = require('../../test-scale.js');

async function testHardware() {
  console.log('🔧 PotionMaster Hardware Test Suite\n');
  console.log('=' .repeat(50));
  
  console.log('\n📡 Testing I2C Relay Board...');
  try {
    await testRelay();
  } catch (error) {
    console.error('❌ Relay test failed:', error.message);
  }
  
  console.log('\n📡 Testing I2C Scale...');
  try {
    await testScale();
  } catch (error) {
    console.error('❌ Scale test failed:', error.message);
  }
  
  console.log('\n🎯 Hardware test completed');
  console.log('=' .repeat(50));
}

if (require.main === module) {
  testHardware();
}

module.exports = testHardware;