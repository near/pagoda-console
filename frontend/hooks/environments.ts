import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { usePublicStore } from '@/stores/public';
import { api } from '@/utils/api';

import { useSelectedProject } from './selected-project';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

export function useCurrentEnvironment(
  options = {
    enforceSelectedProject: true,
  },
) {
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
  const { environment: privateEnvironment } = useSelectedProject({
    enforceSelectedProject: options.enforceSelectedProject,
  });

  if (!publicModeHasHydrated) return { environment: undefined };

  return {
    environment: publicModeIsActive ? publicEnvironment : privateEnvironment,
  };
}

export function useEnvironments(project: string | undefined) {
  const { identity } = useAuth();

  const {
    data: environments,
    error,
    mutate,
  } = useSWR(identity && project && ['/projects/getEnvironments' as const, project, identity.uid], (path, project) => {
    return api.query(path, { project });
  });

  return { environments, error, mutate };
}
