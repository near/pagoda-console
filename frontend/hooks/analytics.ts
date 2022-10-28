import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import analytics from '@/utils/analytics';

import { useAccount, useAuth } from './auth';

let lastTrackedPage = '';

export function useAnalytics() {
  const router = useRouter();
  const { authStatus } = useAuth();
  const { user } = useAccount();
  const [hasIdentified, setHasIdentified] = useState(false);

  useEffect(() => {
    if (user) {
      // https://segment.com/docs/connections/spec/best-practices-identify/

      analytics.identify(user.uid, {
        email: user.email,
        displayName: user.name,
        userId: user.uid,
      });

      setHasIdentified(true);
    }
  }, [user]);

  useEffect(() => {
    let page;
    if (router.pathname === '/') {
      page = 'login';
    } else {
      page = router.pathname.substring(1);
    }

    page = page.toUpperCase();

    if (page === lastTrackedPage || authStatus === 'LOADING' || (authStatus === 'AUTHENTICATED' && !hasIdentified))
      return;

    lastTrackedPage = page;

    analytics.pageView(`DC View ${page} Page`, {
      path: router.pathname,
    });
  }, [hasIdentified, authStatus, router.pathname]);
}
