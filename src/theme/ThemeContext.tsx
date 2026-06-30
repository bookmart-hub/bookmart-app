import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS, COLORS2, COLORS3 } from '@/constants/colors';

type ThemeName = 'teal' | 'brown' | 'blue';
type ThemeType = typeof COLORS;

interface ThemeContextProps {
  themeName: ThemeName;
  theme: ThemeType;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>('teal');
  const [theme, setTheme] = useState<ThemeType>(COLORS);

  useEffect(() => {
    // Dynamically update the active theme object when name changes
    if (themeName === 'brown') {
      setTheme(COLORS2);
    } else if (themeName === 'blue') {
      setTheme(COLORS3);
    } else {
      setTheme(COLORS);
    }
  }, [themeName]);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
