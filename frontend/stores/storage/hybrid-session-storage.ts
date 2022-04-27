// https://github.com/pmndrs/zustand/wiki/Persisting-the-store's-data

import type { StateStorage } from 'zustand/middleware';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const hybridSessionStorage: StateStorage = {
  getItem: async (name) => {
    await timeout(0);

    const sessionValue = sessionStorage.getItem(name);
    if (sessionValue) return sessionValue;

    /*
      If we don't have a sessionStorage value yet, we should copy over the current
      localStorage value to sessionStorage to begin our isolated storage for the
      current tab.
    */

    const localValue = localStorage.getItem(name);
    if (localValue) sessionStorage.setItem(name, localValue);
    return localValue;
  },

  setItem: (name, value) => {
    sessionStorage.setItem(name, value);
    localStorage.setItem(name, value);
  },

  removeItem: (name) => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};
