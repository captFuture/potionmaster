import { useState, useEffect } from 'react';

export type Theme = 'cappuccino' | 'summer' | 'winter' | 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff' | 'retro-arcade' | 'retro-console';

export const useTheme = () => {
  // Initialize theme from localStorage immediately to prevent flashing
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      if (savedTheme) {
        return savedTheme;
      }
    }
    return 'cappuccino';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Set the data-theme attribute on document element immediately
    document.documentElement.setAttribute('data-theme', theme);
    // Also save to localStorage to ensure persistence
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return {
    theme,
    changeTheme
  };
};