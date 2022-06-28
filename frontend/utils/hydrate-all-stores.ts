import { hydrate as hydrateSettings } from '@/stores/settings';

export function hydrateAllStores() {
  hydrateSettings();
}
