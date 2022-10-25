import type { PersistedStore } from '@/utils/types';

interface PublicContract {
  address: string;
}

export interface PublicStore extends PersistedStore {
  contracts: PublicContract[];
  publicModeIsActive: boolean;

  activatePublicMode: () => void;
  deactivatePublicMode: () => void;
  setContracts: (contracts: PublicContract[]) => void;
}
