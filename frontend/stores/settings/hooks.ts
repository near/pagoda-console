import { useCallback, useEffect, useState } from 'react';

import { useIdentity } from '@/hooks/user';

import { useSettingsStore } from './settings';
import type { ProjectSettings, UserSettings } from './types';

const selectedProjectWarning = 'Invalid settings store update: "selectedProjectSlug" is not set yet.';
const userIdWarning =
  'Invalid settings store update: "userId" is not set yet. Check if "settingsInitialized" is true before calling.';

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

    setSettingsInitialized(store.hasHydrated || false);
  }, [store, userId]);

  const updateSettings = useCallback(
    (s: Partial<UserSettings>) => {
      if (!userId) {
        console.warn(`updateSettings() - ${userIdWarning}`);
        return;
      }

      store.updateSettings(userId, s);
    },
    [userId, store],
  );

  const updateProjectSettings = useCallback(
    (s: Partial<ProjectSettings>) => {
      if (!userId) {
        console.warn(`updateProjectSettings() - ${userIdWarning}`);
        return;
      }

      if (!settings.selectedProjectSlug) {
        console.warn(`updateProjectSettings() - ${selectedProjectWarning}`);
        return;
      }

      store.updateProjectSettings(userId, settings.selectedProjectSlug, s);
    },
    [userId, settings.selectedProjectSlug, store],
  );

  return {
    projectSettings,
    settings,
    settingsInitialized,
    updateSettings,
    updateProjectSettings,
  };
}
