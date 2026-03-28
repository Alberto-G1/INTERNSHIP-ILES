import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeModeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('iles-theme-mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('iles-theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
  }, [mode]);

  const toggleMode = () => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
};
