import type { ThemeStore } from '@/modules/core/components/ThemeToggle';
import { useThemeStore } from '@/modules/core/components/ThemeToggle';

export function useTheme(): Pick<ThemeStore, 'colors' | 'activeTheme'> {
  const { activeTheme, colors } = useThemeStore();
  return { activeTheme, colors };
}
