// import '../styles/customBootstrap.scss'
import '../styles/globals.scss'
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
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

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return <SSRProvider>{getLayout(<Component {...pageProps} />)}</SSRProvider>
}

import { appWithTranslation } from 'next-i18next';
export default appWithTranslation(MyApp);
