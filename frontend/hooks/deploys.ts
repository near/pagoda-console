import useSWR from 'swr';

import { api } from '@/utils/api';

export function useRepositories(project: string | undefined, environment: number | undefined) {
  const {
    data: repositories,
    error,
    mutate,
  } = useSWR(
    project && environment ? ['/deploys/listRepositories' as const, project, environment] : null,
    (path, project, environment) => {
      return api.query(path, { projectSlug: project, environmentSubId: environment });
    },
  );

  return { repositories, error, mutate };
}

// TODO after MVP it might make sense to fetch by repository instead of project and env
export function useDeployments(project: string | undefined, environment: number | undefined) {
  const {
    data: deployments,
    error,
    mutate,
  } = useSWR(
    project && environment ? ['/deploys/listDeployments' as const, project, environment] : null,
    (path, project, environment) => {
      // TODO refactor to project and environment instead of using slug and subId suffixes, keeps it consistent with other modules
      return api.query(path, { projectSlug: project, environmentSubId: environment });
    },
  );

  return { deployments, error, mutate };
}
