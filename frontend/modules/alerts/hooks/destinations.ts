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

  // TODO: Mutate cache

  analytics.track('DC Create New Webhook Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination;
}

export function useDestinations(project: string | undefined): {
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
  } = useSWR(identity && project ? ['/alerts/listWebhookDestinations', project, identity.uid] : null, (key) => {
    return authenticatedPost(key, { project });
  });

  return { destinations, error, mutate, isValidating };
}
