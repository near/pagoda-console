import Document, { Head, Html, Main, NextScript } from 'next/document';

import { getCssText } from '@/styles/stitches';
import { initializeTheme } from '@/utils/initialize-theme';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />

          <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
          <script defer src="https://p5c5wl39l4g2.statuspage.io/embed/script.js"></script>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
