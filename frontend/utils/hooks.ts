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

  let [environment, setEnvironment] = useState<Environment>();

  const { environmentData: environments, error: environmentsError } = useEnvironments(projectSlug);
  useEffect(() => {
    if (!environmentSubId && environments) {
      router.replace(`${router.pathname}?project=${projectSlug}&environment=${environments[0].subId}`, undefined, { shallow: true });
    } else if (!environment && environments) {
      setEnvironment(environments.find(e => e.subId === environmentSubId));
    } else if (environments && environment?.subId !== environmentSubId) {
      setEnvironment(environments.find(e => e.subId === environmentSubId));
    }
  }, [environmentSubId, projectSlug, environments, environment]);

  return { environment, project, environments };
}