import useSWR from 'swr';
import type { SWRConfiguration } from 'swr/dist/types';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { ApiKey } from '@/utils/types';

export function useApiKeys(project: string | undefined, swrOptions?: SWRConfiguration) {
  const identity = useIdentity();
  const {
    data: keys,
    error,
    mutate,
  } = useSWR<ApiKey[]>(
    identity && project ? ['/projects/getKeys', project, identity.uid] : null,
    (key, project) => {
      return authenticatedPost(key, { project });
    },
    swrOptions,
  );

  return { keys, error, mutate };
}
