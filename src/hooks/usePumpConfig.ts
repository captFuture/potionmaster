import { useState, useEffect } from 'react';
import { IngredientConfig } from './useCocktails';

export interface PumpConfig {
  pumpId: number;
  liquid: string;
  enabled: boolean;
  relayChannel: number;
}

const createInitialPumpConfig = (): PumpConfig[] => {
  return Array.from({ length: 8 }, (_, index) => ({
    pumpId: index + 1,
    liquid: '',
    enabled: false,
    relayChannel: index + 1,
  }));
};

export const usePumpConfig = (ingredientConfig?: IngredientConfig) => {
  const [pumpConfig, setPumpConfig] = useState<PumpConfig[]>(createInitialPumpConfig());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run initialization once
    if (isInitialized) return;
    
    const savedConfig = localStorage.getItem('pumpConfig');
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setPumpConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved pump config:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only sync with ingredient config after initialization and when ingredientConfig changes
    if (!isInitialized || !ingredientConfig) return;
    
    const enabledIngredients = Object.entries(ingredientConfig.enabled)
      .filter(([_, enabled]) => enabled)
      .map(([ingredient, _]) => ingredient);
    
    // Check if current config already matches to prevent unnecessary updates
    const currentEnabledLiquids = pumpConfig
      .filter(p => p.enabled)
      .map(p => p.liquid)
      .sort();
    
    const sortedEnabledIngredients = [...enabledIngredients].sort();
    
    // Only update if there's a real change
    if (JSON.stringify(currentEnabledLiquids) !== JSON.stringify(sortedEnabledIngredients)) {
      // Create pump configuration based on enabled ingredients
      const newConfig = createInitialPumpConfig();
      
      // Fill pumps with enabled ingredients (up to 8)
      enabledIngredients.slice(0, 8).forEach((ingredient, index) => {
        newConfig[index] = {
          ...newConfig[index],
          liquid: ingredient,
          enabled: true
        };
      });
      
      // Try to preserve user customizations for enabled ingredients
      pumpConfig.forEach((pump) => {
        const matchingPump = newConfig.find(p => p.pumpId === pump.pumpId);
        if (matchingPump && enabledIngredients.includes(pump.liquid)) {
          matchingPump.liquid = pump.liquid;
          matchingPump.enabled = pump.enabled;
        }
      });
      
      setPumpConfig(newConfig);
      localStorage.setItem('pumpConfig', JSON.stringify(newConfig));
    }
  }, [ingredientConfig, isInitialized, pumpConfig]);

  const updatePumpConfig = (pumpId: number, updates: Partial<PumpConfig>) => {
    const updatedConfig = pumpConfig.map(pump =>
      pump.pumpId === pumpId ? { ...pump, ...updates } : pump
    );
    setPumpConfig(updatedConfig);
    localStorage.setItem('pumpConfig', JSON.stringify(updatedConfig));
  };

  const resetToDefaults = () => {
    if (ingredientConfig) {
      // Reset based on current ingredient config
      const enabledIngredients = Object.entries(ingredientConfig.enabled)
        .filter(([_, enabled]) => enabled)
        .map(([ingredient, _]) => ingredient);
      
      const resetConfig = createInitialPumpConfig();
      enabledIngredients.slice(0, 8).forEach((ingredient, index) => {
        resetConfig[index] = {
          ...resetConfig[index],
          liquid: ingredient,
          enabled: true
        };
      });
      
      setPumpConfig(resetConfig);
      localStorage.setItem('pumpConfig', JSON.stringify(resetConfig));
    } else {
      const resetConfig = createInitialPumpConfig();
      setPumpConfig(resetConfig);
      localStorage.setItem('pumpConfig', JSON.stringify(resetConfig));
    }
  };

  return {
    pumpConfig,
    updatePumpConfig,
    resetToDefaults
  };
};