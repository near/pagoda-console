import { merge } from 'lodash-es';
import { useEffect, useState } from 'react';
import create from 'zustand';

import { useIdentity } from '@/hooks/user';
import { hybridStorage } from '@/utils/hybrid-storage';

interface ProjectSettings {
  nftContract?: string;
  selectedEnvironmentSubId?: number;
}

interface UserSettings {
  projects: Record<string, ProjectSettings | undefined>;
  selectedProjectSlug?: string;
}

interface SettingsStore {
  hasHydrated: boolean;
  users: Record<string, UserSettings | undefined>;
  updateSettings: (userId: string, settings: Partial<UserSettings>) => void;
  updateProjectSettings: (userId: string, projectSlug: string, settings: Partial<ProjectSettings>) => void;
}

function getUser(userId: string, state: SettingsStore) {
  if (!state.users[userId]) {
    state.users[userId] = {
      projects: {},
    };
  }

  return state.users[userId]!;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  hasHydrated: false,
  users: {},

  updateSettings: (userId, settings) => {
    set((state) => {
      const user = getUser(userId, state);
      merge(user, settings);
      return {
        users: state.users,
      };
    });
  },

  updateProjectSettings: (userId, projectSlug, settings) => {
    set((state) => {
      const user = getUser(userId, state);
      user.projects[projectSlug] = user.projects[projectSlug] || {};
      merge(user.projects[projectSlug], settings);
      return {
        users: state.users,
      };
    });
  },
}));

export function useSettingsStoreForUser() {
  const currentUser = useIdentity();
  const store = useSettingsStore();
  const [settings, setSettings] = useState<UserSettings>({
    projects: {},
  });
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({});
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  const userId = currentUser?.uid;

  useEffect(() => {
    if (store.hasHydrated) return;
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) return;
    const user = store.users[userId];

    if (user) {
      setSettings({
        ...user,
      });

      if (user.selectedProjectSlug) {
        const project = user.projects[user.selectedProjectSlug];
        if (project) {
          setProjectSettings({
            ...project,
          });
        }
      }
    }

    setSettingsInitialized(store.hasHydrated);
  }, [store, userId]);

  function updateSettings(s: Partial<UserSettings>) {
    if (!userId) {
      console.warn('updateSettings() - Invalid settings store update: "userId" is not set.');
      return;
    }

    store.updateSettings(userId, s);
  }

  function updateProjectSettings(s: Partial<ProjectSettings>) {
    if (!userId) {
      console.warn('updateProjectSettings() - Invalid settings store update: "userId" is not set.');
      return;
    }

    if (!settings.selectedProjectSlug) {
      console.warn('updateProjectSettings() - Invalid settings store update: "selectedProjectSlug" is not set.');
      return;
    }

    store.updateProjectSettings(userId, settings.selectedProjectSlug, s);
  }

  return {
    projectSettings,
    settings,
    settingsInitialized,
    updateSettings,
    updateProjectSettings,
  };
}

// Persistence & Hydration:

const persistKey = 'settings';

useSettingsStore.subscribe(({ users }) => {
  hybridStorage.setItem<Partial<SettingsStore>>(persistKey, {
    users,
  });
});

function hydrate() {
  const value = hybridStorage.getItem<Partial<SettingsStore>>(persistKey);

  useSettingsStore.setState({
    ...value,
    hasHydrated: true,
  });
}
