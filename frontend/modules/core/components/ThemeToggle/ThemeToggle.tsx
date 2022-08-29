import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';

import { FeatherIcon } from '@/components/lib/FeatherIcon';

import type { Theme } from './store';
import { useThemeStore } from './store';
import * as S from './styles';

type Props = ComponentProps<typeof S.Button>;

export const ThemeToggle = ({ collapsed, ...props }: Props & { collapsed?: boolean }) => {
  const { activeTheme, setActiveTheme, setColors } = useThemeStore();
  const [shouldRender, setShouldRender] = useState(false);
  const darkThemeClass = 'dark-theme';
  const lightThemeClass = 'light-theme';

  useEffect(() => {
    const theme = (localStorage.getItem('theme') || 'dark') as Theme;
    setActiveTheme(theme);
    setShouldRender(true);
  }, [setActiveTheme]);

  useEffect(() => {
    setColors({
      border1: getPropertyValue('--color-border-1'),
      border2: getPropertyValue('--color-border-2'),
      danger: getPropertyValue('--color-danger'),
      mainnet: getPropertyValue('--color-mainnet'),
      primary: getPropertyValue('--color-primary'),
      success: getPropertyValue('--color-success'),
      surface1: getPropertyValue('--color-surface-1'),
      surface2: getPropertyValue('--color-surface-2'),
      surface3: getPropertyValue('--color-surface-3'),
      surface4: getPropertyValue('--color-surface-4'),
      surface5: getPropertyValue('--color-surface-5'),
      surfaceOverlay: getPropertyValue('--color-surface-overlay'),
      testnet: getPropertyValue('--color-testnet'),
      text1: getPropertyValue('--color-text-1'),
      text2: getPropertyValue('--color-text-2'),
      text3: getPropertyValue('--color-text-3'),
      warning: getPropertyValue('--color-warning'),
    });
  }, [setColors, activeTheme]);

  function getPropertyValue(property: string) {
    return getComputedStyle(document.body).getPropertyValue(property);
  }

  function toggleTheme() {
    if (activeTheme === 'dark') {
      document.body.classList.remove(darkThemeClass);
      document.body.classList.add(lightThemeClass);
      localStorage.setItem('theme', 'light');
      setActiveTheme('light');
    } else {
      document.body.classList.remove(lightThemeClass);
      document.body.classList.add(darkThemeClass);
      localStorage.setItem('theme', 'dark');
      setActiveTheme('dark');
    }
  }

  const buttonTitle = `Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode (currently ${activeTheme} mode).`;

  if (!shouldRender) return null;

  return (
    <S.Button
      type="button"
      collapsed={collapsed}
      data-theme={activeTheme}
      onClick={() => toggleTheme()}
      aria-label={buttonTitle}
      css={{ width: collapsed ? 'auto' : '100%' }}
      {...props}
    >
      <FeatherIcon icon={activeTheme === 'light' ? 'sun' : 'moon'} />
      {!collapsed && (activeTheme === 'dark' ? 'Dark Mode' : 'Light Mode')}
    </S.Button>
  );
};
