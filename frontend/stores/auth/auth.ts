import create from 'zustand';

import type { AuthStore } from './types';

export const useAuthStore = create<AuthStore>((set) => ({
  identity: null,
  status: 'LOADING',
  githubToken: undefined,
  setIdentity: (identity) => set({ identity }),
  setStatus: (status) => set({ status }),
  setGithubToken: (githubToken) => set({ githubToken }),
}));
