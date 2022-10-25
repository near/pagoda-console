import create from 'zustand';

import type { AuthStore } from './types';

export const useAuthStore = create<AuthStore>((set) => ({
  identity: null,
  status: 'LOADING',
  setIdentity: (identity) => set({ identity }),
  setStatus: (status) => set({ status }),
}));
