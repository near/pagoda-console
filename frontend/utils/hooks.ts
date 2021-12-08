import { useState, useEffect } from 'react';
import router, { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import { getAuth, onAuthStateChanged, User, getIdToken } from "firebase/auth";
import { authenticatedPost, useEnvironments, useProject } from './fetchers';
import { Environment } from './interfaces';


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;


export function useIdentity(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
    });

    return () => unsubscribe(); // TODO why lambda function?
  }, []);

  return user;
}

export function useRouteParam(paramName: string, redirectIfMissing?: string): string | null {
  const { query, isReady, pathname } = useRouter();
  const rawParam = query[paramName];
  const value = (rawParam && typeof rawParam === 'string') ? rawParam : null
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
  const { project, error: projectError } = useProject(projectSlug);
  const currentUser = useIdentity();

  let [environment, setEnvironment] = useState<Environment>();

  const { environmentData: environments, error: environmentsError } = useEnvironments(projectSlug);
  useEffect(() => {
    if (!projectSlug || !currentUser) {
      return;
    }

    if (!environmentSubId && environments) {
      // if we have loaded the environments but non was selected in query params, default to the
      // first environment which should be Testnet
      const defaultEnvironment = getDefaultEnvironment(currentUser, projectSlug, environments);
      router.replace(`${router.pathname}?project=${projectSlug}&environment=${defaultEnvironment}`, undefined, { shallow: true });
    } else if (!environment && environments && environmentSubId) {
      // environment selected in query params, now load it into state
      setEnvironment(environments.find(e => e.subId === environmentSubId));
      setEnvironmentInLocalStorage(currentUser, projectSlug, environmentSubId);
    } else if (environments && environmentSubId && environment?.subId !== environmentSubId) {
      // new environment selected
      setEnvironment(environments.find(e => e.subId === environmentSubId));
      setEnvironmentInLocalStorage(currentUser, projectSlug, environmentSubId);
    }
  }, [environmentSubId, projectSlug, environments, environment, currentUser]);

  return { environment, project, environments };
}

interface UserData {
  selectedEnvironments: Record<string, number>
}

function setEnvironmentInLocalStorage(user: User, projectSlug: string, environmentSubId: number) {
  if (!user?.uid) {
    return;
  }
  const userDataRaw = localStorage.getItem(user.uid)
  const userData = userDataRaw ? JSON.parse(userDataRaw) as UserData : { selectedEnvironments: {} };
  userData.selectedEnvironments[projectSlug] = environmentSubId;
  localStorage.setItem(user.uid, JSON.stringify(userData));
}

const defaultSubId = 1;
function getDefaultEnvironment(user: User, projectSlug: string, environments: Environment[]) {
  if (!user?.uid) {
    return defaultSubId;
  }
  const userDataRaw = localStorage.getItem(user.uid);
  const userData = userDataRaw ? JSON.parse(userDataRaw) as UserData : null;
  const previouslySelectedEnv = userData?.selectedEnvironments?.[projectSlug];

  // ensure that the previously selected environment is still valid
  if (previouslySelectedEnv && environments.find(e => e.subId === previouslySelectedEnv)) {
    return previouslySelectedEnv;
  }
  return defaultSubId;
}