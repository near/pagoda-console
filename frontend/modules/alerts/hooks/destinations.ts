import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

export function useDestinations(projectSlug: Projects.ProjectSlug) {
  const { identity } = useAuth();

  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/alerts/listDestinations' as const, projectSlug, identity.uid] : null, (key) => {
    return fetchApi([key, { projectSlug }]);
  });

  return { destinations, error, mutate, isValidating };
}
