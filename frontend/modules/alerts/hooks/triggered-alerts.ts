import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import type { Pagination } from '@/hooks/pagination';
import { api } from '@/utils/api';
import config from '@/utils/config';

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

  const { identity } = useAuth();
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
    (path, projectSlug, environmentSubId) => {
      return api.query(path, {
        environmentSubId,
        projectSlug,
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
  const { identity } = useAuth();

  const { data, error } = useSWR(
    identity ? ['/triggeredAlerts/getTriggeredAlertDetails' as const, slug] : null,
    (path) => {
      return api.query(path, { slug });
    },
  );

  return {
    error,
    triggeredAlert: data,
  };
}
