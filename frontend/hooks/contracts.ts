import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Contract } from '@/utils/types';

export function useContracts(
  project: string | undefined,
  environment?: number,
): { contracts?: Contract[]; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: contracts,
    error,
    mutate,
  } = useSWR(
    identity && project && environment ? ['/projects/getContracts', project, environment, identity.uid] : null,
    (key, project, environment) => {
      return authenticatedPost(key, { project, environment });
    },
  );

  return { contracts, error, mutate };
}