import type { KeyedMutator } from 'swr';
import useSWR from 'swr';
import type { SWRConfiguration } from 'swr/dist/types';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';

export function useApiKeys(
  project: string | undefined,
  swrOptions?: SWRConfiguration,
): { keys?: Partial<Record<NetOption, string>>; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: keys,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getKeys', project, identity.uid] : null,
    (key, project) => {
      return authenticatedPost(key, { project });
    },
    swrOptions,
  );

  return { keys, error, mutate };
}
