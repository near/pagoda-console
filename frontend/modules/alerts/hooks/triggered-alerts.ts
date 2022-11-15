import { useEffect, useState } from 'react';
import useSWR from 'swr';

import type { Pagination } from '@/hooks/pagination';
import { useIdentity } from '@/hooks/user';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';

interface TriggeredAlertFilters {
  alertId?: number;
}

const refreshInterval = config.defaultLiveDataRefreshIntervalMs;

export function useTriggeredAlerts(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  pagination: Pagination,
  filters: TriggeredAlertFilters,
) {
  const [triggeredAlertsCount, setTriggeredAlertsCount] = useState<number>();

  const identity = useIdentity();
  const take = pagination.state.pageSize;
  const skip = (pagination.state.currentPage - 1) * pagination.state.pageSize;

  const { data, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? [
          '/triggeredAlerts/listTriggeredAlerts' as const,
          projectSlug,
          environmentSubId,
          identity.uid,
          skip,
          take,
          pagination.state.pagingDateTime,
          filters.alertId,
        ]
      : null,
    (key) => {
      return authenticatedPost(key, {
        environmentSubId: environmentSubId!,
        projectSlug: projectSlug!,
        take,
        skip,
        pagingDateTime: pagination.state.pagingDateTime?.toISOString(),
        alertId: filters?.alertId,
      });
    },
    {
      refreshInterval: pagination.state.liveRefreshEnabled ? refreshInterval : undefined,
    },
  );
  useEffect(() => {
    if (data?.count === undefined) return;
    setTriggeredAlertsCount(data.count);
  }, [data]);

  return {
    error,
    triggeredAlertsCount: triggeredAlertsCount,
    triggeredAlerts: data?.page,
  };
}

export function useTriggeredAlertDetails(slug: string) {
  const identity = useIdentity();
  const { data, error } = useSWR(
    identity ? ['/triggeredAlerts/getTriggeredAlertDetails' as const, slug] : null,
    (key) => {
      return authenticatedPost(key, {
        slug,
      });
    },
  );

  return {
    error,
    triggeredAlert: data,
  };
}
