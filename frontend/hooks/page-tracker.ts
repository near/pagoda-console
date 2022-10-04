import { useRouter } from 'next/router';
import { useEffect } from 'react';

import analytics from '@/utils/analytics';

let lastTrackedPage = '';

export function usePageTracker() {
  const router = useRouter();

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

    analytics.pageView(`DC View ${page} Page`, {
      path: router.pathname,
    });
  }, [router.pathname]);
}
