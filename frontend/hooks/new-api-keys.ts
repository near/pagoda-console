import type { Api } from '@pc/common/types/api';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

type Keys = Api.Query.Output<'/projects/getKeys'>;

export function useApiKeys(project: string | undefined) {
  const { identity } = useIdentity();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(identity && project ? ['/projects/getKeys' as const, project, identity.uid] : null, (key, project) => {
    return authenticatedPost(key, { project });
  });

  return { keys, error, mutate: mutate as KeyedMutator<Keys> };
}
