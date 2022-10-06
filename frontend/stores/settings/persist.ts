import { storage } from '@/utils/storage';

import { useSettingsStore } from './settings';
import type { SettingsStore } from './types';

const key = 'settings';

useSettingsStore.subscribe((store) => {
  storage.hybrid.setItem<Partial<SettingsStore>>(key, {
    users: store.users,
  });
});

export function hydrate() {
  const value = storage.hybrid.getItem<Partial<SettingsStore>>(key);

  useSettingsStore.setState({
    ...value,
    hasHydrated: true,
  });
}
