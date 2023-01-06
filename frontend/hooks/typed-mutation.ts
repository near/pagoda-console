import type { Api } from '@pc/common/types/api';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { mutationApi } from '@/utils/api';

export function useTypedMutation<Key extends Api.Mutation.Key, Context = unknown>(
  endpoint: Key,
  options: UseMutationOptions<Api.Mutation.Output<Key>, unknown, Api.Mutation.Input<Key>, Context>,
) {
  const mutation = useMutation({
    ...options,
    mutationFn: (input: Api.Mutation.Input<Key>) => {
      return mutationApi(endpoint, input);
    },
  });

  return mutation;
}
