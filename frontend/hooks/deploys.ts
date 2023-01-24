import useSWR from 'swr';

import { api } from '@/utils/api';

export function useRepositories(project: string | undefined) {
  const {
    data: repositories,
    error,
    mutate,
  } = useSWR(project ? ['/deploys/listRepositories' as const, project] : null, (path, project) => {
    return api.query(path, { project: project });
  });

  return { repositories, error, mutate };
}

export function useDeployments(project: string | undefined) {
  const {
    data: deployments,
    error,
    mutate,
  } = useSWR(project ? ['/deploys/listDeployments' as const, project] : null, (path, project) => {
    return api.query(path, { project });
  });

  return { deployments, error, mutate };
}