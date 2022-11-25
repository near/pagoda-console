import type { Api } from '@pc/common/types/api';
import type { InvalidateOptions, InvalidateQueryFilters, SetDataOptions } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export const useQueryCache = <K extends Api.Query.Key>(key: K) => {
  const queryClient = useQueryClient();
  const update = useCallback(
    (
      input: Api.Query.Input<K> extends void ? undefined : Api.Query.Input<K>,
      updater: (prev?: Api.Query.Output<K>) => Api.Query.Output<K> | undefined,
      options?: SetDataOptions,
    ) => queryClient.setQueryData<Api.Query.Output<K>>([key, input], updater, options),
    [queryClient, key],
  );
  const invalidate = useCallback(
    (
      input: Api.Query.Input<K> extends void ? void : Api.Query.Input<K>,
      filters?: InvalidateQueryFilters<Api.Query.Output<K>>,
      options?: InvalidateOptions,
    ) => queryClient.invalidateQueries<Api.Query.Output<K>>([key, input], filters, options),
    [queryClient, key],
  );
  return useMemo(() => ({ update, invalidate }), [update, invalidate]);
};
