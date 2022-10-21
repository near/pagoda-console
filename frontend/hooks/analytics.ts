import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import analytics from '@/utils/analytics';

import { useAccount } from './user';

let lastTrackedPage = '';

export function useAnalytics() {
  const router = useRouter();
  const { authenticationStatus, user } = useAccount();
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

    if (
      page === lastTrackedPage ||
      authenticationStatus === 'LOADING' ||
      (authenticationStatus === 'AUTHENTICATED' && !hasIdentified)
    )
      return;

    lastTrackedPage = page;
    analytics.setAnonymousId();
    analytics.pageView(`DC View ${page} Page`, {
      path: router.pathname,
    });
  }, [hasIdentified, authenticationStatus, router.pathname]);
}
