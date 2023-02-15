import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { api } from '@/utils/api';

export function useApiKeys(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(identity && project ? ['/projects/getKeys' as const, project, identity.uid] : null, (path, project) => {
    return api.query(path, { project });
  });

  return { keys, error, mutate };
}
