import type { Api } from '@pc/common/types/api';

import type { PersistedStore } from '@/utils/types';

type Contract = Api.Query.Output<'/projects/getContract'>;

export interface PublicStore extends PersistedStore {
  contracts: Contract[];
  publicModeIsActive: boolean;

  activatePublicMode: () => void;
  deactivatePublicMode: () => void;
  setContracts: (contracts: Contract[]) => void;
}
