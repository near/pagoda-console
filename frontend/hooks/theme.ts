import { useThemeStore } from '@/modules/core/components/ThemeToggle';

export function useTheme() {
  const { activeTheme, colors } = useThemeStore();
  return { activeTheme, colors };
}
