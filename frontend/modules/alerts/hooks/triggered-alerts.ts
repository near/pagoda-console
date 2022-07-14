import { useEffect, useState } from 'react';
import useSWR from 'swr';

import type { Pagination } from '@/hooks/pagination';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

import type { TriggeredAlert } from '../utils/types';

const refreshInterval = 3000;

export function useTriggeredAlertsCount(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  pagination: Pagination,
) {
  const [triggeredAlertsCount, setTriggeredAlertsCount] = useState<number>();

  const identity = useIdentity();

  const { data, error } = useSWR<number>(
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
    {
      refreshInterval: pagination.state.liveRefreshEnabled ? refreshInterval : undefined,
    },
  );

  useEffect(() => {
    if (data === undefined) return;
    setTriggeredAlertsCount(data);
  }, [data]);

  return { triggeredAlertsCount, error };
}

export function useTriggeredAlerts(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
  pagination: Pagination,
) {
  const identity = useIdentity();
  const take = pagination.state.pageSize;
  const skip = (pagination.state.currentPage - 1) * pagination.state.pageSize;

  const { data, error } = useSWR<TriggeredAlert[]>(
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
    {
      refreshInterval: pagination.state.liveRefreshEnabled ? refreshInterval : undefined,
    },
  );

  return {
    error,
    triggeredAlerts: data,
  };
}
