import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

import type { Alert, NewAlert, UpdateAlert } from '../utils/types';

export async function createAlert(data: NewAlert) {
  const alert: Alert = await authenticatedPost('/alerts/createAlert', {
    ...data,
  });

  analytics.track('DC Create New Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export async function deleteAlert(alert: Alert) {
  try {
    await authenticatedPost('/alerts/deleteAlert', { id: alert.id });
    analytics.track('DC Remove Alert', {
      status: 'success',
      name: alert.id,
    });
    return true;
  } catch (e: any) {
    analytics.track('DC Remove Alert', {
      status: 'failure',
      name,
      error: e.message,
    });
    // TODO
    console.error('Failed to delete alert');
  }
  return false;
}

export async function disableDestinationForAlert(alertId: number, destinationId: number) {
  await authenticatedPost('/alerts/disableDestination', {
    alert: alertId,
    destination: destinationId,
  });

  analytics.track('DC Disable Destination for Alert', {
    status: 'success',
    id: alertId,
    destinationId: destinationId,
  });
}

export async function enableDestinationForAlert(alertId: number, destinationId: number) {
  await authenticatedPost('/alerts/enableDestination', {
    alert: alertId,
    destination: destinationId,
  });

  analytics.track('DC Enable Destination for Alert', {
    status: 'success',
    id: alertId,
    destinationId: destinationId,
  });
}

export async function updateAlert(data: UpdateAlert) {
  const alert: Alert = await authenticatedPost('/alerts/updateAlert', {
    ...data,
  });

  analytics.track('DC Update Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export function useAlert(alertId: number | undefined) {
  const { identity } = useIdentity();

  const {
    data: alert,
    error,
    mutate,
  } = useSWR<Alert>(
    identity && alertId ? ['/alerts/getAlertDetails', alertId, identity.uid] : null,
    async (key, alertId) => {
      return authenticatedPost(key, { id: alertId });
    },
  );

  return { alert, error, mutate };
}

export function useAlerts(projectSlug: string | undefined, environmentSubId: number | undefined) {
  const { identity } = useIdentity();
  const {
    data: alerts,
    error,
    mutate,
    isValidating,
  } = useSWR<Alert[]>(
    identity && projectSlug && environmentSubId
      ? ['/alerts/listAlerts', projectSlug, environmentSubId, identity.uid]
      : null,
    (key) => {
      return authenticatedPost(key, { environmentSubId, projectSlug });
    },
  );

  return { alerts, error, mutate, isValidating };
}
