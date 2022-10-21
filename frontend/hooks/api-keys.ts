import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';
import type { Fetcher, SWRConfiguration } from 'swr/dist/types';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

type ApiKeys = Api.Query.Output<'/projects/getKeys'>;

export function useApiKeys(
  project: string | undefined,
  swrOptions?: SWRConfiguration<ApiKeys, Api.Query.Error<'/projects/getKeys'>, Fetcher<ApiKeys>>,
) {
  const { identity } = useIdentity();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getKeys', project, identity.uid] : null,
    (key: '/projects/getKeys', project: string) => {
      return authenticatedPost(key, { project });
    },
    swrOptions,
  );

  return { keys, error, mutate };
}
