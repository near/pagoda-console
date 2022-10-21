import create from 'zustand';

import type { AuthenticationStore } from './types';

export const useAuthenticationStore = create<AuthenticationStore>((set) => ({
  identity: null,
  status: 'LOADING',
  setIdentity: (identity) => set({ identity }),
  setStatus: (status) => set({ status }),
}));
