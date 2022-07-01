import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

import type { TriggeredAlert } from '../utils/types';

export function useTriggeredAlerts(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
): {
  triggeredAlerts?: TriggeredAlert[];
  error?: any;
} {
  const identity = useIdentity();
  const { data: triggeredAlerts, error } = useSWR(
    identity && projectSlug && environmentSubId
      ? ['/triggeredAlertHistory/listTriggeredAlerts', projectSlug, environmentSubId, identity.uid]
      : null,
    (key) => {
      return authenticatedPost(key, { environmentSubId, projectSlug });
    },
  );

  return { triggeredAlerts, error };
}
