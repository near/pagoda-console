import useSWR from 'swr';

import { fetchApi } from '@/utils/http';

export function useAlert(alertId: number | undefined) {
  const {
    data: alert,
    error,
    mutate,
  } = useSWR(alertId ? ['/alerts/getAlertDetails' as const, alertId] : null, async (key, alertId) => {
    return fetchApi([key, { id: alertId }]);
  });

  return { alert, error, mutate };
}

export function useAlerts(projectSlug: string | undefined, environmentSubId: number | undefined) {
  const {
    data: alerts,
    error,
    mutate,
    isValidating,
  } = useSWR(
    projectSlug && environmentSubId ? ['/alerts/listAlerts' as const, projectSlug, environmentSubId] : null,
    (key) => {
      return fetchApi([key, { environmentSubId: environmentSubId!, projectSlug: projectSlug! }]);
    },
  );

  return { alerts, error, mutate, isValidating };
}
