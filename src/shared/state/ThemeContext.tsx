import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemePalette {
  background: string;
  backgroundAccent: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  muted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  accentContrast: string;
  heroGradient: string;
  canvasGradient: string;
  buttonGradient: string;
  success: string;
  error: string;
  warning: string;
  shadow: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const lightPalette: ThemePalette = {
  background: '#f8f9fa',
  backgroundAccent: '#f1f3f4',
  surface: '#ffffff',
  surfaceAlt: 'rgba(255, 255, 255, 0.8)',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  muted: '#f3f4f6',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  accent: '#111827',
  accentStrong: '#0a0a0a',
  accentContrast: '#ffffff',
  heroGradient:
    'linear-gradient(135deg, rgba(10, 10, 10, 0.92) 0%, rgba(26, 26, 26, 0.82) 100%), url("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80")',
  canvasGradient: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)',
  buttonGradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  success: '#16a34a',
  error: '#dc2626',
  warning: '#f59e0b',
  shadow: '0 28px 70px rgba(17, 24, 39, 0.18)'
};

const darkPalette: ThemePalette = {
  background: '#111111',
  backgroundAccent: '#1a1a1a',
  surface: '#161616',
  surfaceAlt: 'rgba(22, 22, 22, 0.78)',
  border: 'rgba(229, 231, 235, 0.1)',
  borderStrong: 'rgba(229, 231, 235, 0.2)',
  muted: 'rgba(229, 231, 235, 0.08)',
  textPrimary: '#f5f5f5',
  textSecondary: '#e5e7eb',
  textMuted: '#9ca3af',
  accent: '#f5f5f5',
  accentStrong: '#d1d5db',
  accentContrast: '#0a0a0a',
  heroGradient:
    'linear-gradient(135deg, rgba(5, 5, 5, 0.9) 0%, rgba(26, 26, 26, 0.78) 100%), url("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1770&q=80")',
  canvasGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
  buttonGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e5e7eb 100%)',
  success: '#22c55e',
  error: '#f87171',
  warning: '#fbbf24',
  shadow: '0 28px 70px rgba(0, 0, 0, 0.45)'
};

const palettes: Record<ThemeMode, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette
};

const STORAGE_KEY = 'designia-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const cssVariableMap: Array<[keyof ThemePalette, string]> = [
  ['background', '--color-background'],
  ['backgroundAccent', '--color-background-accent'],
  ['surface', '--color-surface'],
  ['surfaceAlt', '--color-surface-alt'],
  ['border', '--color-border'],
  ['borderStrong', '--color-border-strong'],
  ['muted', '--color-muted'],
  ['textPrimary', '--color-text-primary'],
  ['textSecondary', '--color-text-secondary'],
  ['textMuted', '--color-text-muted'],
  ['accent', '--color-accent'],
  ['accentStrong', '--color-accent-strong'],
  ['accentContrast', '--color-accent-contrast'],
  ['heroGradient', '--gradient-hero'],
  ['canvasGradient', '--gradient-canvas'],
  ['buttonGradient', '--gradient-button'],
  ['success', '--color-success'],
  ['error', '--color-error'],
  ['warning', '--color-warning'],
  ['shadow', '--shadow-elevated']
];

const resolveInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialMode());

  useEffect(() => {
    const root = document.documentElement;
    const palette = palettes[mode];

    root.dataset.theme = mode;

    cssVariableMap.forEach(([tokenKey, variableName]) => {
      const value = palette[tokenKey];
      root.style.setProperty(variableName, value);
    });

    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      setMode((prev) => {
        const next = event.matches ? 'dark' : 'light';
        return prev === next ? prev : next;
      });
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    tokens: palettes[mode],
    setMode,
    toggleMode
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
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
