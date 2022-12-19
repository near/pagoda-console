import useSWR from 'swr';

import { fetchApi } from '@/utils/http';

import { useAuth } from './auth';

export function useGithubConnection() {
  const { identity } = useAuth();
  const {
    data: connection,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/users/getGithubConnection' as const, identity.uid] : null, (key) => {
    return fetchApi([key]);
  });

  return { connection, error, mutate, isValidating };
}
