import type { Api } from '@pc/common/types/api';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { fetchApi } from '@/utils/http';

export function useTypedMutation<
  Key extends Api.Mutation.Key,
  Input extends Api.Mutation.Input<Key>,
  Output extends Api.Mutation.Output<Key>,
  Context = unknown,
>(endpoint: Key, options: UseMutationOptions<Output, unknown, Input, Context>) {
  /*
    TODO: Figure out why the following types are invalid when calling fetchApi([endpoint, input]):

    const fn = (input: Input) => fetchApi([endpoint, input]);

    For now, we can safely cast to "any" before passing to fetchApi() to silence
    the type error. The inputs and outputs are explicitly typed, which provides
    type safety.
  */

  const mutation = useMutation({
    mutationFn: async (input: Input): Promise<Output> => {
      return fetchApi([endpoint as any, input as any]);
    },
    ...options,
  });

  return mutation;
}
