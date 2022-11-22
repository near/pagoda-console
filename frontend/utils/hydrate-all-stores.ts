import { hydrate as hydratePublic } from '@/stores/public';
import { hydrate as hydrateSettings } from '@/stores/settings';

export function hydrateAllStores() {
  hydrateSettings();
  hydratePublic();
}
