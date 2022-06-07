import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';

import { FeatherIcon } from '../lib/FeatherIcon';
import type { Theme } from './store';
import { useThemeStore } from './store';
import * as S from './styles';

type Props = ComponentProps<typeof S.Button>;

export const ThemeToggle = (props: Props) => {
  const { activeTheme, setActiveTheme } = useThemeStore();
  const [shouldRender, setShouldRender] = useState(false);
  const darkThemeClass = 'dark-theme';
  const lightThemeClass = 'light-theme';

  useEffect(() => {
    const theme = (localStorage.getItem('theme') || 'dark') as Theme;
    setActiveTheme(theme);
    setShouldRender(true);
  }, [setActiveTheme]);

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
    <S.Button type="button" data-theme={activeTheme} onClick={() => toggleTheme()} aria-label={buttonTitle} {...props}>
      <FeatherIcon icon={activeTheme === 'light' ? 'sun' : 'moon'} />
      {activeTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
    </S.Button>
  );
};
