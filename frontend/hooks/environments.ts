import type { Api } from '@pc/common/types/api';

import { usePublicStore } from '@/stores/public';

import { useSelectedProject } from './selected-project';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

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
