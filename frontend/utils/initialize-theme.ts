// https://www.joshwcomeau.com/react/dark-mode/

export const initializeTheme = `
  (function() {
    function getUserPreference() {
      if(window.localStorage.getItem('theme')) {
        return window.localStorage.getItem('theme');
      }
      return 'dark';
    }

    console.log(getUserPreference());

    const themeClass = getUserPreference() === 'dark' ? '.dark-theme' : '.light-theme';

    document.body.classList.add(themeClass);
  })();
`;

/*
  NOTE: If we wanted to respect a user's OS preference for theme, we could update
  initializeTheme() to use window.matchMedia() like so:

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' ;
*/
