// import '../styles/customBootstrap.scss'
import '../styles/globals.scss'
import { ReactElement, ReactNode, useEffect } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { useSWRConfig, SWRConfig } from 'swr'
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { customErrorRetry, onError } from '../utils/fetchers'
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

initializeApp(config.firebaseConfig);

// mixpanel initialization
import mixpanel from 'mixpanel-browser';
import { usePageTracker } from '../utils/hooks'

// Enabling the debug mode flag is useful during implementation,
// but it's recommended you remove it for production
// mixpanel.init(config.mixpanelToken, { debug: true }); // TODO (P2+) enable debug mode in non-prod envs
mixpanel.init(config.mixpanelToken);

const unauthedPaths = ['/', '/register'];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  // redirect to login if user is not signed in
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
  }, []);

  useEffect(() => {
    //* Note: this is saving the current path + query params on unmount of the current component.
    return () => window.sessionStorage.setItem("lastVisitedPath", router.asPath);
  }, [router.asPath]);

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

  // Redirect on API errors.
  useEffect(() => {
    window.sessionStorage.setItem('redirected', 'true');
    const redirect = window.sessionStorage.getItem('redirectPath');
    if (redirect) {
      window.sessionStorage.setItem('redirectPath', '');
      // Redirected component can use redirected to display a notification.
      window.sessionStorage.setItem('redirected', 'true');
      router.push(redirect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const getFooter = Component.getFooter ?? (() => null);
  return <SSRProvider>
    <SWRConfig
      value={{
        onErrorRetry: customErrorRetry,
        onError
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
