import '@/styles/reset.css';
import '@/styles/fonts.css';
import '@/styles/variables.css';
import '@/styles/global.css';
import '@/styles/enhanced-api.scss';
import '@/styles/near-wallet-selector.scss';

import * as FullStory from '@fullstory/browser';
import { initializeApp } from 'firebase/app';
import Gleap from 'gleap';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { FeatherIconSheet } from '@/components/lib/FeatherIcon';
import { Toaster } from '@/components/lib/Toast';
import { useAnalytics } from '@/hooks/analytics';
import { useAuth, useAuthSync } from '@/hooks/auth';
import { DowntimeMode } from '@/modules/core/components/DowntimeMode';
import SmallScreenNotice from '@/modules/core/components/SmallScreenNotice';
import { useSettingsStore } from '@/stores/settings';
import analytics from '@/utils/analytics';
import { initializeNaj } from '@/utils/chain-data';
import config from '@/utils/config';
import { hydrateAllStores } from '@/utils/hydrate-all-stores';
import { customErrorRetry } from '@/utils/swr';
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

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  useAuthSync();
  useAnalytics();
  const { identity } = useAuth();
  const router = useRouter();
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

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
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
    </SWRConfig>
  );
}

export default withLDProvider({
  clientSideID: config.launchDarklyEnv,
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
})(appWithTranslation(MyApp) as ComponentType);
