import React from 'react';

interface ScreensaverProps {
  onTouch: () => void;
}

export const Screensaver: React.FC<ScreensaverProps> = ({ onTouch }) => {
  return (
    <div 
      className="w-full h-full bg-black flex items-center justify-center cursor-pointer"
      onClick={onTouch}
      style={{ height: '480px', width: '800px' }}
    >
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center magical-glow">
          <span className="text-6xl">🧪</span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2 magical-float">
          Potion Master
        </h1>
        <p className="text-xl text-muted-foreground">
          Touch to wake
        </p>
      </div>
    </div>
  );
};