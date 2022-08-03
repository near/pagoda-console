import { useThemeStore } from '@/modules/core/components/ThemeToggle';

export function useTheme() {
  const theme = useThemeStore();
  return theme;
}
