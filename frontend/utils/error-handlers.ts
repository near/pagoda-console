import { openToast } from '@/components/lib/Toast';
import analytics from '@/utils/analytics';

export function handleMutationError({
  error,
  eventLabel,
  eventData,
  toastTitle,
  toastDescription,
}: {
  error: any;
  eventLabel: string;
  eventData?: Record<string, any>;
  toastTitle?: string;
  toastDescription?: string;
}) {
  let message = 'Unknown error';
  if (typeof error === 'string') message = error;
  else if (typeof error === 'object' && typeof error.message === 'string') {
    message = error.message;
  }

  analytics.track(eventLabel, {
    status: 'failure',
    error: message,
    ...eventData,
  });

  if (toastTitle || toastDescription) {
    openToast({
      type: 'error',
      title: toastTitle || 'Error',
      description: toastDescription,
    });
  }
}
