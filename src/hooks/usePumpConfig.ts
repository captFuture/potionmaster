import { useState, useEffect } from 'react';

export interface PumpConfig {
  pumpId: number;
  liquid: string;
  enabled: boolean;
  relayChannel: number;
}

const DEFAULT_PUMP_CONFIG: PumpConfig[] = [
  { pumpId: 1, liquid: 'Vodka', enabled: true, relayChannel: 1 },
  { pumpId: 2, liquid: 'Rum', enabled: true, relayChannel: 2 },
  { pumpId: 3, liquid: 'Tonic Water', enabled: true, relayChannel: 3 },
  { pumpId: 4, liquid: 'Cola', enabled: true, relayChannel: 4 },
  { pumpId: 5, liquid: 'Lime Juice', enabled: true, relayChannel: 5 },
  { pumpId: 6, liquid: 'Orange Juice', enabled: true, relayChannel: 6 },
  { pumpId: 7, liquid: 'Cranberry Juice', enabled: true, relayChannel: 7 },
  { pumpId: 8, liquid: 'Sparkling Water', enabled: true, relayChannel: 8 },
];

export const usePumpConfig = () => {
  const [pumpConfig, setPumpConfig] = useState<PumpConfig[]>(DEFAULT_PUMP_CONFIG);

  useEffect(() => {
    // Load from localStorage on initialization
    const savedConfig = localStorage.getItem('pumpConfig');
    if (savedConfig) {
      try {
        setPumpConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved pump config:', error);
      }
    }
  }, []);

  const updatePumpConfig = (pumpId: number, updates: Partial<PumpConfig>) => {
    const updatedConfig = pumpConfig.map(pump =>
      pump.pumpId === pumpId ? { ...pump, ...updates } : pump
    );
    setPumpConfig(updatedConfig);
    localStorage.setItem('pumpConfig', JSON.stringify(updatedConfig));
  };

  const resetToDefaults = () => {
    setPumpConfig(DEFAULT_PUMP_CONFIG);
    localStorage.setItem('pumpConfig', JSON.stringify(DEFAULT_PUMP_CONFIG));
  };

  return {
    pumpConfig,
    updatePumpConfig,
    resetToDefaults
  };
};