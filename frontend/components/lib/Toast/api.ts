import type { OpenToastOptions } from '@/stores/toaster';
import { useToasterStore } from '@/stores/toaster';

export function openToast(options: OpenToastOptions) {
  useToasterStore.getState().open(options);
}
