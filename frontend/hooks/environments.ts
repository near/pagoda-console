import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

export function useEnvironments(project: Projects.ProjectSlug | undefined) {
  const { identity } = useAuth();

  const {
    data: environments,
    error,
    mutate,
  } = useSWR(identity && project && ['/projects/getEnvironments' as const, project, identity.uid], (key, project) => {
    return fetchApi([key, { project }]);
  });

  return { environments, error, mutate };
}
