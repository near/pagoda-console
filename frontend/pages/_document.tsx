import Document, { Head, Html, Main, NextScript } from 'next/document';

import { getCssText } from '@/styles/theme';

class MyDocument extends Document {
  render() {
    // Use this version once it is desired that theme defaults to user's OS-level preference
    // const setInitialTheme = `
    //   function getUserPreference() {
    //     if(window.localStorage.getItem('theme')) {
    //       return window.localStorage.getItem('theme')
    //     }
    //     return window.matchMedia('(prefers-color-scheme: dark)').matches
    //               ? 'dark'
    //               : 'light'
    //   }
    //   document.body.dataset.theme = getUserPreference();
    // `;

    const setInitialTheme = `
      function getUserPreference() {
        if(window.localStorage.getItem('theme')) {
          return window.localStorage.getItem('theme')
        }
        return 'light'
      }
      document.body.dataset.theme = getUserPreference();
    `;

    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
          <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
