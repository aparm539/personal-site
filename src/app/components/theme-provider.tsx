'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'light' | 'dark';
type Theme = 'gruvbox' | 'purple' | 'blue' | 'red';

interface ThemeContextType {
  mode: Mode;
  theme: Theme;
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark');
  const [theme, setTheme] = useState<Theme>('gruvbox');
  const [mounted, setMounted] = useState(false);

  // Load saved preference on mount, fallback to system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as Mode | null;
    const savedTheme = localStorage.getItem('theme-variant') as Theme | null;
    
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }

    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-variant', theme);
  }, [mode, theme, mounted]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'gruvbox') return 'purple';
      if (prev === 'purple') return 'blue';
      if (prev === 'blue') return 'red';
      return 'gruvbox';
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, setTheme, toggleMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
