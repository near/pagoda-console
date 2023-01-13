import useSWR from 'swr';

import { api } from '@/utils/api';

import { useAuth } from './auth';

export function useGithubConnection() {
  const { identity } = useAuth();
  const {
    data: connection,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/users/getGithubConnection' as const, identity.uid] : null, (key) => {
    return api.query(key, undefined);
  });

  return { connection, error, mutate, isValidating };
}
