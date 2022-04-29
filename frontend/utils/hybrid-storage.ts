/*
  If we don't have a sessionStorage value yet, we copy over the current
  localStorage value to sessionStorage to begin our isolated, forked storage
  for the current tab.
*/

export const hybridStorage = {
  getItem<T = Record<string, unknown>>(name: string): T | null {
    const sessionValue = sessionStorage.getItem(name);
    if (sessionValue) return JSON.parse(sessionValue) as T;

    const localValue = localStorage.getItem(name);
    if (localValue) {
      sessionStorage.setItem(name, localValue);
      return JSON.parse(localValue) as T;
    }

    return null;
  },

  setItem<T = Record<string, unknown>>(name: string, value: T) {
    const stringified = JSON.stringify(value);
    sessionStorage.setItem(name, stringified);
    localStorage.setItem(name, stringified);
  },

  removeItem(name: string) {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};
