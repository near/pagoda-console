import router, { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useRouteParam(paramName: string, redirectIfMissing?: string): string | null {
  const { query, isReady } = useRouter();
  const rawParam = query[paramName];
  const value = rawParam && typeof rawParam === 'string' ? rawParam : null;
  useEffect(() => {
    if (isReady && !value && redirectIfMissing) {
      router.push(redirectIfMissing);
    }
  }, [value, isReady, redirectIfMissing]);

  return value;
}
