import { useState, useEffect } from 'react';

export type Theme = 'cappuccino' | 'summer' | 'winter' | 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('cappuccino');

  useEffect(() => {
    // Load from localStorage on initialization
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'cappuccino');
    }
  }, []);

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