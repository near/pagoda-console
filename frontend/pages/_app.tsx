// import '../styles/customBootstrap.scss'
import '../styles/globals.scss'
import { ReactElement, ReactNode, useEffect } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { useSWRConfig, SWRConfig } from 'swr'
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { customErrorRetry } from '../utils/fetchers'
import config from '../utils/config';
import Head from 'next/head'


export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement, footer: ReactElement | null) => ReactNode,
  getFooter?: () => ReactElement
}

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

// initialize Firebase
import { initializeApp } from 'firebase/app';

// workaround for react-bootstrap bug
// https://github.com/react-bootstrap/react-bootstrap/issues/6026
import { SSRProvider } from '@restart/ui/ssr';

const firebaseConfig = {
  apiKey: "AIzaSyCzJ0RAnGO4aQXkoZOSJH6b9psFU9DpQfE",
  authDomain: "near-dev-platform.firebaseapp.com",
  projectId: "near-dev-platform",
  storageBucket: "near-dev-platform.appspot.com",
  messagingSenderId: "1082695133360",
  appId: "1:1082695133360:web:3900d42047e8136937f375"
};
initializeApp(firebaseConfig);

// mixpanel initialization
import mixpanel from 'mixpanel-browser';
import { usePageTracker } from '../utils/hooks'

// Enabling the debug mode flag is useful during implementation,
// but it's recommended you remove it for production
mixpanel.init(config.mixpanelToken, { debug: true }); // ! TODO remove debug flag

const unauthedPaths = ['/', '/register'];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  // redirect to login if user is not signed in
  const router = useRouter();
  usePageTracker();
  // must cast cache to any to work around bug in interface definition
  // https://github.com/vercel/swr/discussions/1494
  const { cache }: { cache: any } = useSWRConfig();
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        mixpanel.identify(user.uid);
      } else if (!user && !unauthedPaths.includes(router.pathname)) {
        // user is signed out, clear all data and redirect back to login
        mixpanel.reset();
        cache.clear();
        router.push('/');
      }
    });

    return () => unsubscribe(); // TODO why lambda function?
  }, [router, cache]);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const getFooter = Component.getFooter ?? (() => null);
  return <SSRProvider>
    <SWRConfig
      value={{
        onErrorRetry: customErrorRetry
      }}
    >
      <Head>
        <title>NEAR Developer Console</title>
        <meta name="description" content="NEAR Developer Console" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {getLayout(<Component {...pageProps} />, getFooter())}
    </SWRConfig>
  </SSRProvider>
}
export default appWithTranslation(MyApp);
