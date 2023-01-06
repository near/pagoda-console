import { getAuth, getIdToken } from '@firebase/auth';
import type { Api } from '@pc/common/types/api';

import config from '@/utils/config';

async function fetchApi(endpoint: string, body: Record<any, any> | void | undefined | null, authenticated: boolean) {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    headers = { ...headers, Authorization: `Bearer ${await getIdToken(user)}` };
  }

  const response = await fetch(`${config.url.api}${endpoint}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;

  try {
    if (response.status === 204) {
      json = {};
    } else {
      json = await response.json();
    }
  } catch (e) {
    if (response.ok) {
      // This will happen if a response is successful and has no body
      return undefined;
    }
  }

  if (!response.ok) {
    throw json;
  }

  return json;
}

export const mutationApi = async <K extends Api.Mutation.Key>(
  endpoint: K,
  input: Api.Mutation.Input<K>,
  authenticated = true,
): Promise<Api.Mutation.Output<K>> => {
  const response = await fetchApi(endpoint, input, authenticated);
  return response;
};

export const queryApi = async <K extends Api.Query.Key>(
  endpoint: K,
  input: Api.Query.Input<K>,
  authenticated = true,
): Promise<Api.Query.Output<K>> => {
  const response = await fetchApi(endpoint, input, authenticated);
  return response;
};
