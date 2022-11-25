import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

export function useContracts(project: Projects.ProjectSlug, environment: Projects.EnvironmentId) {
  const { identity } = useAuth();

  const { data: contracts, error } = useSWR(
    identity ? ['/projects/getContracts' as const, project, environment, identity.uid] : null,
    (key, project, environment) => {
      return fetchApi([key, { project, environment }]);
    },
  );

  return { contracts, error };
}

export function useContract(slug: Projects.ContractSlug | undefined) {
  const { identity } = useAuth();

  const {
    data: contract,
    error,
    mutate,
  } = useSWR(identity && slug ? ['/projects/getContract' as const, slug, identity.uid] : null, (key, slug) => {
    return fetchApi([key, { slug }]);
  });

  return { contract, error, mutate };
}
