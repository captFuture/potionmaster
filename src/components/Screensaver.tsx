import React from 'react';
import { useAppConfig } from '../hooks/useAppConfig';

interface ScreensaverProps {
  onTouch: () => void;
}

export const Screensaver: React.FC<ScreensaverProps> = ({ onTouch }) => {
  const { config } = useAppConfig();
  
  return (
    <div 
      className="w-full h-screen bg-black flex items-center justify-center cursor-pointer"
      onClick={onTouch}
    >
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center magical-glow">
          <span className="text-6xl">🧪</span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2 magical-float">
          {config.primaryTitle}
        </h1>
        <p className="text-xl text-muted-foreground">
          Touch to wake
        </p>
      </div>
    </div>
  );
};