interface Storage {
  getItem: <T extends Record<string, any>>(name: string) => Partial<T> | null;
  setItem: <T extends Record<string, any>>(name: string, value: T) => void;
  removeItem: (name: string) => void;
}

function filter(record: Record<string, unknown>) {
  const values = Object.entries(record).filter(([key, value]) => {
    return typeof value !== 'function' && key !== 'hasHydrated';
  });

  return Object.fromEntries(values);
}

const hybrid: Storage = {
  getItem(name) {
    const sessionValue = sessionStorage.getItem(name);
    if (sessionValue) return JSON.parse(sessionValue);

    const localValue = localStorage.getItem(name);
    if (localValue) {
      sessionStorage.setItem(name, localValue);
      return JSON.parse(localValue);
    }

    return null;
  },

  setItem(name, value) {
    const stringified = JSON.stringify(filter(value));
    sessionStorage.setItem(name, stringified);
    localStorage.setItem(name, stringified);
  },

  removeItem(name) {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

const local: Storage = {
  getItem(name) {
    const value = localStorage.getItem(name);

    if (value) {
      return JSON.parse(value);
    }

    return null;
  },

  setItem(name, value) {
    const stringified = JSON.stringify(filter(value));
    localStorage.setItem(name, stringified);
  },

  removeItem(name) {
    localStorage.removeItem(name);
  },
};

const session: Storage = {
  getItem(name) {
    const value = sessionStorage.getItem(name);

    if (value) {
      return JSON.parse(value);
    }

    return null;
  },

  setItem(name, value) {
    const stringified = JSON.stringify(filter(value));
    sessionStorage.setItem(name, stringified);
  },

  removeItem(name) {
    sessionStorage.removeItem(name);
  },
};

export const storage = {
  hybrid,
  local,
  session,
};
