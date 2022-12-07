import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';

import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';

import { useProjectSelector } from './selected-project';

export async function ejectTutorial(slug: string, name: string) {
  try {
    await fetchApi(['/projects/ejectTutorial', { slug }]);
    analytics.track('DC Eject Tutorial Project', {
      status: 'success',
      name,
    });
    return true;
  } catch (e: any) {
    analytics.track('DC Eject Tutorial Project', {
      status: 'failure',
      name,
      error: e.message,
    });
    // TODO
    console.error('Failed to eject tutorial project');
  }
  return false;
}

type Projects = Api.Query.Output<'/projects/list'>;

export async function deleteProject(userId: string | undefined, slug: string, name: string) {
  try {
    await fetchApi(['/projects/delete', { slug }]);
    analytics.track('DC Remove Project', {
      status: 'success',
      name,
    });
    // Update the SWR cache before a refetch for better UX.
    mutate<Projects>(userId ? ['/projects/list', userId] : null, async (projects) => {
      return projects?.filter((p) => p.slug !== slug);
    });
    return true;
  } catch (e: any) {
    analytics.track('DC Remove Project', {
      status: 'failure',
      name,
      error: e.message,
    });
    // TODO
    console.error('Failed to delete project');
  }
  return false;
}

export function useProject(projectSlug: string | undefined) {
  const router = useRouter();
  const { identity } = useAuth();
  const { selectProject } = useProjectSelector();

  const { data: project, error } = useSWR(
    projectSlug ? ['/projects/getDetails' as const, projectSlug] : null,
    (key, projectSlug) => fetchApi([key, { slug: projectSlug }]),
  );

  useEffect(() => {
    router.prefetch('/projects');
  }, [router]);

  useEffect(() => {
    if (router.pathname !== '/projects') {
      if ([400, 403].includes(error?.statusCode)) {
        selectProject(undefined);
        window.sessionStorage.setItem('redirected', 'true');
        router.push('/projects');
      }
    }
  }, [error, router, selectProject]);

  return { project, error };
}

export function useProjects() {
  const { identity } = useAuth();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/projects/list' as const, identity.uid] : null, (key) => {
    return fetchApi([key]);
  });

  return { projects, error, mutate, isValidating };
}

export function useProjectGroups() {
  const { projects, error, isValidating, mutate } = useProjects();
  return {
    projectGroups: projects
      ? Object.entries(
          projects.reduce<Record<string, Projects>>((acc, project) => {
            const orgName = project.org.isPersonal ? 'Personal' : project.org.name;
            if (!acc[orgName]) {
              acc[orgName] = [];
            }
            acc[orgName].push(project);
            return acc;
          }, {}),
        ).sort(([, [projectA]], [, [projectB]]) => {
          if (projectA.org.isPersonal && projectB.org.isPersonal) {
            return 0;
          }
          if (projectA.org.isPersonal) {
            return -1;
          }
          if (projectB.org.isPersonal) {
            return 1;
          }
          return projectA.name.localeCompare(projectB.name);
        })
      : undefined,
    error,
    isValidating,
    mutate,
  };
}
