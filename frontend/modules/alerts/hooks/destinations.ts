import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';

import { openToast } from '@/components/lib/Toast';
import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { MapDiscriminatedUnion } from '@/utils/types';

export async function createDestination(data: Api.Mutation.Input<'/alerts/createDestination'>) {
  const destination = await authenticatedPost('/alerts/createDestination', {
    ...data,
  });

  analytics.track('DC Create New Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination;
}

export async function deleteDestination(destination: Api.Mutation.Input<'/alerts/deleteDestination'>) {
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

export async function updateDestination<K extends Alerts.Destination['type']>(
  data: Api.Mutation.Input<'/alerts/updateDestination'>,
) {
  const destination = await authenticatedPost('/alerts/updateDestination', {
    ...data,
  });

  analytics.track('DC Update Destination', {
    status: 'success',
    name: destination.name,
    id: destination.id,
  });

  return destination as MapDiscriminatedUnion<Alerts.Destination, 'type'>[K];
}

export function useDestinations(projectSlug: string | undefined) {
  const identity = useIdentity();

  const {
    data: destinations,
    error,
    mutate,
    isValidating,
  } = useSWR(
    identity && projectSlug ? ['/alerts/listDestinations' as const, projectSlug, identity.uid] : null,
    (key) => {
      return authenticatedPost(key, { projectSlug: projectSlug! });
    },
  );

  return { destinations, error, mutate, isValidating };
}

export async function resendEmailVerification(destinationId: number) {
  try {
    await authenticatedPost('/alerts/resendEmailVerification', { destinationId });

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

export async function rotateWebhookDestinationSecret(destinationId: number) {
  const destination = await authenticatedPost('/alerts/rotateWebhookDestinationSecret', {
    destinationId,
  });

  analytics.track('DC Rotate Webhook Destination Secret', {
    status: 'success',
    id: destination.id,
  });

  return destination;
}
