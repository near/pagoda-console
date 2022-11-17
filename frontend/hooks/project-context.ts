import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';

import { useRouteParam } from '@/hooks/route';
import { useIdentity } from '@/hooks/user';
import { useSettingsStore } from '@/stores/settings';
import type { UserSettings } from '@/stores/settings/types';

const getCurrentEnvironmentSubId = (userSettings: UserSettings | undefined) =>
  userSettings?.projects[userSettings.selectedProjectSlug || '']?.selectedEnvironmentSubId;

const useUpdateProjectContext = () => {
  const identityUid = useIdentity()?.uid;
  const updateSettings = useSettingsStore((store) => store.updateSettings);
  const updateProjectSettings = useSettingsStore((store) => store.updateProjectSettings);

  return useCallback(
    (selectedProjectSlug: string | undefined, selectedEnvironmentSubId: number | null) => {
      if (!identityUid) {
        return;
      }
      updateSettings(identityUid, { selectedProjectSlug });
      if (selectedProjectSlug) {
        const currentEnvironmentSubId = getCurrentEnvironmentSubId(useSettingsStore.getState().currentUser);
        if (typeof selectedEnvironmentSubId === 'number') {
          updateProjectSettings(identityUid, selectedProjectSlug, { selectedEnvironmentSubId });
          // null selectedEnvironmentSubId says we should either use saved one or fallback to default
        } else if (currentEnvironmentSubId === undefined) {
          updateProjectSettings(identityUid, selectedProjectSlug, { selectedEnvironmentSubId: 1 });
        }
      }
    },
    [identityUid, updateSettings, updateProjectSettings],
  );
};

// Moving project & environment route params to local storage
const useMoveProjectContextToLocalStorage = () => {
  const routeProjectSlug = useRouteParam('project');
  const rawRouteEnvironmentSubId = useRouteParam('environment');
  const routeEnvironmentSubId = rawRouteEnvironmentSubId ? Number(rawRouteEnvironmentSubId) : Number.NaN;
  const updateProjectContext = useUpdateProjectContext();
  const router = useRouter();
  useEffect(() => {
    if (!routeProjectSlug) {
      return;
    }
    updateProjectContext(routeProjectSlug, Number.isNaN(routeEnvironmentSubId) ? null : routeEnvironmentSubId);
    const params = new URLSearchParams(router.query as Record<string, string>);
    params.delete('project');
    params.delete('environment');
    router.replace({ pathname: router.pathname, query: params.toString() }, undefined, { shallow: true });
  }, [router, updateProjectContext, routeProjectSlug, routeEnvironmentSubId]);
};

export const useMaybeProjectContext = () => {
  const updateContext = useUpdateProjectContext();
  useMoveProjectContextToLocalStorage();

  const userSettings = useSettingsStore((store) => store.currentUser);
  const projectSlug = userSettings?.selectedProjectSlug;
  const environmentSubId = getCurrentEnvironmentSubId(userSettings);

  return useMemo(
    () => ({ projectSlug, environmentSubId, updateContext }),
    [projectSlug, environmentSubId, updateContext],
  );
};

export const useSureProjectContext = () => {
  const { projectSlug, environmentSubId, updateContext } = useMaybeProjectContext();
  if (projectSlug === undefined || environmentSubId === undefined) {
    throw new Error('Expected the page to have projectSlug and environmentSubId in context');
  }
  return useMemo(
    () => ({ projectSlug, environmentSubId, updateContext }),
    [projectSlug, environmentSubId, updateContext],
  );
};
