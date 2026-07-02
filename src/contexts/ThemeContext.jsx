import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const THEME_STORAGE_KEY = 'kanban-theme-mode';

const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

const buildTheme = (mode) => createTheme({
  palette: {
    mode,
    todo: {
      main: '#44546F',        // cinza escuro
      contrastText: '#FFFFFF',
    },
    doing: {
      main: '#579DFF',        // azul Jira
      contrastText: '#172B4D', // quase preto/azul escuro
    },
    done: {
      main: '#4BCE97',        // verde Jira
      contrastText: '#172B4D',
    },
  },
});

const getStoredMode = () => {
  if (typeof window === 'undefined') return 'dark';

  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  return storedMode === 'dark' || storedMode === 'light' ? storedMode : 'dark';
};

const subscribeToThemeMode = (callback) => {
  window.addEventListener('storage', callback);
  window.addEventListener('kanban-theme-change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('kanban-theme-change', callback);
  };
};

export const AppThemeProvider = ({ children }) => {
  const mode = useSyncExternalStore(subscribeToThemeMode, getStoredMode, () => 'dark');

  useEffect(() => {
    const storedMode = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedMode !== 'dark' && storedMode !== 'light') {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event('kanban-theme-change'));
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
