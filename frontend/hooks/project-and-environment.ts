import type { User } from 'firebase/auth';
import router from 'next/router';
import { useEffect, useState } from 'react';

import { useEnvironments } from '@/hooks/environments';
import { useProject } from '@/hooks/projects';
import analytics from '@/utils/analytics';
import { updateUserData } from '@/utils/cache';
import type { Environment, UserData } from '@/utils/types';

import { useRouteParam } from './route';
import { useIdentity } from './user';

export function useProjectAndEnvironment() {
  const projectSlug = useRouteParam('project');
  const environmentSubIdRaw = useRouteParam('environment');
  const environmentSubId = typeof environmentSubIdRaw === 'string' ? parseInt(environmentSubIdRaw) : null;
  const { project } = useProject(projectSlug);
  const currentUser = useIdentity();

  const [environment, setEnvironment] = useState<Environment>();

  const { environmentData: environments } = useEnvironments(projectSlug);

  useEffect(() => {
    if (!projectSlug || !currentUser) return;

    if (!environmentSubId && environments) {
      // no environment was selected in query params, try to load from local storage or fallback to default
      const defaultEnvironment = getDefaultEnvironment(currentUser, projectSlug, environments);
      router.replace(`${router.pathname}?project=${projectSlug}&environment=${defaultEnvironment}`, undefined, {
        shallow: true,
      });
    } else if (!environment && environments && environmentSubId) {
      // environment selected in query params, now load it into state
      setEnvironment(environments.find((e) => e.subId === environmentSubId));
      setEnvironmentInLocalStorage(currentUser, projectSlug, environmentSubId);
    } else if (environments && environmentSubId && environment?.subId !== environmentSubId) {
      // new environment selected
      setEnvironment(environments.find((e) => e.subId === environmentSubId));
      setEnvironmentInLocalStorage(currentUser, projectSlug, environmentSubId);
      analytics.track('DC Switch Network');
    }
  }, [environmentSubId, projectSlug, environments, environment, currentUser]);

  return { environment, project, environments };
}

function setEnvironmentInLocalStorage(user: User, projectSlug: string, environmentSubId: number) {
  if (!user?.uid) {
    return;
  }
  updateUserData(user.uid, { projectData: { [projectSlug]: { selectedEnvironment: environmentSubId } } });
}

const defaultSubId = 1;
function getDefaultEnvironment(user: User, projectSlug: string, environments: Environment[]) {
  if (!user?.uid) {
    return defaultSubId;
  }
  const userDataRaw = localStorage.getItem(user.uid);
  const userData = userDataRaw ? (JSON.parse(userDataRaw) as UserData) : null;
  const previouslySelectedEnv = userData?.projectData?.[projectSlug]?.selectedEnvironment;

  // ensure that the previously selected environment is still valid
  if (previouslySelectedEnv && environments.find((e) => e.subId === previouslySelectedEnv)) {
    return previouslySelectedEnv;
  }
  return defaultSubId;
}
