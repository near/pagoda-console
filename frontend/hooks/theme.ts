import { useThemeStore } from '@/modules/core/components/ThemeToggle';

export function useTheme() {
  const { activeTheme, colors, setActiveTheme } = useThemeStore();
  return { activeTheme, colors, setActiveTheme };
}
