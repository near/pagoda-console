import { getAuth, getIdToken } from 'firebase/auth';

import config from '@/utils/config';

export const unauthenticatedPost = async (endpoint: string, body?: Record<string, any>, headers?: HeadersInit) => {
  const res = await fetch(`${config.url.api}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  return parseFetchResponse(res);
};

async function parseFetchResponse(res: Response) {
  let resJson;
  try {
    if (res.status === 204) {
      resJson = {};
    } else {
      resJson = await res.json();
    }
  } catch (e) {
    if (res.ok) {
      throw new Error('Failed to convert to JSON');
    }
    // ignore failure to convert to JSON on error
  }
  if (!res.ok) {
    // TODO (P2+) it is generally frowned upon to throw a non-Error object, but we
    // need to pass the status code through to the onErrorRetry function. Find a better
    // way to do that
    throw resJson;
  }
  return resJson;
}

interface AuthenticatedPostOptions {
  forceRefresh?: boolean;
}

export const authenticatedPost = async (
  endpoint: string,
  body?: Record<string, any>,
  options?: AuthenticatedPostOptions,
) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No authenticated user');

  const headers = {
    Authorization: `Bearer ${await getIdToken(user, options?.forceRefresh)}`,
  };
  return unauthenticatedPost(endpoint, body, headers);
};
