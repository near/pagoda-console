import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { api } from '@/utils/api';

export function useDestinations(projectSlug: string | undefined) {
  const { identity } = useAuth();

  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(
    identity && projectSlug ? ['/alerts/listDestinations' as const, projectSlug, identity.uid] : null,
    (path, projectSlug) => {
      return api.query(path, { projectSlug });
    },
  );

  return { destinations, error, mutate, isValidating };
}
