import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { api } from '@/utils/api';

import { useProjectSelector } from './selected-project';

type Projects = Api.Query.Output<'/projects/list'>;

export function useProject(projectSlug: string | undefined, enforceSelectedProject = true) {
  const router = useRouter();
  const { selectProject } = useProjectSelector();

  const { data: project, error } = useSWR(
    projectSlug ? ['/projects/getDetails' as const, projectSlug] : null,
    (path, slug) => {
      return api.query(path, { slug });
    },
  );

  useEffect(() => {
    router.prefetch('/projects');
  }, [router]);

  useEffect(() => {
    if (router.pathname !== '/projects') {
      if ([400, 403].includes(error?.statusCode) && enforceSelectedProject) {
        selectProject(undefined);
        window.sessionStorage.setItem('redirected', 'true');
        router.push('/projects');
      }
    }
  }, [error, router, selectProject, enforceSelectedProject]);

  return { project, error };
}

export function useProjects() {
  const { identity } = useAuth();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/projects/list' as const, identity.uid] : null, (path) => {
    return api.query(path, undefined);
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
