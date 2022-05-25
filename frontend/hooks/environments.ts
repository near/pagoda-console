import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Environment } from '@/utils/types';

export function useEnvironment(environmentId: number | undefined): {
  environment?: Environment;
  error?: any;
  mutate: KeyedMutator<any>;
} {
  // conditionally fetches if valid environmentId is passed
  const identity = useIdentity();
  const {
    data: environment,
    error,
    mutate,
  } = useSWR(
    identity && environmentId ? ['/projects/getEnvironmentDetails', environmentId, identity.uid] : null,
    (key, environmentId) => {
      return authenticatedPost(key, { environmentId });
    },
  );

  return { environment, error, mutate };
}

export function useEnvironments(project: string | undefined): {
  environments?: Environment[];
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: environments,
    error,
    mutate,
  } = useSWR(identity && project && ['/projects/getEnvironments', project, identity.uid], (key, project) => {
    return authenticatedPost(key, { project });
  });

  return { environments, error, mutate };
}
