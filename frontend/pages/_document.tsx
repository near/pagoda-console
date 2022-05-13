import Document, { Head, Html, Main, NextScript } from 'next/document';

import { getCssText } from '@/styles/stitches';
import { initializeTheme } from '@/utils/initialize-theme';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
          <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
