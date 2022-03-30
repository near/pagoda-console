import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import analytics from './analytics';
import { updateUserData } from './cache';
import { useEnvironments, useProject } from './fetchers';
import type { Environment, UserData } from './interfaces';

export function useIdentity(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user;
}

export function useDisplayName(): string | null {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, (user: User | null) => {
      if (user?.displayName && displayName !== user?.displayName) {
        setDisplayName(user.displayName);
      }
    });

    return () => unsubscribe();
  }, [displayName]);

  return displayName;
}

export function useRouteParam(paramName: string, redirectIfMissing?: string): string | null {
  const { query, isReady } = useRouter();
  const rawParam = query[paramName];
  const value = rawParam && typeof rawParam === 'string' ? rawParam : null;
  useEffect(() => {
    if (isReady && !value && redirectIfMissing) {
      router.push(redirectIfMissing);
    }
  }, [value, isReady, redirectIfMissing]);

  return value;
}

export function useProjectAndEnvironment() {
  const projectSlug = useRouteParam('project');
  const environmentSubIdRaw = useRouteParam('environment');
  const environmentSubId = typeof environmentSubIdRaw === 'string' ? parseInt(environmentSubIdRaw) : null;
  const { project } = useProject(projectSlug);
  const currentUser = useIdentity();

  const [environment, setEnvironment] = useState<Environment>();

  const { environmentData: environments } = useEnvironments(projectSlug);
  useEffect(() => {
    if (!projectSlug || !currentUser) {
      return;
    }

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

export function usePageTracker() {
  const router = useRouter();
  // TODO check if we should user router.pathname in effects deps
  // or if it would run twice on transition, once in previous route
  // and once on new route
  useEffect(() => {
    let page;
    if (router.pathname === '/') {
      page = 'login';
    } else {
      page = router.pathname.substring(1);
    }
    page = page.toUpperCase();
    analytics.track(`DC View ${page} Page`);
  }, [router.pathname]);
}
