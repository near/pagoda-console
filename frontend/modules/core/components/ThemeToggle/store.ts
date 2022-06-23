import create from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeStore {
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  activeTheme: 'dark',

  setActiveTheme: (theme) => {
    set({
      activeTheme: theme,
    });
  },
}));
