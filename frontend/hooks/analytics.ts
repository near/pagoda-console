import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import { useQuery } from '@/hooks/query';
import analytics from '@/utils/analytics';

import { useBrowserLayoutEffect } from './browser-layout-effect';

let lastTrackedPage = '';

export function useAnalytics() {
  const router = useRouter();
  const userQuery = useQuery(['/users/getAccountDetails']);

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

  useEffect(() => {
    const user = userQuery.data;
    if (user) {
      // https://segment.com/docs/connections/spec/best-practices-identify/

      analytics.identify(user.uid!, {
        email: user.email,
        displayName: user.name,
        userId: user.uid,
      });
    }
  }, [userQuery.data]);

  useGlobalClickTracker();
}

function useGlobalClickTracker() {
  const hoveredElementRef = useRef<HTMLElement | null>();

  /*
    NOTE 1: Due to how the Radix Dropdown Menu Trigger makes it impossible to directly capture the
    "click" event, we have to get creative with a "hoveredElementRef" fallback.

    NOTE 2: Sometimes <button> elements might contain child elements (eg: <span>, <svg>), these
    child elements emit the click event, which means we need to traverse up the "parentElement"
    at least twice to make sure we correctly capture the "data-stable-id" attribute.
  */

  function clickHandler(event: MouseEvent) {
    if (event.target instanceof Element) {
      const element = [
        event.target,
        event.target.parentElement,
        event.target.parentElement?.parentElement,
        hoveredElementRef.current,
        hoveredElementRef.current?.parentElement,
        hoveredElementRef.current?.parentElement?.parentElement,
      ].find((el) => el?.hasAttribute('data-stable-id'));

      if (element) {
        const componentType = element.tagName.toLowerCase() === 'a' ? 'Link' : 'Button';
        const stableId = element.getAttribute('data-stable-id');

        analytics.track(`DC ${componentType} Clicked`, {
          stableId,
        });
      }
    }
  }

  function mouseoverHandler(event: MouseEvent) {
    if (event.target instanceof Element) {
      hoveredElementRef.current = event.target as HTMLElement;
    } else {
      hoveredElementRef.current = null;
    }
  }

  useBrowserLayoutEffect(() => {
    window.addEventListener('click', clickHandler);
    document.body.addEventListener('mouseover', mouseoverHandler);

    return () => {
      window.removeEventListener('click', clickHandler);
      document.body.removeEventListener('mouseover', mouseoverHandler);
    };
  });
}
