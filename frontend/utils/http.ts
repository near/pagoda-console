import { getAuth, getIdToken } from '@firebase/auth';
import type { Api } from '@pc/common/types/api';

import config from '@/utils/config';

export const fetchApi = async <K extends Api.Query.Key | Api.Mutation.Key>(
  [endpoint, input]: K extends Api.Query.Key
    ? Api.Query.Input<K> extends void
      ? [K]
      : [K, Api.Query.Input<K>]
    : K extends Api.Mutation.Key
    ? Api.Mutation.Input<K> extends void
      ? [K]
      : [K, Api.Mutation.Input<K>]
    : never,
  unauth?: boolean,
): Promise<
  K extends Api.Query.Key ? Api.Query.Output<K> : K extends Api.Mutation.Key ? Api.Mutation.Output<K> : never
> => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (!unauth) {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    headers = { ...headers, Authorization: `Bearer ${await getIdToken(user)}` };
  }
  const response = await fetch(`${config.url.api}${endpoint}`, {
    method: 'POST',
    headers,
    body: input ? JSON.stringify(input) : undefined,
  });

  try {
    const json = await response.json();
    if (!response.ok) {
      throw json;
    }
    return json;
  } catch (e) {
    if (response.ok) {
      return undefined as unknown as K extends Api.Query.Key
        ? Api.Query.Output<K>
        : K extends Api.Mutation.Key
        ? Api.Mutation.Output<K>
        : never;
    }
    throw new Error('Unknown JSON error');
  }
};
