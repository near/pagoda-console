import useSWR from 'swr';

import { fetchApi } from '@/utils/http';

export function useDestinations(projectSlug: string | undefined) {
  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(projectSlug ? ['/alerts/listDestinations' as const, projectSlug] : null, (key) => {
    return fetchApi([key, { projectSlug: projectSlug! }]);
  });

  return { destinations, error, mutate, isValidating };
}
