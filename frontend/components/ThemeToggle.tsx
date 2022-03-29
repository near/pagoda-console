import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// assets
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

/*
  NOTE: this component must be dynamically loaded with SSR disabled since
  it uses browser APIs.

  import dynamic from 'next/dynamic';

  const ThemeToggle = dynamic(() => import('../components/ThemeToggle'), {
    ssr: false,
  });
*/

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState(document.body.dataset.theme || 'light');
  const inactiveTheme = activeTheme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    document.body.dataset.theme = activeTheme;
    window.localStorage.setItem('theme', activeTheme);
  }, [activeTheme]);

  // TODO add accessibility labels
  return (
    <>
      <Button variant="accent" onClick={() => setActiveTheme(inactiveTheme)}>
        <FontAwesomeIcon icon={activeTheme === 'light' ? faMoon : faSun} />
      </Button>
      <style jsx>{``}</style>
    </>
  );
}
