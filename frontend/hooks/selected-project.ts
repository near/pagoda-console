import router from 'next/router';
import { useEffect, useState } from 'react';

import { useSettingsStoreForUser } from '@/stores/settings';
import type { Environment } from '@/utils/types';

import { useEnvironments } from './environments';
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
  const environmentSubIdRouteParam = useRouteParam('environment');
  const [environment, setEnvironment] = useState<Environment>();
  const { projectSettings, settings, settingsInitialized, updateSettings, updateProjectSettings } =
    useSettingsStoreForUser();
  const { project } = useProject(settings?.selectedProjectSlug);
  const { environments } = useEnvironments(settings?.selectedProjectSlug);

  // Conditionally redirect to force user to select project:

  useEffect(() => {
    if (!options.enforceSelectedProject || !settingsInitialized || settings.selectedProjectSlug) return;
    router.push('/projects');
  }, [options, settingsInitialized, settings]);

  // Sync local state with selected environment:

  useEffect(() => {
    if (!environments) return;
    const selectedEnvironmentSubId = projectSettings.selectedEnvironmentSubId || 1;
    setEnvironment(environments.find((e) => e.subId === selectedEnvironmentSubId) || environments[0]);
  }, [environments, projectSettings]);

  // Overwrite selections via query params:

  useEffect(() => {
    if (!settingsInitialized) return;

    if (projectSlugRouteParam) {
      selectProject(projectSlugRouteParam);
    }
    if (environmentSubIdRouteParam) {
      selectEnvironment(parseInt(environmentSubIdRouteParam));
    }

    router.replace(router.pathname, undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsInitialized, projectSlugRouteParam, environmentSubIdRouteParam]);

  function selectEnvironment(environmentSubId: number) {
    updateProjectSettings({
      selectedEnvironmentSubId: environmentSubId,
    });
  }

  function selectProject(projectSlug: string) {
    updateSettings({
      selectedProjectSlug: projectSlug,
    });
  }

  return {
    environment,
    environments,
    project,
    selectEnvironment,
    selectProject,
  };
}
