import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

export async function createAlert(data: Api.Mutation.Input<'/alerts/createAlert'>) {
  const alert = await authenticatedPost('/alerts/createAlert', {
    ...data,
  });

  analytics.track('DC Create New Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export async function deleteAlert(alert: Api.Mutation.Input<'/alerts/deleteAlert'>) {
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

export async function disableDestinationForAlert(alertId: Alerts.AlertId, destinationId: Alerts.DestinationId) {
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

export async function enableDestinationForAlert(alertId: Alerts.AlertId, destinationId: Alerts.DestinationId) {
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

export async function updateAlert(data: Api.Mutation.Input<'/alerts/updateAlert'>) {
  const alert = await authenticatedPost('/alerts/updateAlert', {
    ...data,
  });

  analytics.track('DC Update Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export function useAlert(alertId: Alerts.AlertId | undefined) {
  const { identity } = useAuth();

  const {
    data: alert,
    error,
    mutate,
  } = useSWR(
    identity && alertId ? ['/alerts/getAlertDetails' as const, alertId, identity.uid] : null,
    async (key, alertId) => {
      return authenticatedPost(key, { id: alertId });
    },
  );

  return { alert, error, mutate };
}

export function useAlerts(projectSlug: Projects.ProjectSlug, environmentSubId: Projects.EnvironmentId) {
  const { identity } = useAuth();
  const {
    data: alerts,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/alerts/listAlerts' as const, projectSlug, environmentSubId, identity.uid] : null, (key) => {
    return authenticatedPost(key, { environmentSubId, projectSlug });
  });

  return { alerts, error, mutate, isValidating };
}
