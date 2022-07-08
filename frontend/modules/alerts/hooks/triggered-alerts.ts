import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

import type { TriggeredAlert } from '../utils/types';

export function useTriggeredAlertsCount(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  liveUpdatesEnabled: boolean | true,
  pagingDateTime: Date | undefined,
): {
  triggeredAlertsCount?: number;
  error?: any;
} {
  const identity = useIdentity();
  const swrOptions = liveUpdatesEnabled
    ? {
        refreshInterval: 3000,
      }
    : undefined;
  const { data: triggeredAlertsCount, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? ['/triggeredAlertHistory/countTriggeredAlerts', projectSlug, environmentSubId, identity.uid, pagingDateTime]
      : null,
    (key) => {
      return authenticatedPost(key, { environmentSubId, projectSlug, pagingDateTime });
    },
    swrOptions,
  );
  return { triggeredAlertsCount, error };
}

export function useTriggeredAlerts(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  resultsPage: number | 1,
  liveUpdatesEnabled: boolean | true,
  pagingDateTime: Date | undefined,
  pageSize: number | 5,
): {
  triggeredAlerts?: TriggeredAlert[];
  error?: any;
} {
  const identity = useIdentity();
  const take = pageSize;
  const skip = (resultsPage - 1) * pageSize;
  const swrOptions = liveUpdatesEnabled
    ? {
        refreshInterval: 3000,
      }
    : undefined;
  const { data: triggeredAlerts, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? [
          '/triggeredAlertHistory/listTriggeredAlerts',
          projectSlug,
          environmentSubId,
          identity.uid,
          skip,
          take,
          pagingDateTime,
        ]
      : null,
    (key) => {
      return authenticatedPost(key, { environmentSubId, projectSlug, take, skip, pagingDateTime });
    },
    swrOptions,
  );
  return { triggeredAlerts, error };
}
