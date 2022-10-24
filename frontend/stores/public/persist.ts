import { storage } from '@/utils/storage';

import { usePublicStore } from './public';
import type { PublicStore } from './types';

const key = 'public';

usePublicStore.subscribe((store) => {
  storage.hybrid.setItem<PublicStore>(key, store);
});

export function hydrate() {
  const value = storage.hybrid.getItem<PublicStore>(key);

  usePublicStore.setState({
    ...value,
    hasHydrated: true,
  });
}
