import { getAuth, getIdToken } from '@firebase/auth';

import config from '@/utils/config';

export const fetchApi = async <E extends string, R, I>([endpoint, input]: [E, I?], auth?: boolean): Promise<R> => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (auth) {
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
      return undefined as unknown as R;
    }
    throw new Error('Unknown JSON error');
  }
};
