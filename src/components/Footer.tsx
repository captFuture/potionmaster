import React from 'react';
import { Button } from './ui/button';
import { useHardware } from '../hooks/useHardware';

interface FooterProps {
  scaleWeight: number;
  onTareScale: () => void;
  onDebugTouch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ scaleWeight, onTareScale, onDebugTouch }) => {
  const { stopAllPumps } = useHardware();
  return (
    <footer className="h-16 px-3 sm:px-6 flex items-center justify-between bg-gradient-card border-t border-border">
      <div className="flex items-center space-x-2">
        <div className="text-xs sm:text-sm text-muted-foreground">
          © MrTarantl
        </div>
        <Button
          variant="destructive"
          onClick={stopAllPumps}
          className="text-xs py-1 px-2 h-8"
          size="sm"
        >
          Stop All
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="text-sm sm:text-lg font-mono">
          {scaleWeight.toFixed(1)}g
        </div>
        <Button
          variant="secondary"
          onClick={onTareScale}
          className="touch-button text-xs sm:text-sm"
          size="sm"
        >
          Tare
        </Button>
        
        {/* Invisible debug touch area */}
        <div
          className="w-8 h-8 sm:w-12 sm:h-12 opacity-0 cursor-pointer"
          onClick={onDebugTouch}
        />
      </div>
    </footer>
  );
};