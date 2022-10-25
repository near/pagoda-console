import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { authenticatedPost } from '@/utils/http';
import type { Environment } from '@/utils/types';

export function useEnvironment(environmentId: number | undefined) {
  const { identity } = useAuth();

  const {
    data: environment,
    error,
    mutate,
  } = useSWR<Environment>(
    identity && environmentId ? ['/projects/getEnvironmentDetails', environmentId, identity.uid] : null,
    (key, environmentId) => {
      return authenticatedPost(key, { environmentId });
    },
  );

  return { environment, error, mutate };
}

export function useEnvironments(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: environments,
    error,
    mutate,
  } = useSWR<Environment[]>(
    identity && project && ['/projects/getEnvironments', project, identity.uid],
    (key, project) => {
      return authenticatedPost(key, { project });
    },
  );

  return { environments, error, mutate };
}
