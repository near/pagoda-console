import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

export function useEnvironments(project: string | undefined) {
  const { identity } = useIdentity();

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
