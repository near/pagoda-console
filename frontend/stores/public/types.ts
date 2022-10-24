import type { PersistedStore } from '@/utils/types';

interface PublicContract {
  address: string;
}

export interface PublicStore extends PersistedStore {
  contracts: PublicContract[];
  publicModeIsActive: boolean;
  setContracts: (contracts: PublicContract[]) => void;
  setPublicMode: (isActive: boolean) => void;
}
