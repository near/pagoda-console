import type { Api } from '@pc/common/types/api';
import type { Projects, Users } from '@pc/common/types/core';
import useSWR from 'swr';
import { mutate } from 'swr';

import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';

export async function ejectTutorial(slug: Projects.ProjectSlug, name: string) {
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

type Projects = Api.Query.Output<'/projects/list'>;

export async function deleteProject(userId: Users.UserUid | undefined, slug: Projects.ProjectSlug, name: string) {
  try {
    await authenticatedPost('/projects/delete', { slug });
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

export function useProject(projectSlug: Projects.ProjectSlug) {
  const { data: project, error } = useSWR(['/projects/getDetails' as const, projectSlug], (key, projectSlug) => {
    return authenticatedPost(key, { slug: projectSlug });
  });

  return { project, error };
}

export const useMaybeProject = (projectSlug: Projects.ProjectSlug | undefined) => {
  const { data: project, error } = useSWR(
    projectSlug ? ['/projects/getDetails' as const, projectSlug] : null,
    (key, projectSlug) => authenticatedPost(key, { slug: projectSlug }),
  );

  return { project, error };
};

export function useProjects() {
  const { identity } = useAuth();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/projects/list' as const, identity.uid] : null, (key) => {
    return authenticatedPost(key);
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
