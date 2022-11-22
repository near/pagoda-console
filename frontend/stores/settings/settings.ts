import { merge } from 'lodash-es';
import create from 'zustand';

import type { SettingsStore } from './types';

function getUser(userId: string, state: SettingsStore) {
  state.users[userId] ||= {
    projects: {},
  };

  return state.users[userId]!;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  currentUser: undefined,
  hasInitialized: false,
  users: {},

  initializeCurrentUserSettings: (userId) => {
    set((state) => {
      const user = getUser(userId, state);
      return {
        currentUser: user,
        hasInitialized: true,
      };
    });
  },

  updateSettings: (userId, settings) => {
    set((state) => {
      const user = getUser(userId, state);
      merge(user, settings);
      return {
        currentUser: { ...user },
        users: state.users,
      };
    });
  },

  updateProjectSettings: (userId, projectSlug, settings) => {
    set((state) => {
      const user = getUser(userId, state);
      user.projects[projectSlug] ||= {};
      merge(user.projects[projectSlug], settings);
      return {
        currentUser: { ...user },
        users: state.users,
      };
    });
  },
}));
