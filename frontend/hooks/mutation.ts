import { noop } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

import analytics from '@/utils/analytics';

type MutationLoadingResult = {
  isLoading: true;
  status: 'loading';
  result: undefined;
  error: null;
};

type MutationErrorResult<Error> = {
  isLoading: false;
  status: 'error';
  result: undefined;
  error: Error;
};

type MutationSuccessResult<Result> = {
  isLoading: false;
  status: 'success';
  result: Result;
  error: null;
};

type MutationIdleResult = {
  isLoading: false;
  status: 'idle';
  result: undefined;
  error: null;
};

export type MutationResult<Input = void, Result = void, E = unknown> = (
  | MutationLoadingResult
  | MutationSuccessResult<Result>
  | MutationErrorResult<E>
  | MutationIdleResult
) & {
  mutate: Input extends void ? () => Promise<void> : (input: Input) => Promise<void>;
  mutateAsync: Input extends void ? () => Promise<Result> : (input: Input) => Promise<Result>;
  reset: () => void;
};

export type MutationOptions<Input = void, Result = void, M = unknown, E = unknown> = {
  eventName: string;
  mutate: Input extends void ? () => Result | Promise<Result> : (input: Input) => Result | Promise<Result>;
  onSuccess?: (result: Result, input: Input, cache: M) => void;
  onError?: (error: E, input: Input, cache?: M) => void;
  onMutate?: (input: Input) => M;
};

export const useMutation = <Input = void, Result = void, M = unknown, E = unknown>({
  eventName,
  mutate: originalMutate,
  onMutate,
  onSuccess,
  onError,
}: MutationOptions<Input, Result, M, E>): MutationResult<Input, Result, E> => {
  const [, setCounter] = useState(0);
  const forceRefresh = useCallback(() => setCounter((c) => c + 1), [setCounter]);

  const mutationRef = useRef<MutationResult<Input, Result, E>>({
    isLoading: false,
    error: null,
    result: undefined,
    status: 'idle',
    mutateAsync: noop as MutationResult<Input, Result, E>['mutateAsync'],
    mutate: noop as MutationResult<Input, Result, E>['mutate'],
    reset: noop,
  });

  // see https://github.com/facebook/react/issues/19742
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutateAsync = useCallback<MutationResult<Input, Result, E>['mutateAsync']>(
    (async (input) => {
      mutationRef.current.error = null;
      mutationRef.current.result = undefined;
      mutationRef.current.isLoading = true;
      mutationRef.current.status = 'loading';
      forceRefresh();
      let cache: M | undefined;
      try {
        cache = onMutate?.(input);
        const result = await originalMutate(input);
        analytics.track(`DC ${eventName}`, {
          status: 'success',
          ...input,
        });
        mutationRef.current.result = result;
        mutationRef.current.status = 'success';
        mutationRef.current.isLoading = false;
        forceRefresh();
        onSuccess?.(result, input, cache!);
        return result;
      } catch (e: any) {
        analytics.track(`DC ${eventName}`, {
          status: 'failure',
          error: e.message,
          ...input,
        });
        mutationRef.current.error = e;
        mutationRef.current.status = 'error';
        mutationRef.current.isLoading = false;
        forceRefresh();
        onError?.(e, input, cache);
        throw e;
      }
    }) as MutationResult<Input, Result, E>['mutateAsync'],
    [eventName, onSuccess, onError, onMutate, originalMutate],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mutate = useCallback<MutationResult<Input, Result, E>['mutate']>(
    ((input) => {
      mutateAsync(input).catch(noop);
    }) as MutationResult<Input, Result, E>['mutate'],
    [mutateAsync],
  );
  const reset = useCallback(() => {
    mutationRef.current.error = null;
    mutationRef.current.result = undefined;
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
