import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

// import { mutate } from 'swr';
import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

import type { Alert, NewAlert } from '../utils/types';

export async function createAlert(data: NewAlert) {
  const txRule = data.type === 'TX_SUCCESS' || data.type === 'TX_FAILURE' ? data.txRule || {} : undefined;

  const alert: Alert = await authenticatedPost(
    '/alerts/createAlert',
    {
      type: data.type,
      contract: data.contractId,
      environment: data.environmentSubId,
      acctBalRule: data.acctBalRule,
      eventRule: data.eventRule,
      fnCallRule: data.fnCallRule,
      txRule,
    },
    { forceRefresh: true },
  );

  // TODO: Mutate cache

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

    // TODO: Mutate cache

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

export function useAlert(alertId: number | undefined): { alert?: Alert; error?: any } {
  const identity = useIdentity();

  const { data: alert, error } = useSWR(
    identity && alertId ? ['/alerts/getAlertDetails', alertId, identity.uid] : null,
    async (key, alertId) => {
      return authenticatedPost(key, { id: alertId });
    },
  );

  return { alert, error };
}

export function useAlerts(environmentId: number | undefined): {
  alerts?: Alert[];
  error?: any;
  mutate: KeyedMutator<any>;
  isValidating: boolean;
} {
  const identity = useIdentity();
  const {
    data: alerts,
    error,
    mutate,
    isValidating,
  } = useSWR(identity && environmentId ? ['/alerts/listAlerts', environmentId, identity.uid] : null, (key) => {
    return authenticatedPost(key, { environment: environmentId });
  });

  return { alerts, error, mutate, isValidating };
}
