// import '../styles/customBootstrap.scss';
import '../styles/globals.scss';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config as svgConfig } from '@fortawesome/fontawesome-svg-core';
svgConfig.autoAddCss = false;

import { FC, useEffect } from 'react';
import { AppProps } from 'next/app';
import { useSWRConfig, SWRConfig } from 'swr';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { customErrorRetry } from '../utils/fetchers';
import config from '../utils/config';
import Head from 'next/head';
import { NextPageWithLayout } from '../utils/types';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// initialize Firebase
import { initializeApp } from 'firebase/app';

// workaround for react-bootstrap bug
// https://github.com/react-bootstrap/react-bootstrap/issues/6026
import { SSRProvider } from '@restart/ui/ssr';

initializeApp(config.firebaseConfig);

// mixpanel initialization
import analytics from '../utils/analytics';
import { initializeNaj } from '../utils/chainData';
import { usePageTracker } from '../utils/hooks';
import SmallScreenNotice from '../components/SmallScreenNotice';

analytics.init();

const unauthedPaths = ['/', '/register'];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // redirect to login if user is not signed in
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
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
          <meta name="description" content="Pagoda Developer Console" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="largeScreen">{getLayout(<Component {...pageProps} />, getFooter())}</div>
        <div className="smallScreen">
          <SmallScreenNotice />
        </div>
        <style jsx>{`
          .smallScreen {
            display: none;
          }

          @media only screen and (max-width: 62rem) {
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
