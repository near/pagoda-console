import { useRouter } from 'next/router';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import useSWR from 'swr';

import { Spinner } from '@/components/lib/Spinner';
import { useAuth } from '@/hooks/auth';
import { useMaybeProjectContext } from '@/hooks/project-context';
import config from '@/utils/config';
import { fetchApi } from '@/utils/http';
import type { NextPageWithLayout } from '@/utils/types';

const useRedirectIfProjectDoesNotExist = () => {
  const { projectSlug, updateContext } = useMaybeProjectContext();
  const router = useRouter();
  const { error } = useSWR(projectSlug ? ['/projects/getDetails' as const, projectSlug] : null, (key, projectSlug) =>
    fetchApi([key, { slug: projectSlug }]),
  );
  useEffect(() => {
    if (!projectSlug) {
      return;
    }
    if (router.pathname !== '/projects' && [400, 403].includes(error?.statusCode)) {
      updateContext(undefined, null);
      window.sessionStorage.setItem('redirected', 'true');
      router.push('/projects');
    }
  }, [projectSlug, error, router, updateContext]);
};

const useRedirectIfNoProjectSelected = () => {
  const { projectSlug } = useMaybeProjectContext();
  const router = useRouter();
  const { identity } = useAuth();
  useEffect(() => {
    if (!identity) {
      return;
    }
    if (!projectSlug) {
      if (config.deployEnv === 'LOCAL') {
        console.warn('The following router abort error can be safely ignored in local dev mode:');
        /*
          Next Router throws a harmless error when router.replace() is called rapidly in dev mode.
          We can safely ignore this for now. Let's keep an eye on Next Router and React updates.
        */
      }

      router.replace('/projects');
    }
  }, [identity, router, projectSlug]);
};

export const withSelectedProject = <P,>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'unknown';

  const ComponentWithSelectedProject = (props: P) => {
    const { projectSlug, environmentSubId } = useMaybeProjectContext();
    // Conditionally redirect in case project does not exist
    useRedirectIfProjectDoesNotExist();
    // Conditionally redirect to force user to select project
    useRedirectIfNoProjectSelected();
    if (projectSlug === undefined || environmentSubId === undefined) {
      return <Spinner />;
    }
    return <Component {...(props as P & JSX.IntrinsicAttributes)} />;
  };

  ComponentWithSelectedProject.displayName = `withSelectedProject(${displayName})`;
  ComponentWithSelectedProject.getLayout = (Component as NextPageWithLayout).getLayout;

  return ComponentWithSelectedProject;
};