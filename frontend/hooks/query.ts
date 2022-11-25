import type { Api } from '@pc/common/types/api';
import type {
  InvalidateOptions,
  InvalidateQueryFilters,
  SetDataOptions,
  UseQueryOptions,
  UseQueryResult as UseRawQueryResult,
} from '@tanstack/react-query';
import { useQuery as useRawQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { fetchApi } from '@/utils/http';

export type UseQueryResult<K extends Api.Query.Key> = UseRawQueryResult<Api.Query.Output<K>, Api.Query.Error<K>>;

export const useQuery = <K extends Api.Query.Key>(
  input: Api.Query.Input<K> extends void ? [K] : [K, Api.Query.Input<K>],
  options: {
    unauth?: boolean;
  } & Omit<
    UseQueryOptions<
      Api.Query.Output<K>,
      Api.Query.Error<K>,
      Api.Query.Output<K>,
      Api.Query.Input<K> extends void ? [K] : [K, Api.Query.Input<K>]
    >,
    'queryKey' | 'queryFn'
  > = {},
) => {
  const query = useRawQuery(input, () => fetchApi<K>(input, !options.unauth), options);
  const queryClient = useQueryClient();
  const updateCache = useCallback(
    (updater: (prev?: Api.Query.Output<K>) => Api.Query.Output<K> | undefined, options?: SetDataOptions) =>
      queryClient.setQueryData<Api.Query.Output<K>>(input, updater, options),
    [queryClient, input],
  );
  const invalidateCache = useCallback(
    (filters?: InvalidateQueryFilters<Api.Query.Output<K>>, options?: InvalidateOptions) =>
      queryClient.invalidateQueries<Api.Query.Output<K>>(input, filters, options),
    [queryClient, input],
  );
  return useMemo(() => ({ ...query, updateCache, invalidateCache }), [query, updateCache, invalidateCache]);
};
