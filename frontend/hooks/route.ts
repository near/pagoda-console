import router, { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useRouteParam(paramName: string, redirectIfMissing?: string, replace?: boolean): string | null {
  const { query, isReady } = useRouter();
  const rawParam = query[paramName];
  const value = rawParam && typeof rawParam === 'string' ? rawParam : null;

  useEffect(() => {
    if (isReady && !value && redirectIfMissing) {
      if (replace) {
        router.replace(redirectIfMissing);
      } else {
        router.push(redirectIfMissing);
      }
    }
  }, [value, isReady, redirectIfMissing, replace]);

  return value;
}
