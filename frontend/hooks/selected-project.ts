import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { usePublicStore } from '@/stores/public';
import { useSettingsStore } from '@/stores/settings';
import config from '@/utils/config';

import { useAuth } from './auth';
import { useEnvironments } from './environments';
import { usePreviousValue } from './previous-value';
import { useProject } from './projects';
import { usePublicMode } from './public';
import { useRouteParam } from './route';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

interface Options {
  enforceSelectedProject?: boolean;
}

export function useSelectedProject(
  options: Options = {
    enforceSelectedProject: true,
  },
) {
  const router = useRouter();
  const projectSlugRouteParam = useRouteParam('project');
  const settings = useSettingsStore((store) => store.currentUser);
  const { project } = useProject(settings?.selectedProjectSlug);
  const { environments } = useEnvironments(settings?.selectedProjectSlug);
  const [environment, setEnvironment] = useState<Environment>();
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);

  // Compute the currently selected environment:

  useEffect(() => {
    if (settings && project) {
      const projectSettings = settings.projects[project.slug];
      const env = environments?.find((e) => e.subId === projectSettings?.selectedEnvironmentSubId) || environments?.[0];

      if (env) {
        setEnvironment(env);
      }
    }
  }, [environments, project, settings]);

  // Conditionally redirect to force user to select project:

  useEffect(() => {
    if (
      !options.enforceSelectedProject ||
      projectSlugRouteParam ||
      !settings ||
      settings.selectedProjectSlug ||
      !publicModeHasHydrated ||
      publicModeIsActive
    ) {
      return;
    }

    if (config.deployEnv === 'LOCAL') {
      console.warn('The following router abort error can be safely ignored in local dev mode:');
      /*
        Next Router throws a harmless error when router.replace() is called rapidly in dev mode.
        We can safely ignore this for now. Let's keep an eye on Next Router and React updates.
      */
    }

    router.replace('/projects');
  }, [options, projectSlugRouteParam, publicModeHasHydrated, publicModeIsActive, router, settings]);

  return {
    environment,
    environments,
    project,
  };
}

export function useProjectSelector() {
  const { identity } = useAuth();
  const updateSettings = useSettingsStore((store) => store.updateSettings);
  const updateProjectSettings = useSettingsStore((store) => store.updateProjectSettings);

  const selectProject = useCallback(
    (selectedProjectSlug?: string) => {
      if (!identity) throw new Error('Attempted to call selectProject() without an identity');

      updateSettings(identity.uid, {
        selectedProjectSlug,
      });
    },
    [identity, updateSettings],
  );

  const selectEnvironment = useCallback(
    (selectedProjectSlug: string, selectedEnvironmentSubId: number) => {
      if (!identity) throw new Error('Attempted to call selectEnvironment() without an identity');

      updateProjectSettings(identity.uid, selectedProjectSlug, {
        selectedEnvironmentSubId,
      });
    },
    [identity, updateProjectSettings],
  );

  return {
    selectEnvironment,
    selectProject,
  };
}

export function useOnSelectedProjectChange(onChange: () => void) {
  const { environment, project } = useSelectedProject();

  const previousEnvironment = usePreviousValue(environment);
  const previousProject = usePreviousValue(project);

  useEffect(() => {
    if (!previousEnvironment || !previousProject) return;

    if (previousEnvironment.subId !== environment?.subId || previousProject.slug !== project?.slug) {
      onChange();
    }
  });
}

export function useSelectedProjectSync(
  selectedEnvironmentSubId: Environment['subId'] | undefined,
  selectedProjectSlug: string | undefined,
) {
  const settings = useSettingsStore((store) => store.currentUser);
  const { environment, project } = useSelectedProject();
  const [hasSelectedProjectSyncRun, setHasSelectedProjectSyncRun] = useState(false);
  const { selectEnvironment, selectProject } = useProjectSelector();

  useEffect(() => {
    if (!environment || !project || !selectedProjectSlug || !selectedEnvironmentSubId || hasSelectedProjectSyncRun)
      return;

    setHasSelectedProjectSyncRun(true);

    if (selectedProjectSlug !== project.slug) {
      selectProject(selectedProjectSlug);
    }

    if (selectedEnvironmentSubId !== environment.subId) {
      selectEnvironment(selectedProjectSlug, selectedEnvironmentSubId);
    }
  }, [
    environment,
    hasSelectedProjectSyncRun,
    project,
    selectEnvironment,
    selectProject,
    selectedEnvironmentSubId,
    selectedProjectSlug,
    settings,
  ]);
}

export function useSelectedProjectRouteParamSync() {
  const { deactivatePublicMode } = usePublicMode();
  const hasInitialized = useSettingsStore((store) => store.hasInitialized);
  const { selectEnvironment, selectProject } = useProjectSelector();
  const projectSlugRouteParam = useRouteParam('project');
  const environmentSubIdRouteParam = useRouteParam('environment');
  const router = useRouter();

  // Change selected project/environment via URL query param:

  useEffect(() => {
    if (!hasInitialized) return;

    if (projectSlugRouteParam) {
      deactivatePublicMode();
      selectProject(projectSlugRouteParam);

      if (environmentSubIdRouteParam) {
        selectEnvironment(projectSlugRouteParam, parseInt(environmentSubIdRouteParam));
      }
    }

    if (projectSlugRouteParam || environmentSubIdRouteParam) {
      router.replace(router.pathname, undefined, {
        shallow: true,
      });
    }
  }, [
    deactivatePublicMode,
    environmentSubIdRouteParam,
    hasInitialized,
    projectSlugRouteParam,
    router,
    selectEnvironment,
    selectProject,
  ]);
}
