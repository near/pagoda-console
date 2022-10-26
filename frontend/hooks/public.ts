import { usePublicStore } from '@/stores/public';
import type { Contract, Environment } from '@/utils/types';

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

export function usePublicModeIsActive() {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  return { publicModeIsActive };
}

export function usePublicOrPrivateContracts(privateContracts: Contract[] | undefined) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);

  return {
    contracts: publicModeIsActive ? publicContracts : privateContracts,
  };
}

export function usePublicOrPrivateEnvironment(privateEnvironment: Environment | undefined) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const { publicEnvironment } = usePublicEnvironment();

  return {
    environment: publicModeIsActive ? publicEnvironment : privateEnvironment,
  };
}

export function usePublicOrPrivateEnvironments(privateEnvironments: Environment[] | undefined) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicEnvironments = [testnetEnvironment, mainnetEnvironment];

  return {
    environments: publicModeIsActive ? publicEnvironments : privateEnvironments,
  };
}

export function usePublicEnvironment() {
  const publicContracts = usePublicStore((store) => store.contracts);
  const publicEnvironment = publicContracts[0]?.net === 'MAINNET' ? mainnetEnvironment : testnetEnvironment;

  return {
    publicEnvironment,
  };
}
