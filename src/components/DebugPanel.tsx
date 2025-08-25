import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Scale, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ConnectionStatus } from './Header';
import { api } from '../lib/api';

interface DebugPanelProps {
  connectionStatus: ConnectionStatus;
  onBack: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  connectionStatus,
  onBack
}) => {
  const [i2cDevices, setI2cDevices] = useState<string[]>([]);
  const [scaleWeight, setScaleWeight] = useState(0);
  const [relayStatus, setRelayStatus] = useState(0xFF);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    scanI2CDevices();
  }, []);

  const scanI2CDevices = async () => {
    try {
      const response = await fetch(`${api('/api/hardware/status')}`);
      const data = await response.json();
      // Mock I2C devices based on hardware status
      const devices = [];
      if (data.relayStates) devices.push('0x20: PCF8574 (Relay Board)');
      if (typeof data.weight === 'number') devices.push('0x26: M5Stack MiniScale');
      setI2cDevices(devices);
      addTestResult(`I2C scan: Found ${devices.length} devices`);
    } catch (error) {
      addTestResult('I2C scan failed: ' + error);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testScale = async () => {
    try {
      const response = await fetch(`${api('/api/hardware/status')}`);
      const data = await response.json();
      if (typeof data.weight === 'number') {
        addTestResult(`Scale test: PASS - Weight: ${data.weight}g`);
        setScaleWeight(data.weight);
      } else {
        addTestResult('Scale test: FAIL - No weight data');
      }
    } catch (error) {
      addTestResult('Scale test failed: ' + error);
    }
  };

  const testRelay = async (channel: number) => {
    try {
      // Turn relay on for 2 seconds then off
      const onResponse = await fetch(`${api('/api/hardware/relay')}/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: true })
      });
      if (onResponse.ok) {
        addTestResult(`Relay ${channel + 1}: ON`);
        setTimeout(async () => {
          const offResponse = await fetch(`${api('/api/hardware/relay')}/${channel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: false })
          });
          if (offResponse.ok) {
            addTestResult(`Relay ${channel + 1}: OFF`);
          }
        }, 2000);
      } else {
        addTestResult(`Relay ${channel + 1} test: FAIL`);
      }
    } catch (error) {
      addTestResult(`Relay ${channel + 1} test failed: ` + error);
    }
  };

  const tareScale = async () => {
    try {
      const response = await fetch(`${api('/api/hardware/tare')}`, {
        method: 'POST'
      });
      if (response.ok) {
        addTestResult('Scale tared successfully');
      } else {
        addTestResult('Scale tare failed');
      }
    } catch (error) {
      addTestResult('Scale tare error: ' + error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-warning">Hardware Debug</h1>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Connection Status */}
        <Card className="glass-card">
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Connection Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>WiFi:</span>
                <span className={connectionStatus.wifi ? 'text-success' : 'text-error'}>
                  {connectionStatus.wifi ? '✓ Online' : '✗ Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Scale:</span>
                <span className={connectionStatus.scale ? 'text-success' : 'text-error'}>
                  {connectionStatus.scale ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relay:</span>
                <span className={connectionStatus.relay ? 'text-success' : 'text-error'}>
                  {connectionStatus.relay ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* I2C Devices */}
        <Card className="glass-card">
          <div className="p-4">
            <h3 className="font-semibold mb-4">I2C Devices</h3>
            <div className="space-y-1 text-sm">
              {i2cDevices.length > 0 ? (
                i2cDevices.map((device, index) => (
                  <div key={index} className="font-mono">
                    {device}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No devices found</div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={scanI2CDevices}
              className="mt-3 w-full"
            >
              Rescan
            </Button>
          </div>
        </Card>

        {/* Hardware Tests */}
        <Card className="glass-card">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Hardware Tests</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testScale}
                className="w-full"
                disabled={!connectionStatus.scale}
              >
                <Scale className="h-3 w-3 mr-2" />
                Test Scale
              </Button>
              
              <div className="text-xs text-muted-foreground mb-2">
                Weight: {scaleWeight.toFixed(1)}g
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={tareScale}
                className="w-full"
                disabled={!connectionStatus.scale}
              >
                Tare Scale
              </Button>
            </div>
          </div>
        </Card>

        {/* Relay Tests */}
        <Card className="glass-card col-span-2">
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Relay Tests
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => testRelay(i)}
                  disabled={!connectionStatus.relay}
                  className="text-xs"
                >
                  Test R{i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await fetch(`${api('/api/hardware/relay/all-off')}`, { method: 'POST' });
                  addTestResult('All relays turned OFF');
                } catch (error) {
                  addTestResult('Failed to turn off all relays: ' + error);
                }
              }}
              disabled={!connectionStatus.relay}
              className="text-xs mt-2 w-full"
            >
              Turn All OFF
            </Button>
            <div className="mt-3 text-xs font-mono">
              Status: 0x{relayStatus.toString(16).padStart(2, '0').toUpperCase()}
            </div>
          </div>
        </Card>

        {/* Test Results Log */}
        <Card className="glass-card">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Test Log</h3>
            <div className="space-y-1 text-xs font-mono h-32 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-muted-foreground">
                  {result}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestResults([])}
              className="mt-2 w-full text-xs"
            >
              Clear Log
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};