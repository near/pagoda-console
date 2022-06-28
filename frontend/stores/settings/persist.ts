import { storage } from '@/utils/storage';

import { useSettingsStore } from './settings';
import type { SettingsStore } from './types';

const key = 'settings';

useSettingsStore.subscribe((store) => {
  storage.hybrid.setItem<SettingsStore>(key, store);
});

export function hydrate() {
  const value = storage.hybrid.getItem<SettingsStore>(key);

  useSettingsStore.setState({
    ...value,
    hasHydrated: true,
  });
}
