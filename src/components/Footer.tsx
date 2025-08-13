import React from 'react';
import { Button } from './ui/button';

interface FooterProps {
  scaleWeight: number;
  onTareScale: () => void;
  onDebugTouch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ scaleWeight, onTareScale, onDebugTouch }) => {
  return (
    <footer className="h-16 px-6 flex items-center justify-between bg-gradient-card border-t border-border">
      <div className="text-sm text-muted-foreground">
        © MrTarantl
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-lg font-mono">
          {scaleWeight.toFixed(1)}g
        </div>
        <Button
          variant="secondary"
          onClick={onTareScale}
          className="touch-button"
        >
          Tare
        </Button>
        
        {/* Invisible debug touch area */}
        <div
          className="w-12 h-12 opacity-0 cursor-pointer"
          onClick={onDebugTouch}
        />
      </div>
    </footer>
  );
};