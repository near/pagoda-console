import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { authenticatedPost } from '@/utils/http';

export function useEnvironments(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: environments,
    error,
    mutate,
  } = useSWR(identity && project && ['/projects/getEnvironments' as const, project, identity.uid], (key, project) => {
    return authenticatedPost(key, {
      project,
    });
  });

  return { environments, error, mutate };
}
