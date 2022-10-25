import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import type { Pagination } from '@/hooks/pagination';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';

import type { TriggeredAlert, TriggeredAlertsPagingResponse } from '../utils/types';

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

  const { data, error } = useSWR<TriggeredAlertsPagingResponse>(
    identity && projectSlug && environmentSubId
      ? [
          '/triggeredAlerts/listTriggeredAlerts',
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
        environmentSubId,
        projectSlug,
        take,
        skip,
        pagingDateTime: pagination.state.pagingDateTime,
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
  const { data, error } = useSWR<TriggeredAlert>(
    identity ? ['/triggeredAlerts/getTriggeredAlertDetails', slug] : null,
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
