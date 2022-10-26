import type { Contract, PersistedStore } from '@/utils/types';

export interface PublicStore extends PersistedStore {
  contracts: Contract[];
  publicModeIsActive: boolean;

  activatePublicMode: () => void;
  deactivatePublicMode: () => void;
  setContracts: (contracts: Contract[]) => void;
}
