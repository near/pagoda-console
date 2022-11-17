import '@/styles/reset.css';
import '@/styles/fonts.css';
import '@/styles/variables.css';
import '@/styles/global.css';
import '@/styles/enhanced-api.scss';
import '@/styles/near-wallet-selector.scss';

import * as FullStory from '@fullstory/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Gleap from 'gleap';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { FeatherIconSheet } from '@/components/lib/FeatherIcon';
import { Toaster } from '@/components/lib/Toast';
import { useAnalytics } from '@/hooks/analytics';
import { useIdentity } from '@/hooks/user';
import { DowntimeMode } from '@/modules/core/components/DowntimeMode';
import SmallScreenNotice from '@/modules/core/components/SmallScreenNotice';
import { useSettingsStore } from '@/stores/settings';
import analytics from '@/utils/analytics';
import { initializeNaj } from '@/utils/chain-data';
import config from '@/utils/config';
import { hydrateAllStores } from '@/utils/hydrate-all-stores';
import { getShouldRetry, retryDelay } from '@/utils/query';
import type { NextPageWithLayout } from '@/utils/types';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

initializeApp(config.firebaseConfig);
analytics.init();

if (typeof window !== 'undefined') {
  FullStory.init({ orgId: 'o-1A5K4V-na1' });
  if (config.gleapAuth) Gleap.initialize(config.gleapAuth);
}

const unauthedPaths = [
  '/',
  '/register',
  '/ui',
  '/alerts/verify-email',
  '/alerts/unsubscribe-from-email-alert',
  '/pick-project-template/[templateSlug]',
];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  useAnalytics();
  const identity = useIdentity();
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: getShouldRetry([400, 401, 403, 404]),
            retryDelay: retryDelay,
          },
        },
      }),
  );
  const initializeCurrentUserSettings = useSettingsStore((store) => store.initializeCurrentUserSettings);

  useEffect(() => {
    if (identity?.uid) {
      initializeCurrentUserSettings(identity.uid);
    }
  }, [initializeCurrentUserSettings, identity?.uid]);

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  useEffect(() => {
    hydrateAllStores();
  }, []);

  useEffect(() => {
    initializeNaj();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && !unauthedPaths.includes(router.pathname)) {
        analytics.reset();
        queryClient.clear();
        router.replace('/');
      }
    });

    return () => unsubscribe(); // TODO why lambda function?
  }, [router, queryClient]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Pagoda Developer Console</title>
        <meta
          name="description"
          content="Developer Console helps you create and maintain dApps by providing interactive tutorials, scalable infrastructure, and operational metrics."
        />
        <link rel="icon" href="/favicon.ico" />
        <link href="/favicon-256x256.png" rel="apple-touch-icon" />
      </Head>

      <FeatherIconSheet />
      <SmallScreenNotice />
      <Toaster />

      {config.downtimeMode ? (
        <SimpleLayout>
          <DowntimeMode />
        </SimpleLayout>
      ) : (
        getLayout(<Component {...pageProps} />)
      )}
    </QueryClientProvider>
  );
}

export default withLDProvider({
  clientSideID: config.launchDarklyEnv,
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
})(appWithTranslation(MyApp) as ComponentType);
