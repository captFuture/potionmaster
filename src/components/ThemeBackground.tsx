import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import cappuccinoBg from '../assets/cappuccino-bg.webp';
import summerBg from '../assets/summer-bg.webp';
import winterBg from '../assets/winter-bg.webp';
import gryffindorBg from '../assets/gryffindor-bg.webp';
import slytherinBg from '../assets/slytherin-bg.webp';
import ravenclawBg from '../assets/ravenclaw-bg.webp';
import hufflepuffBg from '../assets/hufflepuff-bg.webp';
import retroArcadeBg from '../assets/retro-arcade-bg.webp';
import retroConsoleBg from '../assets/retro-console-bg.webp';

export const ThemeBackground: React.FC = () => {
  const { theme } = useTheme();
  const [currentBg, setCurrentBg] = useState<string>('');

  const getBackgroundImage = () => {
    switch (theme) {
      case 'cappuccino':
        return cappuccinoBg;
      case 'summer':
        return summerBg;
      case 'winter':
        return winterBg;
      case 'gryffindor':
        return gryffindorBg;
      case 'slytherin':
        return slytherinBg;
      case 'ravenclaw':
        return ravenclawBg;
      case 'hufflepuff':
        return hufflepuffBg;
      case 'retro-arcade':
        return retroArcadeBg;
      case 'retro-console':
        return retroConsoleBg;
      default:
        return cappuccinoBg;
    }
  };

  useEffect(() => {
    const newBg = getBackgroundImage();
    console.log('Theme changed to:', theme, 'Background:', newBg);
    setCurrentBg(newBg);
  }, [theme]);

  return (
    <div 
      key={`bg-${theme}-${Date.now()}`}
      className="fixed inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-500"
      style={{
        backgroundImage: `url(${currentBg})`,
      }}
    />
  );
};