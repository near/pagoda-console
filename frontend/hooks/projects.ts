import mixpanel from 'mixpanel-browser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';

export async function ejectTutorial(slug: string, name: string) {
  try {
    await authenticatedPost('/projects/ejectTutorial', { slug });
    mixpanel.track('DC Eject Tutorial Project', {
      status: 'success',
      name,
    });
    return true;
  } catch (e: any) {
    mixpanel.track('DC Eject Tutorial Project', {
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
    mixpanel.track('DC Remove Project', {
      status: 'success',
      name,
    });
    // Update the SWR cache before a refetch for better UX.
    mutate<Project[]>(userId ? ['/projects/list', userId] : null, async (projects) => {
      return projects?.filter((p) => p.slug !== slug);
    });
    return true;
  } catch (e: any) {
    mixpanel.track('DC Remove Project', {
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

  useEffect(() => {
    router.prefetch('/projects');
  }, [router]);

  const { data: project, error } = useSWR<Project>(
    identity && projectSlug ? ['/projects/getDetails', projectSlug, identity.uid] : null,
    (key, projectSlug) => {
      return authenticatedPost(key, { slug: projectSlug });
    },
  );

  if ([400, 403].includes(error?.statusCode)) {
    window.sessionStorage.setItem('redirected', 'true');
    router.push('/projects');
  }

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
