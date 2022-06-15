// import mixpanel from 'mixpanel-browser';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

// import { mutate } from 'swr';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

import type { Alert } from '../utils/types';

// export async function deleteAlert(userId: string | undefined, alertId: number, name: string) {
//   try {
//     await authenticatedPost('/alerts/deleteAlert', { id: alertId });
//     mixpanel.track('DC Remove Alert', {
//       status: 'success',
//       name,
//     });
//     // Update the SWR cache before a refetch for better UX.
//     mutate<Alert[]>(userId ? ['/alerts/alerts/list', userId] : null, async (alerts) => {
//       return alerts?.filter((r) => r.id !== alertId);
//     });
//     return true;
//   } catch (e: any) {
//     mixpanel.track('DC Remove Alert', {
//       status: 'failure',
//       name,
//       error: e.message,
//     });
//     // TODO
//     console.error('Failed to delete alert');
//   }
//   return false;
// }

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
