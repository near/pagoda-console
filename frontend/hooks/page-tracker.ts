import { useRouter } from 'next/router';
import { useEffect } from 'react';

import analytics from '@/utils/analytics';

export function usePageTracker() {
  const router = useRouter();
  // TODO check if we should user router.pathname in effects deps
  // or if it would run twice on transition, once in previous route
  // and once on new route
  useEffect(() => {
    let page;
    if (router.pathname === '/') {
      page = 'login';
    } else {
      page = router.pathname.substring(1);
    }
    page = page.toUpperCase();
    analytics.pageView(`DC View ${page} Page`, {
      path: router.pathname,
    });
  }, [router.pathname]);
}
