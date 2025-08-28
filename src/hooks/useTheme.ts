import { useState, useEffect } from 'react';

export type Theme = 'cappuccino' | 'summer' | 'winter' | 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff' | 'retro-arcade' | 'retro-console';

export const useTheme = () => {
  // Initialize theme from localStorage immediately to prevent flashing
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      if (savedTheme) {
        // Set the data-theme attribute immediately
        document.documentElement.setAttribute('data-theme', savedTheme);
        return savedTheme;
      }
    }
    document.documentElement.setAttribute('data-theme', 'cappuccino');
    return 'cappuccino';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Ensure the data-theme attribute is set on mount
    document.documentElement.setAttribute('data-theme', theme);
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