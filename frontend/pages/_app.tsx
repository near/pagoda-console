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

const unauthedPaths = ['/', '/register'];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  // redirect to login if user is not signed in
  const router = useRouter();
  // must cast cache to any to work around bug in interface definition
  // https://github.com/vercel/swr/discussions/1494
  const { cache }: { cache: any } = useSWRConfig();
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user && !unauthedPaths.includes(router.pathname)) {
        // user is signed out, clear all data and redirect back to login
        cache.clear();
        console.log('cache cleared');
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
      {getLayout(<Component {...pageProps} />, getFooter())}
    </SWRConfig>
  </SSRProvider>
}
export default appWithTranslation(MyApp);
