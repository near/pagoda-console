import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

type Projects = Api.Query.Output<'/projects/list'>;

export function useProject(projectSlug: Projects.ProjectSlug) {
  const { data: project, error } = useSWR(['/projects/getDetails' as const, projectSlug], (key, projectSlug) => {
    return fetchApi([key, { slug: projectSlug }]);
  });

  return { project, error };
}

export const useMaybeProject = (projectSlug: Projects.ProjectSlug | undefined) => {
  const { data: project, error } = useSWR(
    projectSlug ? ['/projects/getDetails' as const, projectSlug] : null,
    (key, projectSlug) => fetchApi([key, { slug: projectSlug }]),
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
