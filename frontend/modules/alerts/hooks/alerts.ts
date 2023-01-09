import useSWR from 'swr';

import { useApiMutation } from '@/hooks/api-mutation';
import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { api } from '@/utils/api';
import { handleMutationError } from '@/utils/error-handlers';

export function useAlertMutations() {
  const updateAlertMutation = useApiMutation('/alerts/updateAlert', {
    onSuccess: (alert) => {
      analytics.track('DC Update Alert', {
        status: 'success',
        name: alert.name,
        id: alert.id,
      });
    },
  });

  const enableDestinationMutation = useApiMutation('/alerts/enableDestination', {
    onSuccess: (result, variables) => {
      analytics.track('DC Enable Destination for Alert', {
        status: 'success',
        id: variables.alert,
        destinationId: variables.destination,
      });
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Enable Destination for Alert',
        toastTitle: 'Update Error',
        toastDescription: 'Failed to update alert destination.',
      });
    },
  });

  const disableDestinationMutation = useApiMutation('/alerts/disableDestination', {
    onSuccess: (result, variables) => {
      analytics.track('DC Disable Destination for Alert', {
        status: 'success',
        id: variables.alert,
        destinationId: variables.destination,
      });
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Disable Destination for Alert',
        toastTitle: 'Update Error',
        toastDescription: 'Failed to update alert destination.',
      });
    },
  });

  return { updateAlertMutation, enableDestinationMutation, disableDestinationMutation };
}

export function useAlert(alertId: number | undefined) {
  const { identity } = useAuth();

  const {
    data: alert,
    error,
    mutate,
  } = useSWR(
    identity && alertId ? ['/alerts/getAlertDetails' as const, alertId, identity.uid] : null,
    async (path, id) => {
      return api.query(path, { id });
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
      return api.query(path, { environmentSubId, projectSlug });
    },
  );

  return { alerts, error, mutate, isValidating };
}
