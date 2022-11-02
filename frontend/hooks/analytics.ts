import { useRouter } from 'next/router';
import { useEffect } from 'react';

import analytics from '@/utils/analytics';

import { useAccount } from './user';

let lastTrackedPage = '';

export function useAnalytics() {
  const router = useRouter();
  const { user } = useAccount();

  useEffect(() => {
    let page;
    if (router.pathname === '/') {
      page = 'login';
    } else {
      page = router.pathname.substring(1);
    }

    page = page.toUpperCase();

    if (page === lastTrackedPage) return;

    lastTrackedPage = page;
    analytics.setAnonymousId();
    analytics.pageView(`DC View ${page} Page`, {
      path: router.pathname,
    });
  }, [router.pathname]);

  useEffect(() => {
    if (user) {
      // https://segment.com/docs/connections/spec/best-practices-identify/

      analytics.identify(user.uid, {
        email: user.email,
        displayName: user.name,
        userId: user.uid,
      });
    }
  }, [user]);
}
