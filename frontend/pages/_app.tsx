import '../styles/globals.scss';
import '../public/fonts/fonts.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { config as svgConfig } from '@fortawesome/fontawesome-svg-core';
svgConfig.autoAddCss = false;

import { SSRProvider } from '@restart/ui/ssr'; // workaround for react-bootstrap bug https://github.com/react-bootstrap/react-bootstrap/issues/6026
import { initializeApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';

import config from '@/utils/config';
import { customErrorRetry } from '@/utils/swr';
import type { NextPageWithLayout } from '@/utils/types';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

initializeApp(config.firebaseConfig);

import DowntimeMode from '@/components/DowntimeMode';
import SimpleLayout from '@/components/SimpleLayout';
import SmallScreenNotice from '@/components/SmallScreenNotice';
import { usePageTracker } from '@/hooks/page-tracker';
import analytics from '@/utils/analytics';
import { initializeNaj } from '@/utils/chain-data';

analytics.init();

const unauthedPaths = ['/', '/register'];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // redirect to login if user is not signed in
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageTracker();
  // must cast cache to any to work around bug in interface definition
  // https://github.com/vercel/swr/discussions/1494
  const { cache }: { cache: any } = useSWRConfig();
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        analytics.identify(user.uid);
      } else if (!user && !unauthedPaths.includes(router.pathname)) {
        // user is signed out, clear all data and redirect back to login
        analytics.reset();
        cache.clear();
        router.push('/');
      }
    });

    return () => unsubscribe(); // TODO why lambda function?
  }, [router, cache]);

  // always initialize naj on app load
  useEffect(() => {
    initializeNaj();
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const getFooter = Component.getFooter ?? (() => null);

  return (
    <SSRProvider>
      <SWRConfig
        value={{
          onErrorRetry: customErrorRetry,
        }}
      >
        <Head>
          <title>Pagoda Developer Console</title>
          <meta
            name="description"
            content="Developer Console helps you create and maintain dApps by providing interactive tutorials, scalable infrastructure, and operational metrics."
          />
          <link rel="icon" href="/favicon.ico" />
          <link href="/favicon-256x256.png" rel="apple-touch-icon" />
        </Head>

        {config.downtimeMode ? (
          <SimpleLayout footer={null}>
            <DowntimeMode />
          </SimpleLayout>
        ) : (
          <>
            <div className="largeScreen">{getLayout(<Component {...pageProps} />, getFooter())}</div>
            <div className="smallScreen">
              <SmallScreenNotice />
            </div>
          </>
        )}

        <style jsx>{`
          .smallScreen {
            display: none;
          }

          @media only screen and (max-width: 61.9rem) {
            .largeScreen {
              display: none;
            }
            .smallScreen {
              display: block;
            }
          }
        `}</style>
      </SWRConfig>
    </SSRProvider>
  );
}

export default appWithTranslation(MyApp);
