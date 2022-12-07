import type { Api } from '@pc/common/types/api';

import type { QueryOptions, UseQueryResult as UseRawQueryResult } from '@/hooks/raw-query';
import { useRawQuery } from '@/hooks/raw-query';
import { fetchApi } from '@/utils/http';

export type UseQueryResult<K extends Api.Query.Key> = UseRawQueryResult<Api.Query.Output<K>, Api.Query.Error<K>>;

export const useQuery = <K extends Api.Query.Key>(
  input: Api.Query.Input<K> extends void ? [K] : [K, Api.Query.Input<K>],
  options: QueryOptions<Api.Query.Output<K>, Api.Query.Error<K>> = {},
): UseQueryResult<K> =>
  useRawQuery<Api.Query.Output<K>, Api.Query.Error<K>>(
    input,
    () => fetchApi(input as Parameters<typeof fetchApi>[0], options.unauth) as Promise<Api.Query.Output<K>>,
    options,
  );
