import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

import { getCssText } from '@/styles/stitches';
import config from '@/utils/config';
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

          {/*
            https://nextjs.org/docs/messages/next-script-for-ga
            
            The following Google Tag Manager inclusion is for the NEAR Foundation.
            Analytics for Pagoda are tracked through Segment.
          */}

          {config.googleTagManagerId && (
            <Script id="gtm" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.googleTagManagerId}');
              `}
            </Script>
          )}
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
