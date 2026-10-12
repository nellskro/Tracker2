import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const DARK_THEME = {
  couleur_principale: '#6366f1',
  couleur_secondaire: '#8b5cf6',
  couleur_fond: '#0f172a',
  couleur_cartes: '#1e293b',
  couleur_texte: '#f1f5f9',
  couleur_boutons: '#6366f1',
  couleur_graphiques: '#6366f1',
};

const LIGHT_THEME = {
  couleur_principale: '#4f46e5',
  couleur_secondaire: '#7c3aed',
  couleur_fond: '#f8fafc',
  couleur_cartes: '#ffffff',
  couleur_texte: '#0f172a',
  couleur_boutons: '#4f46e5',
  couleur_graphiques: '#4f46e5',
};

function applyThemeVars(theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.couleur_principale);
  root.style.setProperty('--color-secondary', theme.couleur_secondaire);
  root.style.setProperty('--color-bg', theme.couleur_fond);
  root.style.setProperty('--color-card', theme.couleur_cartes);
  root.style.setProperty('--color-text', theme.couleur_texte);
  root.style.setProperty('--color-buttons', theme.couleur_boutons);
  root.style.setProperty('--color-graphs', theme.couleur_graphiques);
  document.body.style.backgroundColor = theme.couleur_fond;
  document.body.style.color = theme.couleur_texte;
}

export function ThemeProvider({ children }) {
  const [colorMode, setColorModeState] = useState('dark');
  const [activeTheme, setActiveTheme] = useState(DARK_THEME);

  useEffect(() => {
    const saved = localStorage.getItem('colorMode') || 'dark';
    applyColorMode(saved);
  }, []);

  function applyColorMode(mode) {
    localStorage.setItem('colorMode', mode);
    setColorModeState(mode);
    let theme = DARK_THEME;
    if (mode === 'light') {
      theme = LIGHT_THEME;
    } else if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = isDark ? DARK_THEME : LIGHT_THEME;
    }
    applyThemeVars(theme);
    setActiveTheme(theme);
  }

  function activateTheme(theme) {
    applyThemeVars(theme);
    setActiveTheme(theme);
    localStorage.setItem('activeTheme', JSON.stringify(theme));
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, activateTheme, colorMode, setColorMode: applyColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
