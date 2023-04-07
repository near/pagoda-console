import { useState } from 'react';
import useSWR from 'swr';

import { api } from '@/utils/api';

export function useRepositories(project: string | undefined, repositorySlug: string | undefined) {
  const {
    data: repositories,
    error,
    mutate,
  } = useSWR(
    project || repositorySlug ? ['/deploys/listRepositories' as const, project] : null,
    (path, project) => {
      return api.query(path, { project: project, repositorySlug });
    },
    { refreshInterval: 10000 },
  );

  return { repositories, error, mutate };
}

export function useDeployments(project: string | undefined, repositorySlug: string | undefined) {
  const {
    data: deployments,
    error,
    mutate,
  } = useSWR(
    project || repositorySlug ? ['/deploys/listDeployments' as const, project] : null,
    (path, project) => {
      return api.query(path, { project, repositorySlug });
    },
    { refreshInterval: 10000 },
  );

  return { deployments, error, mutate };
}

export function useIsRepositoryTransferred(repositorySlug: string | undefined) {
  const [isTransferred, setIsTransferred] = useState<boolean | undefined>(undefined);

  const { data, error, mutate } = useSWR(
    repositorySlug ? ['/deploys/isRepositoryTransferred' as const, repositorySlug] : null,
    (path, repositorySlug) => {
      return api.query(path, { repositorySlug });
    },
    {
      refreshInterval: isTransferred ? 0 : 10000,
      onSuccess: ({ isTransferred }) => setIsTransferred(isTransferred),
    },
  );

  return { isRepositoryTransferred: data?.isTransferred, error, mutate };
}
