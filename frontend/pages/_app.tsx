import '@/styles/reset.css';
import '@/styles/fonts.css';
import '@/styles/variables.css';
import '@/styles/global.css';
import '@/styles/enhanced-api.scss';
import '@/styles/near-wallet-selector.scss';

import * as FullStory from '@fullstory/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeApp } from 'firebase/app';
import Gleap from 'gleap';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import type { ComponentProps, ComponentType } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { FeatherIconSheet } from '@/components/lib/FeatherIcon';
import { Toaster } from '@/components/lib/Toast';
import { useAnalytics } from '@/hooks/analytics';
import { useAuth, useAuthSync } from '@/hooks/auth';
import { useSelectedProjectRouteParamSync } from '@/hooks/selected-project';
import { DowntimeMode } from '@/modules/core/components/DowntimeMode';
import { useSettingsStore } from '@/stores/settings';
import analytics from '@/utils/analytics';
import { initializeNaj } from '@/utils/chain-data';
import config from '@/utils/config';
import { hydrateAllStores } from '@/utils/hydrate-all-stores';
import { getCustomErrorRetry } from '@/utils/query';
import type { NextPageWithLayout } from '@/utils/types';

const queryClient = new QueryClient();

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
  useSelectedProjectRouteParamSync();
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

  const [swrConfig] = useState<ComponentProps<typeof SWRConfig>['value']>(() => ({
    onErrorRetry: getCustomErrorRetry(),
  }));

  const metaTitle = 'Pagoda Developer Console';
  const metaDescription =
    'Developer Console helps you create and maintain dApps by providing interactive tutorials, scalable infrastructure, and operational metrics.';

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig value={swrConfig}>
        <Head>
          <title>{metaTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
          <meta name="description" content={metaDescription} />
          <meta content={metaTitle} property="og:title" />
          <meta content={metaDescription} property="og:description" />
          <meta content={`${config.url.host}/images/og__pagoda_image.png`} property="og:image" />
          <meta content={metaTitle} property="twitter:title" />
          <meta content={metaDescription} property="twitter:description" />
          <meta content={`${config.url.host}/images/og__pagoda_image.png`} property="twitter:image" />
          <meta content="website" property="og:type" />
          <meta content="summary_large_image" name="twitter:card" />
          <link rel="icon" href="/favicon.ico" />
          <link href="/favicon-256x256.png" rel="apple-touch-icon" />
        </Head>

        <FeatherIconSheet />
        <Toaster />

        {/* 
          When we start using React Query for queries (not just mutations), we could experiment with including the devtools.
          The devtools don't display any information regarding mutations as of now.

          import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
          ...
          {config.deployEnv === 'LOCAL' && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
        */}

        {config.downtimeMode ? (
          <SimpleLayout>
            <DowntimeMode />
          </SimpleLayout>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
      </SWRConfig>
    </QueryClientProvider>
  );
}

export default withLDProvider({
  clientSideID: config.launchDarklyEnv,
  user: {
    key: 'anonymous-placeholder-id',
  },
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
})(appWithTranslation(MyApp) as ComponentType);
