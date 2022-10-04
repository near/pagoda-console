import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';

import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';

import { useProjectSelector } from './selected-project';

export async function ejectTutorial(slug: string, name: string) {
  try {
    await authenticatedPost('/projects/ejectTutorial', { slug });
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

export async function deleteProject(userId: string | undefined, slug: string, name: string) {
  try {
    await authenticatedPost('/projects/delete', { slug });
    analytics.track('DC Remove Project', {
      status: 'success',
      name,
    });
    // Update the SWR cache before a refetch for better UX.
    mutate<Project[]>(userId ? ['/projects/list', userId] : null, async (projects) => {
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
  const identity = useIdentity();
  const { selectProject } = useProjectSelector();

  const { data: project, error } = useSWR<Project>(
    identity && projectSlug ? ['/projects/getDetails', projectSlug, identity.uid] : null,
    (key, projectSlug) => {
      return authenticatedPost(key, { slug: projectSlug });
    },
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
  const identity = useIdentity();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR<Project[]>(identity ? ['/projects/list', identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { projects, error, mutate, isValidating };
}

export function useProjectGroups() {
  const { projects, error, isValidating, mutate } = useProjects();
  return {
    projectGroups: projects
      ? Object.entries(
          projects.reduce<Record<string, Project[]>>((acc, project) => {
            const orgName = project.org.isPersonal ? 'Personal' : project.org.name || 'unknown';
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
