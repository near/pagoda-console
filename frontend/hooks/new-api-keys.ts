import type { Api } from '@pc/common/types/api';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

type Keys = Api.Query.Output<'/projects/getKeys'>;

export function useApiKeys(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(identity && project ? ['/projects/getKeys' as const, project, identity.uid] : null, (key, project) => {
    return fetchApi([key, { project: project! }]);
  });

  return { keys, error, mutate: mutate as KeyedMutator<Keys> };
}
