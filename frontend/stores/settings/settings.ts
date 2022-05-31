import { merge } from 'lodash-es';
import create from 'zustand';

import type { SettingsStore } from './types';

function getUser(userId: string, state: SettingsStore) {
  state.users[userId] ||= {
    projects: {},
  };

  console.log(userId);

  return state.users[userId]!;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
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
      user.projects[projectSlug] ||= {};
      merge(user.projects[projectSlug], settings);
      return {
        users: state.users,
      };
    });
  },
}));
