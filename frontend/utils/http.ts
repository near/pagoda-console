import { getAuth, getIdToken } from '@firebase/auth';
import type { Api } from '@pc/common/types/api';

import config from '@/utils/config';

type FetchFn = {
  <K extends Api.Query.Key>(
    [endpoint, input]: Api.Query.Input<K> extends void ? [K, undefined?] : [K, Api.Query.Input<K>],
    unauth?: boolean,
  ): Promise<Api.Query.Output<K>>;
  <K extends Api.Mutation.Key>(
    [endpoint, input]: Api.Mutation.Input<K> extends void ? [K, undefined?] : [K, Api.Mutation.Input<K>],
    unauth?: boolean,
  ): Promise<Api.Mutation.Output<K>>;
};

export const fetchApi = (async ([endpoint, input], unauth) => {
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
      return undefined as any;
    }
    throw new Error('Unknown JSON error');
  }
}) as FetchFn;
