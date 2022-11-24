import type { Api } from '@pc/common/types/api';
import { useCallback, useMemo } from 'react';
import { mutate } from 'swr';

export const useQueryCache = <K extends Api.Query.Key>(key: K) => {
  const update = useCallback(
    (
      input: Api.Query.Input<K> extends void ? undefined : Api.Query.Input<K>,
      updater: (prev?: Api.Query.Output<K>) => Api.Query.Output<K> | undefined,
    ) => mutate<Api.Query.Output<K>>([key, input], updater),
    [key],
  );
  const invalidate = useCallback(
    (input: Api.Query.Input<K> extends void ? void : Api.Query.Input<K>) => mutate<Api.Query.Output<K>>([key, input]),
    [key],
  );
  return useMemo(() => ({ update, invalidate }), [update, invalidate]);
};
