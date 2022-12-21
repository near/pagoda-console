import { noop } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseMutationLoadingResult = {
  isLoading: true;
  status: 'loading';
  data: undefined;
  error: null;
};

type UseMutationErrorResult<Error> = {
  isLoading: false;
  status: 'error';
  data: undefined;
  error: Error;
};

type UseMutationSuccessResult<Result> = {
  isLoading: false;
  status: 'success';
  data: Result;
  error: null;
};

type UseMutationIdleResult = {
  isLoading: false;
  status: 'idle';
  data: undefined;
  error: null;
};

export type UseMutationResult<Data, Error, Input> = (
  | UseMutationLoadingResult
  | UseMutationSuccessResult<Data>
  | UseMutationErrorResult<Error>
  | UseMutationIdleResult
) & {
  mutate: Input extends void ? () => Promise<void> : (input: Input) => Promise<void>;
  mutateAsync: Input extends void ? () => Promise<Data> : (input: Input) => Promise<Data>;
  reset: () => void;
};

export type MutationOptions<Data, Error, Input, C> = {
  onMutate?: (input: Input) => C;
  onSuccess?: (result: Data, input: Input, context: C) => void;
  onError?: (error: Error, input: Input, context?: C) => void;
  onSettled?: (result: Data | undefined, error: Error | undefined, variables: Input, context: C | undefined) => void;
};

export const useRawMutation = <Data, Error, Input, C = unknown>(
  mutationFn: Input extends void ? () => Promise<Data> : (input: Input) => Promise<Data>,
  options: MutationOptions<Data, Error, Input, C> = {},
): UseMutationResult<Data, Error, Input> => {
  const [, setCounter] = useState(0);
  const forceRefresh = useCallback(() => setCounter((c) => c + 1), [setCounter]);

  const mutationRef = useRef<UseMutationResult<Data, Error, Input>>({
    isLoading: false,
    error: null,
    data: undefined,
    status: 'idle',
    mutateAsync: noop as UseMutationResult<Data, Error, Input>['mutateAsync'],
    mutate: noop as UseMutationResult<Data, Error, Input>['mutate'],
    reset: noop,
  });
  const optionsRef = useRef<MutationOptions<Data, Error, Input, C>>(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // see https://github.com/facebook/react/issues/19742
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutateAsync = useCallback<UseMutationResult<Data, Error, Input>['mutateAsync']>(
    (async (variables) => {
      const options = optionsRef.current;
      mutationRef.current.error = null;
      mutationRef.current.data = undefined;
      mutationRef.current.isLoading = true;
      mutationRef.current.status = 'loading';
      forceRefresh();
      let cache: C | undefined;
      try {
        cache = options.onMutate?.(variables);
        const data = await mutationFn(variables);
        mutationRef.current.data = data;
        mutationRef.current.status = 'success';
        mutationRef.current.isLoading = false;
        forceRefresh();
        options.onSuccess?.(data, variables, cache!);
        options.onSettled?.(data, undefined, variables, cache);
        return data;
      } catch (error: any) {
        mutationRef.current.error = error;
        mutationRef.current.status = 'error';
        mutationRef.current.isLoading = false;
        forceRefresh();
        options.onSettled?.(undefined, error, variables, cache);
        options.onError?.(error, variables, cache);
        throw error;
      }
    }) as unknown as UseMutationResult<Data, Error, Input>['mutateAsync'],
    [],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutate = useCallback<UseMutationResult<Data, Error, Input>['mutate']>(
    ((input) => {
      mutateAsync(input).catch(noop);
    }) as UseMutationResult<Data, Error, Input>['mutate'],
    [mutateAsync],
  );
  const reset = useCallback(() => {
    mutationRef.current.error = null;
    mutationRef.current.data = undefined;
    mutationRef.current.isLoading = false;
    mutationRef.current.status = 'idle';
    forceRefresh();
  }, [mutationRef, forceRefresh]);

  useEffect(() => {
    mutationRef.current.mutateAsync = mutateAsync;
    mutationRef.current.mutate = mutate;
    mutationRef.current.reset = reset;
    forceRefresh();
  }, [mutateAsync, mutate, reset, forceRefresh]);

  return mutationRef.current;
};
