import { useEffect, useState } from 'react';
import useSWR from 'swr';

import type { Pagination } from '@/hooks/pagination';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

import type { TriggeredAlert } from '../utils/types';

export function useTriggeredAlertsCount(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  pagination: Pagination,
): {
  triggeredAlertsCount?: number;
  error?: any;
} {
  const identity = useIdentity();
  const swrOptions = pagination.state.liveRefreshEnabled
    ? {
        refreshInterval: 3000,
      }
    : undefined;
  const { data: triggeredAlertsCount, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? [
          '/triggeredAlertHistory/countTriggeredAlerts',
          projectSlug,
          environmentSubId,
          identity.uid,
          pagination.state.pagingDateTime,
        ]
      : null,
    (key) => {
      return authenticatedPost(key, {
        environmentSubId,
        projectSlug,
        pagingDateTime: pagination.state.pagingDateTime,
      });
    },
    swrOptions,
  );
  return { triggeredAlertsCount, error };
}

export function useTriggeredAlerts(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  pagination: Pagination,
): {
  error?: any;
  isLoadingPage: boolean;
  triggeredAlerts?: TriggeredAlert[];
} {
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>();
  const identity = useIdentity();
  const take = pagination.state.pageSize;
  const skip = (pagination.state.currentPage - 1) * pagination.state.pageSize;
  const swrOptions = pagination.state.liveRefreshEnabled
    ? {
        refreshInterval: 3000,
      }
    : undefined;

  const { data, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? [
          '/triggeredAlertHistory/listTriggeredAlerts',
          projectSlug,
          environmentSubId,
          identity.uid,
          skip,
          take,
          pagination.state.pagingDateTime,
        ]
      : null,
    (key) => {
      return authenticatedPost(key, {
        environmentSubId,
        projectSlug,
        take,
        skip,
        pagingDateTime: pagination.state.pagingDateTime,
      });
    },
    swrOptions,
  );

  useEffect(() => {
    if (!data) return;
    setTriggeredAlerts(data);
  }, [data]);

  return {
    error,
    isLoadingPage: !data,
    triggeredAlerts,
  };
}
