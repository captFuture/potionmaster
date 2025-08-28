import React from 'react';
import { useTheme } from '../hooks/useTheme';
import retroArcadeBg from '../assets/retro-arcade-bg.webp';
import retroConsoleBg from '../assets/retro-console-bg.webp';

export const ThemeBackground: React.FC = () => {
  const { theme } = useTheme();

  const getBackgroundImage = () => {
    switch (theme) {
      case 'retro-arcade':
        return retroArcadeBg;
      case 'retro-console':
        return retroConsoleBg;
      default:
        return null;
    }
  };

  const backgroundImage = getBackgroundImage();

  if (!backgroundImage) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-0 opacity-100 bg-cover bg-center bg-no-repeat pointer-events-none"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        //filter: 'blur(1px)'
      }}
    />
  );
};