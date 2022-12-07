import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { BareFetcher, Key, Middleware } from 'swr';
import useSWR, { mutate } from 'swr';
import type { PublicConfiguration } from 'swr/dist/types';

type UseQueryLoadingResult = {
  isLoading: true;
  status: 'loading';
  data: undefined;
  error: null;
};

type UseQueryErrorResult<Error> = {
  isLoading: false;
  status: 'error';
  data: undefined;
  error: Error;
};

type UseQuerySuccessResult<Result> = {
  isLoading: false;
  status: 'success';
  data: Result;
  error: null;
};

export type UseQueryResult<Data, Error> = (
  | UseQueryLoadingResult
  | UseQuerySuccessResult<Data>
  | UseQueryErrorResult<Error>
) & {
  updateCache: (updater: (prev?: Data) => Data | undefined) => void;
  invalidateCache: () => void;
};

export type QueryOptions<Data, Error> = Partial<{
  unauth: boolean;
  refetchInterval: number;
  keepPreviousData: boolean;
  enabled: boolean;
  retry: boolean;
}> &
  Partial<Pick<PublicConfiguration<Data, Error, BareFetcher<Data>>, 'onErrorRetry' | 'onSuccess' | 'onError'>>;

const withPreviousData: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    const previousDataRef = useRef<typeof swr.data>();

    useEffect(() => {
      if (swr.data !== undefined) {
        previousDataRef.current = swr.data;
      }
    }, [swr.data]);
    const dataOrPrevData = swr.data === undefined ? previousDataRef.current : swr.data;
    return Object.assign({}, swr, { data: dataOrPrevData });
  };
};

export const useRawQuery = <Data, Error>(
  key: Key,
  fetch: () => Promise<Data>,
  options: QueryOptions<Data, Error> = {},
): UseQueryResult<Data, Error> => {
  const query = useSWR(options.enabled ? key : null, fetch, {
    refreshInterval: options.refetchInterval,
    use: options.keepPreviousData ? [withPreviousData] : undefined,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onErrorRetry: options.onErrorRetry,
    shouldRetryOnError: options.retry,
  });
  const updateCache = useCallback<UseQueryResult<Data, Error>['updateCache']>(
    (updater) => mutate<Data>(key, updater),
    [key],
  );
  const invalidateCache = useCallback<UseQueryResult<Data, Error>['invalidateCache']>(() => mutate<Data>(key), [key]);
  return useMemo(() => {
    if (query.data) {
      return {
        isLoading: false,
        status: 'success',
        data: query.data,
        error: null,
        updateCache,
        invalidateCache,
      };
    }
    if (query.error) {
      return {
        isLoading: false,
        status: 'error',
        data: undefined,
        error: query.error,
        updateCache,
        invalidateCache,
      };
    }
    return {
      isLoading: true,
      status: 'loading',
      data: undefined,
      error: null,
      updateCache,
      invalidateCache,
    };
  }, [query.data, query.error, updateCache, invalidateCache]);
};
