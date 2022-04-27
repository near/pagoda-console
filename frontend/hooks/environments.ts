import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Environment } from '@/utils/types';

export function useEnvironment(environmentId?: number): {
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
    (key: string, environmentId: number) => {
      return authenticatedPost(key, { environmentId });
    },
  );

  return { environment, error, mutate };
}

// NOTE: naming here can be cleaned up. The request was changed late in order
// to consolidate multiple calls. This returns closer to a Project record
export function useEnvironments(project: string | null): {
  environmentData?: Environment[];
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: environmentData,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getEnvironments', project, identity.uid] : null,
    (key: string, project: number) => {
      return authenticatedPost(key, { project });
    },
  );

  return { environmentData, error, mutate };
}
