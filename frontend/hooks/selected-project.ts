import router from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSettingsStoreForUser } from '@/stores/settings';
import type { Environment, Project } from '@/utils/types';

import { useEnvironments } from './environments';
import { usePreviousValue } from './previous-value';
import { useProject } from './projects';
import { useRouteParam } from './route';

interface Options {
  enforceSelectedProject?: boolean;
}

export function useSelectedProject(
  options: Options = {
    enforceSelectedProject: true,
  },
) {
  const projectSlugRouteParam = useRouteParam('project');

  const [environment, setEnvironment] = useState<Environment>();
  const { projectSettings, settings, settingsInitialized, updateSettings, updateProjectSettings } =
    useSettingsStoreForUser();
  const { project } = useProject(settings?.selectedProjectSlug);
  const { environments } = useEnvironments(settings?.selectedProjectSlug);

  const selectEnvironment = useCallback(
    (environmentSubId: number) => {
      if (environmentSubId === projectSettings.selectedEnvironmentSubId) return;
      updateProjectSettings({
        selectedEnvironmentSubId: environmentSubId,
      });
    },
    [projectSettings, updateProjectSettings],
  );

  const selectProject = useCallback(
    (projectSlug: string) => {
      if (projectSlug === settings.selectedProjectSlug) return;
      updateSettings({
        selectedProjectSlug: projectSlug,
      });
    },
    [updateSettings, settings],
  );

  // Conditionally redirect to force user to select project:

  useEffect(() => {
    if (
      !options.enforceSelectedProject ||
      !settingsInitialized ||
      settings.selectedProjectSlug ||
      projectSlugRouteParam
    ) {
      return;
    }

    router.push('/projects');
  }, [options, projectSlugRouteParam, settingsInitialized, settings]);

  // Sync local state with selected environment:

  useEffect(() => {
    if (!environments) return;
    const selectedEnvironmentSubId = projectSettings.selectedEnvironmentSubId || 1;
    setEnvironment(environments.find((e) => e.subId === selectedEnvironmentSubId) || environments[0]);
  }, [environments, projectSettings]);

  return {
    environment,
    environments,
    project,
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
  selectedProjectSlug: Project['slug'] | undefined,
) {
  const { environment, project, selectEnvironment, selectProject } = useSelectedProject();
  const [hasSelectedProjectSyncRun, setHasSelectedProjectSyncRun] = useState(false);

  useEffect(() => {
    if (!environment || !project || !selectedProjectSlug || !selectedEnvironmentSubId || hasSelectedProjectSyncRun)
      return;

    setHasSelectedProjectSyncRun(true);

    if (selectedProjectSlug === project.slug && selectedEnvironmentSubId === environment.subId) return;

    if (selectedProjectSlug !== project.slug) {
      selectProject(selectedProjectSlug);
    }
    if (selectedEnvironmentSubId !== environment.subId) {
      selectEnvironment(selectedEnvironmentSubId);
    }
  }, [
    environment,
    project,
    hasSelectedProjectSyncRun,
    selectEnvironment,
    selectProject,
    selectedEnvironmentSubId,
    selectedProjectSlug,
  ]);
}

export function useSelectedProjectRouteParamSync() {
  const { settingsInitialized, updateSettings, updateProjectSettings } = useSettingsStoreForUser();
  const projectSlugRouteParam = useRouteParam('project');
  const environmentSubIdRouteParam = useRouteParam('environment');
  const hasSelected = useRef(false);

  // Change selected project/environment via URL query param:

  useEffect(() => {
    if (!settingsInitialized || hasSelected.current) return;

    if (projectSlugRouteParam) {
      updateSettings({
        selectedProjectSlug: projectSlugRouteParam,
      });
    }

    if (environmentSubIdRouteParam) {
      updateProjectSettings({
        selectedEnvironmentSubId: parseInt(environmentSubIdRouteParam),
      });
    }

    if (projectSlugRouteParam || environmentSubIdRouteParam) {
      router.replace(router.pathname, undefined, {
        shallow: true,
      });

      hasSelected.current = true;
    }
  }, [
    hasSelected,
    updateSettings,
    updateProjectSettings,
    settingsInitialized,
    projectSlugRouteParam,
    environmentSubIdRouteParam,
  ]);
}
