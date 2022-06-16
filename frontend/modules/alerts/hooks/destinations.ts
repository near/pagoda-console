import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

// import { mutate } from 'swr';
import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

import type { Destination, NewWebhookDestination } from '../utils/types';

export async function createWebhookDestination(data: NewWebhookDestination) {
  const destination: Destination = await authenticatedPost(
    '/alerts/createWebhookDestination',
    {
      ...data,
    },
    { forceRefresh: true },
  );

  analytics.track('DC Create New Webhook Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination;
}

export async function deleteDestination(destination: Destination) {
  try {
    await authenticatedPost('/alerts/deleteDestination', { id: destination.id });
    analytics.track('DC Remove Destination', {
      status: 'success',
      name: destination.id,
    });
    return true;
  } catch (e: any) {
    analytics.track('DC Remove Destination', {
      status: 'failure',
      name,
      error: e.message,
    });
    // TODO
    console.error('Failed to delete alert');
  }
  return false;
}

export function useDestinations(projectSlug: string | undefined): {
  destinations?: Destination[];
  error?: any;
  mutate: KeyedMutator<Destination[]>;
  isValidating: boolean;
} {
  const identity = useIdentity();
  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(identity && projectSlug ? ['/alerts/listWebhookDestinations', projectSlug, identity.uid] : null, (key) => {
    return authenticatedPost(key, { project: projectSlug });
  });

  return { destinations, error, mutate, isValidating };
}
