import type { Api } from '@pc/common/types/api';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/utils/api';

export function useApiMutation<Key extends Api.Mutation.Key, Context = unknown>(
  endpoint: Key,
  options: UseMutationOptions<Api.Mutation.Output<Key>, unknown, Api.Mutation.Input<Key>, Context>,
  authenticated = true,
) {
  const mutation = useMutation({
    ...options,
    mutationFn: (input: Api.Mutation.Input<Key>) => {
      return api.mutation(endpoint, input, authenticated);
    },
  });

  return mutation;
}
