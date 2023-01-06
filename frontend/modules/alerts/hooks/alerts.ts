import type { Api } from '@pc/common/types/api';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { mutationApi, queryApi } from '@/utils/api';

export async function createAlert(data: Api.Mutation.Input<'/alerts/createAlert'>) {
  const alert = await mutationApi('/alerts/createAlert', { ...data });

  analytics.track('DC Create New Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export async function deleteAlert(alert: Api.Mutation.Input<'/alerts/deleteAlert'>) {
  try {
    await mutationApi('/alerts/deleteAlert', { id: alert.id });
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
  await mutationApi('/alerts/disableDestination', { alert: alertId, destination: destinationId });

  analytics.track('DC Disable Destination for Alert', {
    status: 'success',
    id: alertId,
    destinationId: destinationId,
  });
}

export async function enableDestinationForAlert(alertId: number, destinationId: number) {
  await mutationApi('/alerts/enableDestination', { alert: alertId, destination: destinationId });

  analytics.track('DC Enable Destination for Alert', {
    status: 'success',
    id: alertId,
    destinationId: destinationId,
  });
}

export async function updateAlert(data: Api.Mutation.Input<'/alerts/updateAlert'>) {
  const alert = await mutationApi('/alerts/updateAlert', { ...data });

  analytics.track('DC Update Alert', {
    status: 'success',
    name: alert.name,
    id: alert.id,
  });

  return alert;
}

export function useAlert(alertId: number | undefined) {
  const { identity } = useAuth();

  const {
    data: alert,
    error,
    mutate,
  } = useSWR(
    identity && alertId ? ['/alerts/getAlertDetails' as const, alertId, identity.uid] : null,
    async (path, alertId) => {
      return queryApi(path, { id: alertId });
    },
  );

  return { alert, error, mutate };
}

export function useAlerts(projectSlug: string | undefined, environmentSubId: number | undefined) {
  const { identity } = useAuth();
  const {
    data: alerts,
    error,
    mutate,
    isValidating,
  } = useSWR(
    identity && projectSlug && environmentSubId
      ? ['/alerts/listAlerts' as const, projectSlug, environmentSubId, identity.uid]
      : null,
    (path, projectSlug, environmentSubId) => {
      return queryApi(path, { environmentSubId, projectSlug });
    },
  );

  return { alerts, error, mutate, isValidating };
}
