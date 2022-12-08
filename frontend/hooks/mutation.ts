import type { Api } from '@pc/common/types/api';

import type {
  MutationOptions as UseRawMutationOptions,
  UseMutationResult as RawMutationResult,
} from '@/hooks/raw-mutation';
import { useRawMutation } from '@/hooks/raw-mutation';
import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';

export type UseMutationResult<K extends Api.Mutation.Key> = RawMutationResult<
  Api.Mutation.Output<K>,
  Api.Mutation.Error<K>,
  Api.Mutation.Input<K>
>;

export type MutationOptions<K extends Api.Mutation.Key, C = unknown> = UseRawMutationOptions<
  Api.Mutation.Output<K>,
  Api.Mutation.Error<K>,
  Api.Mutation.Input<K>,
  C
> & {
  unauth?: boolean;
  getAnalyticsSuccessData?: (input: Api.Mutation.Input<K>, output: Api.Mutation.Output<K>) => Record<string, unknown>;
  getAnalyticsErrorData?: (input: Api.Mutation.Input<K>, error: Api.Mutation.Error<K>) => Record<string, unknown>;
};

export const useMutation = <K extends Api.Mutation.Key, C>(
  endpoint: K,
  options: MutationOptions<K, C> = {},
): UseMutationResult<K> =>
  useRawMutation<Api.Mutation.Output<K>, Api.Mutation.Error<K>, Api.Mutation.Input<K>, C>(
    ((variables) =>
      fetchApi(
        [endpoint, variables] as unknown as Parameters<typeof fetchApi>[0],
        options.unauth,
      )) as unknown as Api.Mutation.Input<K> extends void
      ? () => Promise<Api.Mutation.Output<K>>
      : (input: Api.Mutation.Input<K>) => Promise<Api.Mutation.Output<K>>,
    {
      ...options,
      onSuccess: (result, variables, context) => {
        analytics.track(`DC ${endpoint}`, {
          status: 'success',
          ...options.getAnalyticsSuccessData?.(variables, result),
        });
        options.onSuccess?.(result, variables, context);
      },
      onError: (error, variables, context) => {
        analytics.track(`DC ${endpoint}`, {
          status: 'failure',
          error: String(error),
          ...options.getAnalyticsErrorData?.(variables, error),
        });
        options.onError?.(error, variables, context);
      },
    },
  );
