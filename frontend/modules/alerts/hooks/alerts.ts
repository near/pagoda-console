import type { Alerts } from '@pc/common/types/alerts';
import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

export function useAlert(alertId: Alerts.AlertId | undefined) {
  const { identity } = useAuth();

  const {
    data: alert,
    error,
    mutate,
  } = useSWR(
    identity && alertId ? ['/alerts/getAlertDetails' as const, alertId, identity.uid] : null,
    async (key, alertId) => {
      return fetchApi([key, { id: alertId }]);
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
    return fetchApi([key, { environmentSubId, projectSlug }]);
  });

  return { alerts, error, mutate, isValidating };
}
