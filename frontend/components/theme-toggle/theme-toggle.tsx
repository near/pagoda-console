import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

import * as S from './styles';

export const ThemeToggle = () => {
  const [activeTheme, setActiveTheme] = useState('dark');
  const [shouldRender, setShouldRender] = useState(false);
  const darkThemeClass = 'dark-theme';
  const lightThemeClass = 'light-theme';

  useEffect(() => {
    setActiveTheme(localStorage.getItem('theme') || 'dark');
    setShouldRender(true);
  }, []);

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
    <>
      <S.Button data-theme={activeTheme} onClick={() => toggleTheme()} title={buttonTitle}>
        <FontAwesomeIcon icon={activeTheme === 'light' ? faSun : faMoon} />
      </S.Button>
    </>
  );
};
