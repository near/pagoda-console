import create from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeColors {
  border1: string;
  border2: string;
  danger: string;
  mainnet: string;
  primary: string;
  success: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  surface5: string;
  surfaceOverlay: string;
  testnet: string;
  text1: string;
  text2: string;
  text3: string;
  warning: string;
}

export interface ThemeStore {
  activeTheme: Theme;
  colors: ThemeColors;
  setActiveTheme: (theme: Theme) => void;
  setColors: (colors: ThemeColors) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  activeTheme: 'dark',

  colors: {
    border1: '',
    border2: '',
    danger: '',
    mainnet: '',
    primary: '',
    success: '',
    surface1: '',
    surface2: '',
    surface3: '',
    surface4: '',
    surface5: '',
    surfaceOverlay: '',
    testnet: '',
    text1: '',
    text2: '',
    text3: '',
    warning: '',
  },

  setActiveTheme: (theme) =>
    set({
      activeTheme: theme,
    }),

  setColors: (colors) =>
    set({
      colors,
    }),
}));
