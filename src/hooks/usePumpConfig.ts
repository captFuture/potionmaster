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

  useEffect(() => {
    // Load from localStorage on initialization or sync with ingredient config
    const savedConfig = localStorage.getItem('pumpConfig');
    
    if (ingredientConfig) {
      // Only update if ingredientConfig actually changed
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
        
        // If we have saved config, try to preserve user customizations for enabled ingredients
        if (savedConfig) {
          try {
            const saved = JSON.parse(savedConfig);
            saved.forEach((savedPump: PumpConfig) => {
              const matchingPump = newConfig.find(p => p.pumpId === savedPump.pumpId);
              if (matchingPump && enabledIngredients.includes(savedPump.liquid)) {
                matchingPump.liquid = savedPump.liquid;
                matchingPump.enabled = savedPump.enabled;
              }
            });
          } catch (error) {
            console.error('Failed to parse saved pump config:', error);
          }
        }
        
        setPumpConfig(newConfig);
        localStorage.setItem('pumpConfig', JSON.stringify(newConfig));
      }
    } else if (savedConfig && pumpConfig.length === 8 && pumpConfig.every(p => !p.enabled)) {
      // Only load from localStorage if we haven't already loaded
      try {
        setPumpConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved pump config:', error);
      }
    }
  }, [ingredientConfig]);

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