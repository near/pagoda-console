import type { Api } from '@pc/common/types/api';

import type { QueryOptions, UseQueryResult as UseRawQueryResult } from '@/hooks/raw-query';
import { useRawQuery } from '@/hooks/raw-query';
import { authenticatedPost, unauthenticatedPost } from '@/utils/http';

export type UseQueryResult<K extends Api.Query.Key> = UseRawQueryResult<Api.Query.Output<K>, Api.Query.Error<K>>;

export const useQuery = <K extends Api.Query.Key>(
  input: Api.Query.Input<K> extends void ? [K] : [K, Api.Query.Input<K>],
  options: QueryOptions<Api.Query.Output<K>, Api.Query.Error<K>> = {},
): UseQueryResult<K> => {
  return useRawQuery<Api.Query.Output<K>, Api.Query.Error<K>>(
    input,
    () =>
      (options.unauth ? unauthenticatedPost : authenticatedPost)<K>(input[0], input[1] as any) as Promise<
        Api.Query.Output<K>
      >,
    options,
  );
};
