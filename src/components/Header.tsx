import React from 'react';
import { Settings, Wifi, Scale, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useAppConfig } from '../hooks/useAppConfig';

// Fallback icons as Unicode symbols
const FallbackIcons = {
  Wifi: '📶',
  Scale: '⚖️',
  Zap: '⚡',
  Settings: '⚙️'
};

export interface ConnectionStatus {
  wifi: boolean;
  scale: boolean;
  relay: boolean;
}

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ connectionStatus, onSettingsClick }) => {
  const { config } = useAppConfig();
  const getStatusColor = (connected: boolean) => 
    connected ? 'text-success' : 'text-error';

  return (
    <header className="h-16 px-3 sm:px-6 flex items-center justify-between bg-gradient-card border-b border-border">
      <div className="flex items-center space-x-2">
        <div className="text-lg sm:text-2xl font-bold text-primary">{config.primaryTitle}</div>
        <div className="hidden sm:block text-sm text-muted-foreground">{config.secondaryTitle} v1.0.0</div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Connection Status Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 ${getStatusColor(connectionStatus.wifi)}`}>
            <Wifi className="h-full w-full" />
          </div>
          <div className={`flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 ${getStatusColor(connectionStatus.scale)}`}>
            <Scale className="h-full w-full" />
          </div>
          <div className={`flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 ${getStatusColor(connectionStatus.relay)}`}>
            <Zap className="h-full w-full" />
          </div>
        </div>
        
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="touch-button"
        >
          <div className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6">
            <Settings className="h-full w-full" />
          </div>
        </Button>
      </div>
    </header>
  );
};