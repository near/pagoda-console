import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

import type { Destination, NewDestination, UpdateDestination } from '../utils/types';

export async function createDestination(data: NewDestination) {
  const destination: Destination = await authenticatedPost('/alerts/createDestination', {
    ...data,
  });

  analytics.track('DC Create New Destination', {
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

export async function updateDestination(data: UpdateDestination) {
  const destination: Destination = await authenticatedPost('/alerts/updateDestination', {
    ...data,
  });

  analytics.track('DC Update Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination;
}

export function useDestinations(projectSlug: string | undefined) {
  const identity = useIdentity();

  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR<Destination[]>(
    identity && projectSlug ? ['/alerts/listDestinations', projectSlug, identity.uid] : null,
    (key) => {
      return authenticatedPost(key, { projectSlug });
    },
  );

  return { destinations, error, mutate, isValidating };
}
