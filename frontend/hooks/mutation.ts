import type { Api } from '@pc/common/types/api';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation as useRawMutation } from '@tanstack/react-query';

import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';

export const useMutation = <K extends Api.Mutation.Key, C>(
  endpoint: K,
  {
    unauth,
    getAnalyticsSuccessData,
    getAnalyticsErrorData,
    ...options
  }: {
    unauth?: boolean;
    getAnalyticsSuccessData?: (input: Api.Mutation.Input<K>, output: Api.Mutation.Output<K>) => Record<string, unknown>;
    getAnalyticsErrorData?: (input: Api.Mutation.Input<K>, error: Api.Mutation.Error<K>) => Record<string, unknown>;
  } & Omit<
    UseMutationOptions<Api.Mutation.Output<K>, Api.Mutation.Error<K>, Api.Mutation.Input<K>, C>,
    'mutationKey' | 'mutationFn'
  > = {},
) =>
  useRawMutation(
    [endpoint],
    (input) => fetchApi<K, Api.Mutation.Output<K>, Api.Mutation.Input<K>>([endpoint, input], !unauth),
    {
      ...options,
      onSuccess: (result, variables, context) => {
        analytics.track(`DC ${endpoint}`, {
          status: 'success',
          ...getAnalyticsSuccessData?.(variables, result),
        });
        options.onSuccess?.(result, variables, context);
      },
      onError: (error, variables, context) => {
        analytics.track(`DC ${endpoint}`, {
          status: 'failure',
          error: String(error),
          ...getAnalyticsErrorData?.(variables, error),
        });
        console.error(error);
        options.onError?.(error, variables, context);
      },
    },
  );
