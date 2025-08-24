import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface AppConfig {
  primaryTitle: string;
  secondaryTitle: string;
}

const DEFAULT_CONFIG: AppConfig = {
  primaryTitle: 'Potion Master',
  secondaryTitle: 'Mixmagic System'
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Load from localStorage on initialization
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('appConfig', JSON.stringify(updatedConfig));
  };

  const shutdown = async () => {
    try {
      const response = await fetch(`${api('/api/system/shutdown')}`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Shutdown failed:', error);
      return false;
    }
  };

  return {
    config,
    updateConfig,
    shutdown
  };
};