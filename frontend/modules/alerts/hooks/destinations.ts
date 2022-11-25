import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { openToast } from '@/components/lib/Toast';
import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';
import type { MapDiscriminatedUnion } from '@/utils/types';

export async function createDestination(data: Api.Mutation.Input<'/alerts/createDestination'>) {
  const destination = await fetchApi(['/alerts/createDestination', { ...data }]);

  analytics.track('DC Create New Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination;
}

export async function deleteDestination(destination: Api.Mutation.Input<'/alerts/deleteDestination'>) {
  try {
    await fetchApi(['/alerts/deleteDestination', { id: destination.id }]);
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

export async function updateDestination<K extends Alerts.Destination['type']>(
  data: Api.Mutation.Input<'/alerts/updateDestination'>,
) {
  const destination = await fetchApi(['/alerts/updateDestination', { ...data }]);

  analytics.track('DC Update Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination as MapDiscriminatedUnion<Alerts.Destination, 'type'>[K];
}

export function useDestinations(projectSlug: Projects.ProjectSlug) {
  const { identity } = useAuth();

  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/alerts/listDestinations' as const, projectSlug, identity.uid] : null, (key) => {
    return fetchApi([key, { projectSlug }]);
  });

  return { destinations, error, mutate, isValidating };
}

export async function resendEmailVerification(destinationId: Alerts.DestinationId) {
  try {
    await fetchApi(['/alerts/resendEmailVerification', { destinationId }]);

    analytics.track('DC Resend Email Verification for Email Destination', {
      status: 'success',
      name: destinationId,
    });

    openToast({
      type: 'success',
      title: 'Verification Sent',
      description: 'Check your inbox and spam folder.',
    });

    return true;
  } catch (e: any) {
    analytics.track('DC Resend Email Verification for Email Destination', {
      status: 'failure',
      error: e.message,
    });

    openToast({
      type: 'error',
      title: 'Send Failure',
      description: `Failed to send verification email. Please try again later.`,
    });

    return false;
  }
}

export async function rotateWebhookDestinationSecret(destinationId: Alerts.DestinationId) {
  const destination = await fetchApi(['/alerts/rotateWebhookDestinationSecret', { destinationId }]);

  analytics.track('DC Rotate Webhook Destination Secret', {
    status: 'success',
    id: destination.id,
  });

  return destination;
}
