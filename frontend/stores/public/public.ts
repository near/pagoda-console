import create from 'zustand';

import type { PublicStore } from './types';

export const usePublicStore = create<PublicStore>((set) => ({
  contracts: [],
  publicModeIsActive: false,

  activatePublicMode: () => set({ publicModeIsActive: true }),
  deactivatePublicMode: () => set({ publicModeIsActive: false }),
  setContracts: (contracts) => set({ contracts }),
}));
