import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import useSWR from 'swr';

import { api } from '@/utils/api';

export function useRepositories(project: string | undefined, repositorySlug?: string) {
  const {
    data: repositories,
    error,
    mutate,
  } = useSWR(
    project || repositorySlug ? ['/deploys/listRepositories' as const, project, repositorySlug] : null,
    (path, project, repositorySlug) => {
      return api.query(path, repositorySlug ? { repositorySlug } : { project }, !!project);
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
    project || repositorySlug ? ['/deploys/listDeployments' as const, project, repositorySlug] : null,
    (path, project, repositorySlug) => {
      return api.query(path, repositorySlug ? { repositorySlug } : { project }, !!project);
    },
    { refreshInterval: 10000 },
  );

  return { deployments, error, mutate };
}

export function useIsRepositoryTransferred(repositorySlug: string | undefined) {
  const [isTransferred, setIsTransferred] = useState<boolean | undefined>(undefined);
  const user = getAuth().currentUser;

  const { data, error, mutate } = useSWR(
    repositorySlug ? ['/deploys/isRepositoryTransferred' as const, repositorySlug] : null,
    (path, repositorySlug) => {
      return api.query(path, { repositorySlug }, !!user);
    },
    {
      refreshInterval: isTransferred ? 0 : 10000,
      onSuccess: ({ isTransferred }) => setIsTransferred(isTransferred),
    },
  );

  return { isRepositoryTransferred: data?.isTransferred, error, mutate };
}
