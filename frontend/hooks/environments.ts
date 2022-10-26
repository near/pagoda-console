import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { usePublicStore } from '@/stores/public';
import { authenticatedPost } from '@/utils/http';
import type { Environment } from '@/utils/types';

import { useSelectedProject } from './selected-project';

export function useCurrentEnvironment() {
  const testnetEnvironment: Environment = {
    name: 'Testnet',
    net: 'TESTNET',
    subId: 1,
  };
  const mainnetEnvironment: Environment = {
    name: 'Mainnet',
    net: 'MAINNET',
    subId: 2,
  };

  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);
  const publicEnvironment = publicContracts[0]?.net === 'MAINNET' ? mainnetEnvironment : testnetEnvironment;
  const { environment: privateEnvironment } = useSelectedProject();

  if (!publicModeHasHydrated) return { environment: undefined };

  return {
    environment: publicModeIsActive ? publicEnvironment : privateEnvironment,
  };
}

export function useEnvironment(environmentId: number | undefined) {
  const { identity } = useAuth();

  const {
    data: environment,
    error,
    mutate,
  } = useSWR<Environment>(
    identity && environmentId ? ['/projects/getEnvironmentDetails', environmentId, identity.uid] : null,
    (key, environmentId) => {
      return authenticatedPost(key, { environmentId });
    },
  );

  return { environment, error, mutate };
}

export function useEnvironments(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: environments,
    error,
    mutate,
  } = useSWR<Environment[]>(
    identity && project && ['/projects/getEnvironments', project, identity.uid],
    (key, project) => {
      return authenticatedPost(key, { project });
    },
  );

  return { environments, error, mutate };
}
