import create from 'zustand';

import type { PublicStore } from './types';

export const usePublicStore = create<PublicStore>((set) => ({
  contracts: [],
  publicModeIsActive: false,

  setContracts: (contracts) => set({ contracts }),
  setPublicMode: (publicModeIsActive) => set({ publicModeIsActive }),
}));
