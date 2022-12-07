import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';
import type { Fetcher, SWRConfiguration } from 'swr/dist/types';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

type ApiKeys = Api.Query.Output<'/projects/getKeys'>;

export function useApiKeys(
  project: string | undefined,
  swrOptions?: SWRConfiguration<ApiKeys, Api.Query.Error<'/projects/getKeys'>, Fetcher<ApiKeys>>,
) {
  const { identity } = useAuth();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getKeys' as const, project, identity.uid] : null,
    (key, project) => fetchApi([key, { project }]),
    swrOptions,
  );

  return { keys, error, mutate };
}
