import Document, { Html, Head, Main, NextScript } from 'next/document'

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
          <link
            href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=optional"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=optional"
            rel="stylesheet"
          />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument