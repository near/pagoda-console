import useSWR from 'swr';

import { api } from '@/utils/api';

export function useRepositories(project: string | undefined) {
  const {
    data: repositories,
    error,
    mutate,
  } = useSWR(
    project ? ['/deploys/listRepositories' as const, project] : null,
    (path, project) => {
      return api.query(path, { project: project });
    },
    { refreshInterval: 10000 },
  );

  return { repositories, error, mutate };
}

export function useDeployments(project: string | undefined) {
  const {
    data: deployments,
    error,
    mutate,
  } = useSWR(
    project ? ['/deploys/listDeployments' as const, project] : null,
    (path, project) => {
      return api.query(path, { project });
    },
    { refreshInterval: 10000 },
  );

  return { deployments, error, mutate };
}

export function useIsRepositoryTransferred(repository: string | undefined) {
  const { data, error, mutate } = useSWR(
    repository ? ['/deploys/isRepositoryTransferred' as const, repository] : null,
    (path, repository) => {
      return api.query(path, { repository });
    },
    { refreshInterval: 3000 },
  );

  return { isTransferred: data?.isTransferred, error, mutate };
}
